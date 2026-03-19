import { z } from "zod";

import {
  cuidSchema,
  ianaTimeZoneSchema,
  isoUtcDateTimeSchema,
  ymdDateSchema,
} from "@/types/api/common";

export const availabilityQuerySchema = z
  .object({
    hostId: cuidSchema,
    eventTypeId: cuidSchema,
    startDate: ymdDateSchema,
    endDate: ymdDateSchema,
    timezone: ianaTimeZoneSchema.optional(),
  })
  .refine((value) => value.startDate <= value.endDate, {
    message: "startDate must be less than or equal to endDate",
    path: ["startDate"],
  });

export const availabilitySlotSchema = z.object({
  startTimeUtc: isoUtcDateTimeSchema,
  endTimeUtc: isoUtcDateTimeSchema,
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>;
