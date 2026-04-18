import type { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api/response";
import {
  isPrismaUniqueConstraintError,
  parseJsonBody,
} from "@/lib/api/validation";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { onboardingCompleteBodySchema } from "@/types/api/onboarding";

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return fail("UNAUTHORIZED", "Authentication required", 401);
  }

  if (user.isGuest) {
    return fail("FORBIDDEN", "Guest mode is view-only for onboarding changes", 403);
  }

  const userId = user.id;

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
            name: parsedBody.data.eventTypeName,
            slug: parsedBody.data.eventTypeSlug,
            description:
              parsedBody.data.eventTypeDescription || "A short introduction call",
            duration: parsedBody.data.eventDurationMinutes,
            status: "ACTIVE",
            isPublic: true,
          },
        });
      }

      if (availabilityCount === 0) {
        await tx.availabilityRule.createMany({
          data: parsedBody.data.availabilityDays.map((dayOfWeek) => ({
            hostId: userId,
            dayOfWeek,
            startTime: parsedBody.data.availabilityStartTime,
            endTime: parsedBody.data.availabilityEndTime,
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
      publicProfilePath: `/${result.username}`,
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
