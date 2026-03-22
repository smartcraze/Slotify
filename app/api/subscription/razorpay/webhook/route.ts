import type { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api/response";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay";
import { prisma } from "@/lib/prisma";
import { computeSubscriptionPeriod } from "@/lib/subscription/lifecycle";
import { subscriptionRazorpayWebhookBodySchema } from "@/types/api/subscription";

function fromUnixTimestamp(seconds?: number) {
  if (!seconds) {
    return new Date();
  }

  return new Date(seconds * 1000);
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return fail("BAD_REQUEST", "Missing Razorpay signature header", 400);
  }

  const rawBody = await request.text();

  const isValid = verifyRazorpayWebhookSignature(rawBody, signature);

  if (!isValid) {
    return fail("BAD_REQUEST", "Invalid webhook signature", 400);
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawBody);
  } catch {
    return fail("BAD_REQUEST", "Invalid JSON payload", 400);
  }

  const parsedWebhook = subscriptionRazorpayWebhookBodySchema.safeParse(parsedJson);

  if (!parsedWebhook.success) {
    return fail("BAD_REQUEST", "Invalid webhook payload", 400, parsedWebhook.error.issues);
  }

  const event = parsedWebhook.data.event;
  const paymentEntity = parsedWebhook.data.payload?.payment?.entity;

  if (event === "payment.captured" || event === "order.paid") {
    if (!paymentEntity?.order_id || !paymentEntity.id) {
      return ok({ received: true, ignored: true, reason: "Missing payment identifiers" });
    }

    const capturedAt = fromUnixTimestamp(paymentEntity.created_at);

    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT id
        FROM "SubscriptionOrder"
        WHERE "razorpayOrderId" = ${paymentEntity.order_id}
        FOR UPDATE
      `;

      const order = await tx.subscriptionOrder.findUnique({
        where: { razorpayOrderId: paymentEntity.order_id },
        select: {
          id: true,
          userId: true,
          planTier: true,
          billingCycle: true,
          status: true,
          couponId: true,
          couponCode: true,
          discountInr: true,
        },
      });

      if (!order) {
        return { ignored: true, reason: "Unknown subscription order" };
      }

      if (order.status === "PAID") {
        return { ignored: true, reason: "Already paid" };
      }

      const { startsAt, endsAt } = computeSubscriptionPeriod({
        billingCycle: order.billingCycle,
        from: capturedAt,
      });

      await tx.subscriptionOrder.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          razorpayPaymentId: paymentEntity.id,
          paidAt: capturedAt,
          periodStartsAt: startsAt,
          periodEndsAt: endsAt,
          failedReason: null,
        },
      });

      await tx.user.update({
        where: { id: order.userId },
        data: {
          subscriptionTier: order.planTier,
          subscriptionStatus: "ACTIVE",
          subscriptionStartsAt: startsAt,
          subscriptionEndsAt: endsAt,
        },
      });

      if (order.couponId && order.discountInr > 0) {
        await tx.couponRedemption.create({
          data: {
            couponId: order.couponId,
            orderId: order.id,
            userId: order.userId,
            code: order.couponCode ?? "",
            discountInr: order.discountInr,
          },
        });

        await tx.coupon.update({
          where: { id: order.couponId },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }

      return { ignored: false };
    });

    return ok({ received: true, event, ...result });
  }

  if (event === "payment.failed") {
    if (!paymentEntity?.order_id) {
      return ok({ received: true, ignored: true, reason: "Missing order id" });
    }

    await prisma.subscriptionOrder.updateMany({
      where: {
        razorpayOrderId: paymentEntity.order_id,
        status: {
          not: "PAID",
        },
      },
      data: {
        status: "FAILED",
        failedReason: paymentEntity.error_description ?? "Payment failed",
      },
    });

    return ok({ received: true, processed: true, event });
  }

  return ok({ received: true, ignored: true, event });
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
