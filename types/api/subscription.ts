import { z } from "zod";

export const createSubscriptionOrderBodySchema = z.object({
  tier: z.enum(["STARTER", "PRO"]),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]),
  couponCode: z.string().trim().max(32).optional(),
});

export const verifySubscriptionPaymentBodySchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const subscriptionRazorpayWebhookBodySchema = z
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
                created_at: z.number().optional(),
                error_description: z.string().nullable().optional(),
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

export type CreateSubscriptionOrderBody = z.infer<
  typeof createSubscriptionOrderBodySchema
>;
export type VerifySubscriptionPaymentBody = z.infer<
  typeof verifySubscriptionPaymentBodySchema
>;
