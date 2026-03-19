import { z } from "zod";

import { cuidSchema, isoUtcDateTimeSchema } from "@/types/api/common";

export const createBookingBodySchema = z
  .object({
    hostId: cuidSchema,
    eventTypeId: cuidSchema,
    startTimeUtc: isoUtcDateTimeSchema,
    endTimeUtc: isoUtcDateTimeSchema,
    guestEmail: z.string().email(),
    guestName: z.string().trim().min(1).max(120).optional(),
    guestNotes: z.string().trim().max(2000).optional(),
    attendeeTimezone: z.string().trim().min(1).default("UTC"),
  })
  .refine(
    (value) =>
      new Date(value.endTimeUtc).getTime() >
      new Date(value.startTimeUtc).getTime(),
    {
      message: "endTimeUtc must be greater than startTimeUtc",
      path: ["endTimeUtc"],
    }
  );

export const listBookingsQuerySchema = z
  .object({
    eventTypeId: cuidSchema.optional(),
    status: z
      .enum(["PENDING", "CONFIRMED", "CANCELLED", "RESCHEDULED", "COMPLETED"])
      .optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })
  .refine(
    (value) =>
      !value.startDate || !value.endDate || value.startDate <= value.endDate,
    {
      message: "startDate must be less than or equal to endDate",
      path: ["startDate"],
    }
  );

export const bookingParamsSchema = z.object({
  bookingId: cuidSchema,
});

const cancelBookingBodySchema = z.object({
  action: z.literal("cancel"),
  cancelReason: z.string().trim().min(1).max(500).optional(),
  cancelledBy: z.string().trim().min(1).max(80).optional(),
});

const rescheduleBookingBodySchema = z
  .object({
    action: z.literal("reschedule"),
    startTimeUtc: isoUtcDateTimeSchema,
    endTimeUtc: isoUtcDateTimeSchema,
  })
  .refine(
    (value) =>
      new Date(value.endTimeUtc).getTime() >
      new Date(value.startTimeUtc).getTime(),
    {
      message: "endTimeUtc must be greater than startTimeUtc",
      path: ["endTimeUtc"],
    }
  );

export const updateBookingBodySchema = z.discriminatedUnion("action", [
  cancelBookingBodySchema,
  rescheduleBookingBodySchema,
]);

export type CreateBookingBody = z.infer<typeof createBookingBodySchema>;
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
export type BookingParams = z.infer<typeof bookingParamsSchema>;
export type UpdateBookingBody = z.infer<typeof updateBookingBodySchema>;
