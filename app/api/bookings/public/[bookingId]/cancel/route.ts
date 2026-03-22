import { NextRequest } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/lib/api/response";
import { parseJsonBody, parseParams } from "@/lib/api/validation";
import { cancelGoogleCalendarEventForBooking } from "@/lib/integrations/google-calendar";
import { createAndSendBookingNotification } from "@/lib/notifications/booking-email";
import { prisma } from "@/lib/prisma";

const cancelBookingParamsSchema = z.object({
  bookingId: z.string().min(1),
});

const cancelBookingBodySchema = z.object({
  guestEmail: z.string().trim().email(),
  cancelReason: z.string().trim().min(1).max(500),
});

type RouteContext = {
  params: Promise<{ bookingId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const parsedParams = parseParams(params, cancelBookingParamsSchema);

  if (!parsedParams.success) {
    return fail("BAD_REQUEST", "Invalid route params", 400, parsedParams.details);
  }

  const parsedBody = await parseJsonBody(request, cancelBookingBodySchema);

  if (!parsedBody.success) {
    return fail("BAD_REQUEST", "Invalid request body", 400, parsedBody.details);
  }

  const booking = await prisma.booking.findUnique({
    where: { id: parsedParams.data.bookingId },
    include: {
      eventType: {
        select: {
          name: true,
        },
      },
      host: {
        select: {
          id: true,
          name: true,
          timezone: true,
        },
      },
    },
  });

  if (!booking) {
    return fail("NOT_FOUND", "Booking not found", 404);
  }

  if (booking.guestEmail.toLowerCase() !== parsedBody.data.guestEmail.toLowerCase()) {
    return fail("FORBIDDEN", "You can only cancel your own booking", 403);
  }

  if (booking.status === "CANCELLED") {
    return ok(booking);
  }

  const cancelledBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: "CANCELLED",
      cancelReason: parsedBody.data.cancelReason,
      cancelledBy: "guest",
      cancelledAt: new Date(),
    },
  });

  if (booking.googleCalendarEventId) {
    try {
      await cancelGoogleCalendarEventForBooking({
        hostId: booking.hostId,
        googleCalendarEventId: booking.googleCalendarEventId,
      });
    } catch (calendarError) {
      console.error("Failed to cancel Google Calendar event from public endpoint", {
        bookingId: booking.id,
        googleCalendarEventId: booking.googleCalendarEventId,
        calendarError,
      });
    }
  }

  try {
    await createAndSendBookingNotification({
      bookingId: cancelledBooking.id,
      userId: booking.host.id,
      type: "BOOKING_CANCELLED",
      recipient: cancelledBooking.guestEmail,
      eventTypeName: booking.eventType.name,
      startTimeUtc: cancelledBooking.startTimeUtc,
      endTimeUtc: cancelledBooking.endTimeUtc,
      meetingLink: cancelledBooking.meetingLink,
      hostName: booking.host.name ?? null,
    });
  } catch (notificationError) {
    console.error("Failed to send booking cancellation email from public endpoint", {
      bookingId: cancelledBooking.id,
      notificationError,
    });
  }

  return ok(cancelledBooking);
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
