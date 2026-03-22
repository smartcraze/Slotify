import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api/response";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import { createAndSendBookingNotification } from "@/lib/notifications/booking-email";
import { createGoogleMeetEventForBooking } from "@/lib/integrations/google-calendar";
import { canUserAccessFeature } from "@/lib/subscription/access";
import {
  isPrismaUniqueConstraintError,
  parseJsonBody,
  parseQuery,
} from "@/lib/api/validation";
import {
  createBookingBodySchema,
  listBookingsQuerySchema,
} from "@/types/api/bookings";

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return fail("UNAUTHORIZED", "Authentication required", 401);
  }

  const hasCoreScheduling = await canUserAccessFeature(userId, "CORE_SCHEDULING");

  if (!hasCoreScheduling) {
    return fail(
      "PAYMENT_REQUIRED",
      "An active paid subscription is required to access bookings",
      402
    );
  }

  const parsedQuery = parseQuery(request.nextUrl.searchParams, listBookingsQuerySchema);

  if (!parsedQuery.success) {
    return fail("BAD_REQUEST", "Invalid query parameters", 400, parsedQuery.details);
  }

  const whereClause = {
    hostId: userId,
    eventTypeId: parsedQuery.data.eventTypeId,
    status: parsedQuery.data.status,
    ...(parsedQuery.data.startDate || parsedQuery.data.endDate
      ? {
          startTimeUtc: {
            gte: parsedQuery.data.startDate
              ? new Date(`${parsedQuery.data.startDate}T00:00:00.000Z`)
              : undefined,
            lte: parsedQuery.data.endDate
              ? new Date(`${parsedQuery.data.endDate}T23:59:59.999Z`)
              : undefined,
          },
        }
      : {}),
  };

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: {
      attendees: true,
      eventType: true,
    },
    orderBy: {
      startTimeUtc: "asc",
    },
  });

  return ok(bookings);
}

