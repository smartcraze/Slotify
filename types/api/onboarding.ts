import { z } from "zod";

import { ianaTimeZoneSchema } from "@/types/api/common";

export const onboardingCompleteBodySchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{3,32}$/, {
      message:
        "Username must be 3-32 chars and use lowercase letters, numbers, and hyphens",
    }),
  timezone: ianaTimeZoneSchema.optional(),
  name: z.string().trim().min(1).max(80).optional(),
  bio: z.string().trim().max(280).optional(),
});

export type OnboardingCompleteBody = z.infer<typeof onboardingCompleteBodySchema>;
