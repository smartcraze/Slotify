import { z } from "zod";

import { ianaTimeZoneSchema } from "@/types/api/common";

const time24HourSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
  message: "Time must use HH:mm format",
});

const availabilityDaysSchema = z
  .array(z.number().int().min(0).max(6))
  .min(1)
  .max(7)
  .transform((days) => Array.from(new Set(days)).sort((a, b) => a - b));

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
  eventTypeName: z.string().trim().min(1).max(120).default("30-min Intro"),
  eventTypeSlug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{3,80}$/)
    .default("intro-call"),
  eventTypeDescription: z.string().trim().max(1000).optional(),
  eventDurationMinutes: z.number().int().min(15).max(240).default(30),
  availabilityDays: availabilityDaysSchema.default([1, 2, 3, 4, 5]),
  availabilityStartTime: time24HourSchema.default("09:00"),
  availabilityEndTime: time24HourSchema.default("17:00"),
}).refine((value) => value.availabilityStartTime < value.availabilityEndTime, {
  path: ["availabilityEndTime"],
  message: "End time must be later than start time",
});

export type OnboardingCompleteBody = z.infer<typeof onboardingCompleteBodySchema>;
