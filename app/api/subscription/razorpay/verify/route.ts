import type { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validation";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { verifyRazorpayPaymentSignature } from "@/lib/payments/razorpay";
import { prisma } from "@/lib/prisma";
import { computeSubscriptionPeriod } from "@/lib/subscription/lifecycle";
import { verifySubscriptionPaymentBodySchema } from "@/types/api/subscription";

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return fail("UNAUTHORIZED", "Authentication required", 401);
  }

  if (user.isGuest) {
    return fail("FORBIDDEN", "Guest mode is view-only for payments", 403);
  }

  const userId = user.id;

  const parsedBody = await parseJsonBody(request, verifySubscriptionPaymentBodySchema);

  if (!parsedBody.success) {
    return fail("BAD_REQUEST", "Invalid request body", 400, parsedBody.details);
  }

  const isValidSignature = verifyRazorpayPaymentSignature(parsedBody.data);

  if (!isValidSignature) {
    return fail("BAD_REQUEST", "Invalid Razorpay signature", 400);
  }

  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
      SELECT id
      FROM "SubscriptionOrder"
      WHERE "razorpayOrderId" = ${parsedBody.data.razorpayOrderId}
      FOR UPDATE
    `;

    const order = await tx.subscriptionOrder.findUnique({
      where: { razorpayOrderId: parsedBody.data.razorpayOrderId },
      select: {
        id: true,
        userId: true,
        planTier: true,
        billingCycle: true,
        status: true,
        couponId: true,
        couponCode: true,
        discountInr: true,
        razorpayPaymentId: true,
      },
    });

    if (!order) {
      return { error: fail("NOT_FOUND", "Subscription order not found", 404) };
    }

    if (order.userId !== userId) {
      return { error: fail("FORBIDDEN", "You cannot verify this payment", 403) };
    }

    if (order.status === "PAID") {
      if (
        order.razorpayPaymentId &&
        order.razorpayPaymentId !== parsedBody.data.razorpayPaymentId
      ) {
        return { error: fail("CONFLICT", "Order already linked to another payment", 409) };
      }

      return {
        data: {
          subscriptionOrderId: order.id,
          status: order.status,
        },
      };
    }

    const { startsAt, endsAt } = computeSubscriptionPeriod({
      billingCycle: order.billingCycle,
      from: now,
    });

    await tx.subscriptionOrder.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        razorpayPaymentId: parsedBody.data.razorpayPaymentId,
        razorpaySignature: parsedBody.data.razorpaySignature,
        paidAt: now,
        periodStartsAt: startsAt,
        periodEndsAt: endsAt,
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

    return {
      data: {
        subscriptionOrderId: order.id,
        status: "PAID",
      },
    };
  });

  if ("error" in result) {
    return result.error;
  }

  return ok(result.data);
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
