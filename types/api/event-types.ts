import { z } from "zod";

import { cuidSchema } from "@/types/api/common";

export const eventTypeSlugParamsSchema = z.object({
  slug: z.string().trim().min(1),
});

export const eventTypeHostQuerySchema = z.object({
  hostId: cuidSchema,
});

export const eventTypeStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const createEventTypeBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug must contain lowercase letters, numbers, and hyphens only",
    }),
  duration: z.number().int().positive().max(480).default(30),
  bufferBefore: z.number().int().min(0).max(240).default(0),
  bufferAfter: z.number().int().min(0).max(240).default(0),
  minNoticeMinutes: z.number().int().min(0).max(10080).default(0),
  maxAdvanceDays: z.number().int().min(1).max(365).default(365),
  dailyCapacity: z.number().int().min(1).max(500).default(999),
  isPublic: z.boolean().default(true),
  color: z.string().trim().max(40).optional(),
  status: eventTypeStatusSchema.default("ACTIVE"),
});

export type EventTypeSlugParams = z.infer<typeof eventTypeSlugParamsSchema>;
export type EventTypeHostQuery = z.infer<typeof eventTypeHostQuerySchema>;
export type CreateEventTypeBody = z.infer<typeof createEventTypeBodySchema>;
