import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api/response";
import { getAuthenticatedUserId } from "@/lib/auth/session";
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
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return fail("UNAUTHORIZED", "Authentication required", 401);
  }

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
        select: { id: true },
      },
    },
  });

  if (!existingBooking) {
    return fail("NOT_FOUND", "Booking not found", 404);
  }

  if (existingBooking.hostId !== userId) {
    return fail("FORBIDDEN", "You can only modify your own bookings", 403);
  }

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

    return ok(rescheduledBooking);
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