export async function POST(request: NextRequest) {
  const parsedBody = await parseJsonBody(request, createBookingBodySchema);

  if (!parsedBody.success) {
    return fail("BAD_REQUEST", "Invalid request body", 400, parsedBody.details);
  }

  const hasCoreScheduling = await canUserAccessFeature(
    parsedBody.data.hostId,
    "CORE_SCHEDULING"
  );

  if (!hasCoreScheduling) {
    return fail(
      "PAYMENT_REQUIRED",
      "Host must have an active paid subscription to accept bookings",
      402
    );
  }

  const linkedGoogleAccount = await prisma.account.findFirst({
    where: { userId: parsedBody.data.hostId, providerId: "google" },
    select: { id: true },
  });

  const eventType = await prisma.eventType.findFirst({
    where: {
      id: parsedBody.data.eventTypeId,
      hostId: parsedBody.data.hostId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      duration: true,
      name: true,
      host: {
        select: {
          name: true,
          email: true,
          timezone: true,
        },
      },
    },
  });

  if (!eventType) {
    return fail("NOT_FOUND", "Event type not found for host", 404);
  }

  const durationMinutes =
    (new Date(parsedBody.data.endTimeUtc).getTime() -
      new Date(parsedBody.data.startTimeUtc).getTime()) /
    60000;

  if (durationMinutes !== eventType.duration) {
    return fail("BAD_REQUEST", "Requested slot does not match event duration", 400);
  }

  try {
    let booking = await prisma.booking.create({
      data: {
        hostId: parsedBody.data.hostId,
        eventTypeId: parsedBody.data.eventTypeId,
        startTimeUtc: new Date(parsedBody.data.startTimeUtc),
        endTimeUtc: new Date(parsedBody.data.endTimeUtc),
        guestEmail: parsedBody.data.guestEmail,
        guestName: parsedBody.data.guestName,
        guestNotes: parsedBody.data.guestNotes,
        status: "CONFIRMED",
        attendees: {
          create: {
            email: parsedBody.data.guestEmail,
            name: parsedBody.data.guestName,
            timezone: parsedBody.data.attendeeTimezone,
          },
        },
      },
      include: {
        attendees: true,
        eventType: true,
      },
    });

    const integrationStatus = {
      calendar: {
        attempted: Boolean(linkedGoogleAccount),
        success: false,
        message: linkedGoogleAccount
          ? "Google Meet generation has not completed"
          : "Host has not connected Google Calendar",
      },
      email: {
        sent: false,
        message: "Email delivery has not completed",
      },
    };

    if (linkedGoogleAccount) {
      try {
        const calendarEvent = await createGoogleMeetEventForBooking({
          bookingId: booking.id,
          hostId: parsedBody.data.hostId,
          hostEmail: eventType.host?.email ?? null,
          hostTimezone: eventType.host?.timezone ?? "UTC",
          eventTypeName: eventType.name,
          guestEmail: booking.guestEmail,
          guestName: booking.guestName,
          guestNotes: booking.guestNotes,
          startTimeUtc: booking.startTimeUtc,
          endTimeUtc: booking.endTimeUtc,
        });

        const meetingLink = calendarEvent?.meetLink ?? calendarEvent?.htmlLink ?? null;
        const googleCalendarEventId = calendarEvent?.eventId ?? null;

        if (meetingLink || googleCalendarEventId) {
          booking = await prisma.booking.update({
            where: { id: booking.id },
            data: {
              meetingLink: meetingLink ?? booking.meetingLink,
              googleCalendarEventId:
                googleCalendarEventId ?? booking.googleCalendarEventId,
            },
            include: {
              attendees: true,
              eventType: true,
            },
          });

          integrationStatus.calendar.success = Boolean(meetingLink);
          integrationStatus.calendar.message = meetingLink
            ? "Google Meet link generated"
            : "Google Calendar event created, waiting for Meet link";
        } else {
          integrationStatus.calendar.success = false;
          if (
            calendarEvent?.errorCode === "GOOGLE_REAUTH_REQUIRED" ||
            calendarEvent?.errorCode === "GOOGLE_TOKEN_REFRESH_FAILED" ||
            calendarEvent?.errorCode === "TOKEN_UNAVAILABLE"
          ) {
            integrationStatus.calendar.message =
              "Booking confirmed. Calendar invite sync is delayed because host Google Calendar needs reconnection.";
          } else {
            integrationStatus.calendar.message =
              calendarEvent?.errorMessage ?? "Google Calendar event was not created";
          }
        }
      } catch (calendarError) {
        integrationStatus.calendar.success = false;
        integrationStatus.calendar.message = "Failed to create Google Calendar event";
        console.error("Failed to create Google Calendar event for booking", {
          bookingId: booking.id,
          calendarError,
        });
      }
    }

    try {
      const emailResult = await createAndSendBookingNotification({
        bookingId: booking.id,
        userId: parsedBody.data.hostId,
        type: "BOOKING_CONFIRMATION",
        recipient: booking.guestEmail,
        eventTypeName: eventType.name,
        startTimeUtc: booking.startTimeUtc,
        endTimeUtc: booking.endTimeUtc,
        meetingLink: booking.meetingLink,
        hostName: eventType.host?.name ?? null,
      });

      integrationStatus.email.sent = emailResult.sent;
      integrationStatus.email.message =
        emailResult.reason ?? (emailResult.sent ? "Booking email sent" : "Email delivery failed");
    } catch (notificationError) {
      integrationStatus.email.sent = false;
      integrationStatus.email.message = "Failed to send booking confirmation email";
      console.error("Failed to send booking confirmation email", {
        bookingId: booking.id,
        notificationError,
      });
    }

    return ok(
      {
        ...booking,
        integrationStatus,
      },
      201
    );
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      return fail(
        "CONFLICT",
        "This slot was just booked by someone else. Please choose another slot.",
        409
      );
    }

    return fail("INTERNAL_SERVER_ERROR", "Failed to create booking", 500);
  }
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
