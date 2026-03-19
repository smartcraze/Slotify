import { addDays, addMinutes } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

import { prisma } from "@/lib/prisma";
import type { AvailabilitySlot } from "@/types/api/availability";

type ComputeAvailabilityInput = {
  hostId: string;
  eventTypeId: string;
  startDate: string;
  endDate: string;
  timezoneOverride?: string;
};

function listDateKeys(startDate: string, endDate: string) {
  const results: string[] = [];
  let current = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);

  while (current <= end) {
    results.push(current.toISOString().slice(0, 10));
    current = addDays(current, 1);
  }

  return results;
}

function toUtcFromHostDateTime(dateKey: string, time: string, timeZone: string) {
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return fromZonedTime(`${dateKey}T${normalizedTime}`, timeZone);
}

export async function computeAvailability(
  input: ComputeAvailabilityInput
): Promise<AvailabilitySlot[]> {
  const host = await prisma.user.findUnique({
    where: { id: input.hostId },
    select: { timezone: true },
  });

  const eventType = await prisma.eventType.findFirst({
    where: {
      id: input.eventTypeId,
      hostId: input.hostId,
      status: "ACTIVE",
    },
    select: {
      duration: true,
      bufferBefore: true,
      bufferAfter: true,
      minNoticeMinutes: true,
      maxAdvanceDays: true,
      dailyCapacity: true,
    },
  });

  if (!eventType) {
    return [];
  }

  const hostTimezone = input.timezoneOverride ?? host?.timezone ?? "UTC";
  const now = new Date();
  const minNoticeCutoff = addMinutes(now, eventType.minNoticeMinutes);
  const maxAdvanceCutoff = addDays(now, eventType.maxAdvanceDays);

  const rangeStartUtc = toUtcFromHostDateTime(
    input.startDate,
    "00:00",
    hostTimezone
  );
  const rangeEndUtc = toUtcFromHostDateTime(input.endDate, "23:59", hostTimezone);

  const [rules, bookings] = await Promise.all([
    prisma.availabilityRule.findMany({
      where: {
        hostId: input.hostId,
        isRecurring: true,
        OR: [{ eventTypeId: input.eventTypeId }, { eventTypeId: null }],
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.booking.findMany({
      where: {
        hostId: input.hostId,
        eventTypeId: input.eventTypeId,
        startTimeUtc: { gte: rangeStartUtc },
        endTimeUtc: { lte: rangeEndUtc },
        status: { in: ["PENDING", "CONFIRMED", "RESCHEDULED"] },
      },
      orderBy: { startTimeUtc: "asc" },
      select: {
        id: true,
        startTimeUtc: true,
        endTimeUtc: true,
      },
    }),
  ]);

  const dateKeys = listDateKeys(input.startDate, input.endDate);
  const availability: AvailabilitySlot[] = [];

  for (const dateKey of dateKeys) {
    const dayOfWeek = new Date(`${dateKey}T00:00:00.000Z`).getUTCDay();
    const rulesForDay = rules.filter((rule) => rule.dayOfWeek === dayOfWeek);

    if (rulesForDay.length === 0) {
      continue;
    }

    let generatedForDay = 0;

    for (const rule of rulesForDay) {
      if (generatedForDay >= eventType.dailyCapacity) {
        break;
      }

      const windowStart = toUtcFromHostDateTime(
        dateKey,
        rule.startTime,
        hostTimezone
      );
      const windowEnd = toUtcFromHostDateTime(dateKey, rule.endTime, hostTimezone);

      let cursor = windowStart;

      while (
        addMinutes(cursor, eventType.duration) <= windowEnd &&
        generatedForDay < eventType.dailyCapacity
      ) {
        const slotStart = cursor;
        const slotEnd = addMinutes(cursor, eventType.duration);

        if (slotStart < minNoticeCutoff || slotStart > maxAdvanceCutoff) {
          cursor = addMinutes(cursor, eventType.duration);
          continue;
        }

        const slotStartWithBuffer = addMinutes(slotStart, -eventType.bufferBefore);
        const slotEndWithBuffer = addMinutes(slotEnd, eventType.bufferAfter);

        const hasOverlap = bookings.some(
          (booking) =>
            slotStartWithBuffer < booking.endTimeUtc &&
            slotEndWithBuffer > booking.startTimeUtc
        );

        if (!hasOverlap) {
          availability.push({
            startTimeUtc: slotStart.toISOString(),
            endTimeUtc: slotEnd.toISOString(),
          });
          generatedForDay += 1;
        }

        cursor = addMinutes(cursor, eventType.duration);
      }
    }
  }

  return availability;
}
