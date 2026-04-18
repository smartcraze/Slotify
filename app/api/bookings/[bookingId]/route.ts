import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api/response";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createAndSendBookingNotification } from "@/lib/notifications/booking-email";
import {
  cancelGoogleCalendarEventForBooking,
  createGoogleMeetEventForBooking,
  updateGoogleCalendarEventForBooking,
} from "@/lib/integrations/google-calendar";
import { canUserAccessFeature } from "@/lib/subscription/access";
import {
  isPrismaUniqueConstraintError,
  parseJsonBody,
  parseParams,
} from "@/lib/api/validation";
import {
  bookingParamsSchema,
  updateBookingBodySchema,
} from "@/types/api/bookings";

type RouteContext = {
  params: Promise<{ bookingId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return fail("UNAUTHORIZED", "Authentication required", 401);
  }

  if (user.isGuest) {
    return fail("FORBIDDEN", "Guest mode is view-only for booking updates", 403);
  }

  const userId = user.id;

  const params = await context.params;
  const parsedParams = parseParams(params, bookingParamsSchema);

  if (!parsedParams.success) {
    return fail("BAD_REQUEST", "Invalid route params", 400, parsedParams.details);
  }

  const parsedBody = await parseJsonBody(request, updateBookingBodySchema);

  if (!parsedBody.success) {
    return fail("BAD_REQUEST", "Invalid request body", 400, parsedBody.details);
  }

  const existingBooking = await prisma.booking.findUnique({
    where: { id: parsedParams.data.bookingId },
    include: {
      eventType: {
        select: { id: true, name: true, duration: true },
      },
      host: {
        select: { name: true, email: true, timezone: true },
      },
    },
  });

  if (!existingBooking) {
    return fail("NOT_FOUND", "Booking not found", 404);
  }

  if (existingBooking.hostId !== userId) {
    return fail("FORBIDDEN", "You can only modify your own bookings", 403);
  }

  const hasCoreScheduling = await canUserAccessFeature(userId, "CORE_SCHEDULING");

  if (!hasCoreScheduling) {
    return fail(
      "PAYMENT_REQUIRED",
      "An active paid subscription is required to manage bookings",
      402
    );
  }

  const linkedGoogleAccount = await prisma.account.findFirst({
    where: { userId, providerId: "google" },
    select: { id: true },
  });

  try {
    if (parsedBody.data.action === "cancel") {
      const cancelledBooking = await prisma.booking.update({
        where: { id: existingBooking.id },
        data: {
          status: "CANCELLED",
          cancelReason: parsedBody.data.cancelReason,
          cancelledBy: parsedBody.data.cancelledBy ?? "host",
          cancelledAt: new Date(),
        },
      });

      if (linkedGoogleAccount && existingBooking.googleCalendarEventId) {
        try {
          const cancelledInCalendar = await cancelGoogleCalendarEventForBooking({
            hostId: userId,
            googleCalendarEventId: existingBooking.googleCalendarEventId,
          });

          if (!cancelledInCalendar) {
            console.error("Google Calendar event cancellation request was not successful", {
              bookingId: cancelledBooking.id,
              googleCalendarEventId: existingBooking.googleCalendarEventId,
            });
          }
        } catch (calendarError) {
          console.error("Failed to cancel Google Calendar event", {
            bookingId: cancelledBooking.id,
            googleCalendarEventId: existingBooking.googleCalendarEventId,
            calendarError,
          });
        }
      }

      try {
        await createAndSendBookingNotification({
          bookingId: cancelledBooking.id,
          userId,
          type: "BOOKING_CANCELLED",
          recipient: cancelledBooking.guestEmail,
          eventTypeName: existingBooking.eventType.name,
          startTimeUtc: cancelledBooking.startTimeUtc,
          endTimeUtc: cancelledBooking.endTimeUtc,
          meetingLink: cancelledBooking.meetingLink,
          hostName: existingBooking.host?.name ?? null,
        });
      } catch (notificationError) {
        console.error("Failed to send booking cancellation email", {
          bookingId: cancelledBooking.id,
          notificationError,
        });
      }

      return ok(cancelledBooking);
    }

    const rescheduledBooking = await prisma.booking.update({
      where: { id: existingBooking.id },
      data: {
        startTimeUtc: new Date(parsedBody.data.startTimeUtc),
        endTimeUtc: new Date(parsedBody.data.endTimeUtc),
        status: "RESCHEDULED",
      },
    });

    const rescheduledDurationMinutes =
      (rescheduledBooking.endTimeUtc.getTime() -
        rescheduledBooking.startTimeUtc.getTime()) /
      60000;

    if (rescheduledDurationMinutes !== existingBooking.eventType.duration) {
      return fail(
        "BAD_REQUEST",
        "Requested slot does not match event duration",
        400
      );
    }

    let syncedBooking = rescheduledBooking;

    try {
      let calendarEventResult: {
        eventId: string | null;
        htmlLink: string | null;
        meetLink: string | null;
      } | null = null;

      if (linkedGoogleAccount && existingBooking.googleCalendarEventId) {
        calendarEventResult = await updateGoogleCalendarEventForBooking({
          hostId: userId,
          googleCalendarEventId: existingBooking.googleCalendarEventId,
          hostEmail: existingBooking.host?.email ?? null,
          hostTimezone: existingBooking.host?.timezone ?? "UTC",
          eventTypeName: existingBooking.eventType.name,
          guestEmail: rescheduledBooking.guestEmail,
          guestName: rescheduledBooking.guestName,
          guestNotes: rescheduledBooking.guestNotes,
          startTimeUtc: rescheduledBooking.startTimeUtc,
          endTimeUtc: rescheduledBooking.endTimeUtc,
        });

        if (!calendarEventResult) {
          calendarEventResult = await createGoogleMeetEventForBooking({
            bookingId: rescheduledBooking.id,
            hostId: userId,
            hostEmail: existingBooking.host?.email ?? null,
            hostTimezone: existingBooking.host?.timezone ?? "UTC",
            eventTypeName: existingBooking.eventType.name,
            guestEmail: rescheduledBooking.guestEmail,
            guestName: rescheduledBooking.guestName,
            guestNotes: rescheduledBooking.guestNotes,
            startTimeUtc: rescheduledBooking.startTimeUtc,
            endTimeUtc: rescheduledBooking.endTimeUtc,
          });

          if (
            calendarEventResult?.eventId &&
            calendarEventResult.eventId !== existingBooking.googleCalendarEventId
          ) {
            try {
              await cancelGoogleCalendarEventForBooking({
                hostId: userId,
                googleCalendarEventId: existingBooking.googleCalendarEventId,
              });
            } catch (calendarError) {
              console.error("Failed to cancel stale Google Calendar event after fallback", {
                bookingId: rescheduledBooking.id,
                staleGoogleCalendarEventId: existingBooking.googleCalendarEventId,
                calendarError,
              });
            }
          }
        }
      } else if (linkedGoogleAccount) {
        calendarEventResult = await createGoogleMeetEventForBooking({
          bookingId: rescheduledBooking.id,
          hostId: userId,
          hostEmail: existingBooking.host?.email ?? null,
          hostTimezone: existingBooking.host?.timezone ?? "UTC",
          eventTypeName: existingBooking.eventType.name,
          guestEmail: rescheduledBooking.guestEmail,
          guestName: rescheduledBooking.guestName,
          guestNotes: rescheduledBooking.guestNotes,
          startTimeUtc: rescheduledBooking.startTimeUtc,
          endTimeUtc: rescheduledBooking.endTimeUtc,
        });
      }

      const meetingLink =
        calendarEventResult?.meetLink ?? calendarEventResult?.htmlLink ?? null;

      if (meetingLink || calendarEventResult?.eventId) {
        syncedBooking = await prisma.booking.update({
          where: { id: rescheduledBooking.id },
          data: {
            meetingLink: meetingLink ?? syncedBooking.meetingLink,
            googleCalendarEventId:
              calendarEventResult?.eventId ?? syncedBooking.googleCalendarEventId,
          },
        });
      } else {
        console.error("Google Calendar sync returned no event details on reschedule", {
          bookingId: rescheduledBooking.id,
        });
      }

      if (
        linkedGoogleAccount &&
        existingBooking.googleCalendarEventId &&
        calendarEventResult?.eventId &&
        existingBooking.googleCalendarEventId !== calendarEventResult.eventId
      ) {
        try {
          await cancelGoogleCalendarEventForBooking({
            hostId: userId,
            googleCalendarEventId: existingBooking.googleCalendarEventId,
          });
        } catch (calendarError) {
          console.error("Failed to cancel previous Google Calendar event", {
            bookingId: rescheduledBooking.id,
            previousGoogleCalendarEventId: existingBooking.googleCalendarEventId,
            calendarError,
          });
        }
      }
    } catch (calendarError) {
      console.error("Failed to sync Google Calendar event on reschedule", {
        bookingId: rescheduledBooking.id,
        calendarError,
      });
    }

    try {
      await createAndSendBookingNotification({
        bookingId: syncedBooking.id,
        userId,
        type: "BOOKING_RESCHEDULED",
        recipient: syncedBooking.guestEmail,
        eventTypeName: existingBooking.eventType.name,
        startTimeUtc: syncedBooking.startTimeUtc,
        endTimeUtc: syncedBooking.endTimeUtc,
        meetingLink: syncedBooking.meetingLink,
        hostName: existingBooking.host?.name ?? null,
      });
    } catch (notificationError) {
      console.error("Failed to send booking rescheduled email", {
        bookingId: syncedBooking.id,
        notificationError,
      });
    }

    return ok(syncedBooking);
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      return fail(
        "CONFLICT",
        "This new slot is no longer available. Please choose another time.",
        409
      );
    }

    return fail("INTERNAL_SERVER_ERROR", "Failed to update booking", 500);
  }
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
