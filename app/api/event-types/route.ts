import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api/response";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import {
  isPrismaUniqueConstraintError,
  parseJsonBody,
} from "@/lib/api/validation";
import { createEventTypeBodySchema } from "@/types/api/event-types";

export async function GET() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return fail("UNAUTHORIZED", "Authentication required", 401);
  }

  const eventTypes = await prisma.eventType.findMany({
    where: {
      hostId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return ok(eventTypes);
}

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return fail("UNAUTHORIZED", "Authentication required", 401);
  }

  const parsedBody = await parseJsonBody(request, createEventTypeBodySchema);

  if (!parsedBody.success) {
    return fail("BAD_REQUEST", "Invalid request body", 400, parsedBody.details);
  }

  try {
    const eventType = await prisma.eventType.create({
      data: {
        ...parsedBody.data,
        hostId: userId,
      },
    });

    return ok(eventType, 201);
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      return fail(
        "CONFLICT",
        "An event type with this slug already exists for this host",
        409
      );
    }

    return fail("INTERNAL_SERVER_ERROR", "Failed to create event type", 500);
  }
}

export const dynamic = "force-dynamic";
export const maxDuration = 30;
