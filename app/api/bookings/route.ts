import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api/response";
import { getAuthenticatedUserId } from "@/lib/auth/session";
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
      payment: true,
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

  const eventType = await prisma.eventType.findFirst({
    where: {
      id: parsedBody.data.eventTypeId,
      hostId: parsedBody.data.hostId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      duration: true,
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
    const booking = await prisma.booking.create({
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
        notificationLogs: {
          create: {
            userId: parsedBody.data.hostId,
            type: "BOOKING_CONFIRMATION",
            status: "PENDING",
            channel: "EMAIL",
            recipient: parsedBody.data.guestEmail,
          },
        },
      },
      include: {
        attendees: true,
        eventType: true,
      },
    });

    return ok(booking, 201);
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
