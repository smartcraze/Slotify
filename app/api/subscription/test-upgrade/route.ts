import { addDays } from "date-fns";
import { z } from "zod";

import { fail, ok } from "@/lib/api/response";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const bodySchema = z
  .object({
    tier: z.enum(["STARTER", "PRO", "ENTERPRISE"]).default("PRO"),
    days: z.number().int().min(1).max(3650).default(365),
  })
  .optional();

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return fail("UNAUTHORIZED", "Authentication required", 401);
  }

  const rawBody = await request.json().catch(() => ({}));
  const parsedBody = bodySchema.safeParse(rawBody);

  if (!parsedBody.success) {
    return fail("BAD_REQUEST", "Invalid request body", 400, parsedBody.error.issues);
  }

  const now = new Date();
  const endsAt = addDays(now, parsedBody.data?.days ?? 365);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: parsedBody.data?.tier ?? "PRO",
      subscriptionStatus: "ACTIVE",
      subscriptionStartsAt: now,
      subscriptionEndsAt: endsAt,
    },
    select: {
      id: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      subscriptionStartsAt: true,
      subscriptionEndsAt: true,
    },
  });

  return ok({ user });
}

export const dynamic = "force-dynamic";
export const maxDuration = 30;
