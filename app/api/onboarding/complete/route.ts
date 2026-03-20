import type { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api/response";
import {
  isPrismaUniqueConstraintError,
  parseJsonBody,
} from "@/lib/api/validation";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { onboardingCompleteBodySchema } from "@/types/api/onboarding";

const DEFAULT_EVENT_SLUG = "intro-call";

const DEFAULT_RULES = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
];

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return fail("UNAUTHORIZED", "Authentication required", 401);
  }

  const parsedBody = await parseJsonBody(request, onboardingCompleteBodySchema);

  if (!parsedBody.success) {
    return fail("BAD_REQUEST", "Invalid request body", 400, parsedBody.details);
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const [eventTypeCount, availabilityCount] = await Promise.all([
        tx.eventType.count({ where: { hostId: userId } }),
        tx.availabilityRule.count({ where: { hostId: userId } }),
      ]);

      const user = await tx.user.update({
        where: { id: userId },
        data: {
          username: parsedBody.data.username,
          timezone: parsedBody.data.timezone,
          ...(parsedBody.data.name ? { name: parsedBody.data.name } : {}),
          ...(parsedBody.data.bio ? { bio: parsedBody.data.bio } : {}),
        },
        select: {
          username: true,
        },
      });

      if (eventTypeCount === 0) {
        await tx.eventType.create({
          data: {
            hostId: userId,
            name: "30-min Intro",
            slug: DEFAULT_EVENT_SLUG,
            description: "A short introduction call",
            duration: 30,
            status: "ACTIVE",
            isPublic: true,
          },
        });
      }

      if (availabilityCount === 0) {
        await tx.availabilityRule.createMany({
          data: DEFAULT_RULES.map((rule) => ({
            hostId: userId,
            dayOfWeek: rule.dayOfWeek,
            startTime: rule.startTime,
            endTime: rule.endTime,
            isRecurring: true,
          })),
          skipDuplicates: true,
        });
      }

      return {
        username: user.username,
      };
    });

    return ok({
      username: result.username,
      publicProfilePath: `/@${result.username}`,
    });
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      return fail("CONFLICT", "This username is already taken", 409);
    }

    return fail("INTERNAL_SERVER_ERROR", "Failed to complete onboarding", 500);
  }
}

export const dynamic = "force-dynamic";
export const maxDuration = 30;
