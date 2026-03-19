import { z } from "zod";

import { cuidSchema } from "@/types/api/common";

export const createRazorpayOrderBodySchema = z.object({
  bookingId: cuidSchema,
  guestEmail: z.string().email(),
  amount: z.number().int().positive(),
  currency: z.string().length(3).default("INR"),
  notes: z.record(z.string(), z.string()).optional(),
});

export const verifyRazorpayPaymentBodySchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const razorpayWebhookBodySchema = z
  .object({
    event: z.string().min(1),
    payload: z
      .object({
        payment: z
          .object({
            entity: z
              .object({
                id: z.string().optional(),
                order_id: z.string().optional(),
                status: z.string().optional(),
                amount: z.number().int().optional(),
                error_code: z.string().nullable().optional(),
                error_description: z.string().nullable().optional(),
                created_at: z.number().optional(),
              })
              .passthrough(),
          })
          .optional(),
        refund: z
          .object({
            entity: z
              .object({
                id: z.string().optional(),
                payment_id: z.string().optional(),
                amount: z.number().int().optional(),
                status: z.string().optional(),
                created_at: z.number().optional(),
              })
              .passthrough(),
          })
          .optional(),
      })
      .partial()
      .passthrough()
      .optional(),
  })
  .passthrough();

export type CreateRazorpayOrderBody = z.infer<typeof createRazorpayOrderBodySchema>;
export type VerifyRazorpayPaymentBody = z.infer<typeof verifyRazorpayPaymentBodySchema>;
export type RazorpayWebhookBody = z.infer<typeof razorpayWebhookBodySchema>;
