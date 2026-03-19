import { NextRequest } from "next/server";

import { computeAvailability } from "@/lib/availability";
import { fail, ok } from "@/lib/api/response";
import { parseQuery } from "@/lib/api/validation";
import { availabilityQuerySchema } from "@/types/api/availability";

export async function GET(request: NextRequest) {
  const parsedQuery = parseQuery(request.nextUrl.searchParams, availabilityQuerySchema);

  if (!parsedQuery.success) {
    return fail("BAD_REQUEST", "Invalid query parameters", 400, parsedQuery.details);
  }

  const slots = await computeAvailability({
    hostId: parsedQuery.data.hostId,
    eventTypeId: parsedQuery.data.eventTypeId,
    startDate: parsedQuery.data.startDate,
    endDate: parsedQuery.data.endDate,
    timezoneOverride: parsedQuery.data.timezone,
  });

  return ok(slots);
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
