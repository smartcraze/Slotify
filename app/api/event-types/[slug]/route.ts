import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api/response";
import { parseParams, parseQuery } from "@/lib/api/validation";
import {
  eventTypeHostQuerySchema,
  eventTypeSlugParamsSchema,
} from "@/types/api/event-types";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const parsedParams = parseParams(params, eventTypeSlugParamsSchema);

  if (!parsedParams.success) {
    return fail("BAD_REQUEST", "Invalid route params", 400, parsedParams.details);
  }

  const parsedQuery = parseQuery(request.nextUrl.searchParams, eventTypeHostQuerySchema);

  if (!parsedQuery.success) {
    return fail("BAD_REQUEST", "Invalid query parameters", 400, parsedQuery.details);
  }

  const eventType = await prisma.eventType.findUnique({
    where: {
      hostId_slug: {
        hostId: parsedQuery.data.hostId,
        slug: parsedParams.data.slug,
      },
    },
  });

  if (!eventType) {
    return fail("NOT_FOUND", "Event type not found", 404);
  }

  return ok(eventType);
}

export const dynamic = "force-dynamic";
export const maxDuration = 30;
