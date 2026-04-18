import type { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validation";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getRazorpayClient, getRazorpayKeyId } from "@/lib/payments/razorpay";
import { prisma } from "@/lib/prisma";
import { buildPricingQuote, syncConfiguredCoupons } from "@/lib/subscription/pricing";
import { createSubscriptionOrderBodySchema } from "@/types/api/subscription";

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return fail("UNAUTHORIZED", "Authentication required", 401);
  }

  if (user.isGuest) {
    return fail("FORBIDDEN", "Guest mode is view-only for payments", 403);
  }

  const userId = user.id;

  const parsedBody = await parseJsonBody(request, createSubscriptionOrderBodySchema);

  if (!parsedBody.success) {
    return fail("BAD_REQUEST", "Invalid request body", 400, parsedBody.details);
  }

  await syncConfiguredCoupons();

  let quote;
  try {
    quote = await buildPricingQuote({
      tier: parsedBody.data.tier,
      billingCycle: parsedBody.data.billingCycle,
      couponCode: parsedBody.data.couponCode,
      userId,
    });
  } catch (error) {
    return fail(
      "BAD_REQUEST",
      error instanceof Error ? error.message : "Failed to build pricing quote",
      400
    );
  }

  if (quote.finalAmountInr <= 0) {
    return fail("BAD_REQUEST", "Final amount must be greater than zero", 400);
  }

  const razorpay = getRazorpayClient();
  const amountPaise = quote.finalAmountInr * 100;

  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: `${userId}-${Date.now()}`,
    notes: {
      userId,
      tier: parsedBody.data.tier,
      billingCycle: parsedBody.data.billingCycle,
      couponCode: quote.couponCode ?? "",
    },
  });

  const subscriptionOrder = await prisma.subscriptionOrder.create({
    data: {
      userId,
      planTier: parsedBody.data.tier,
      billingCycle: parsedBody.data.billingCycle,
      status: "CREATED",
      amountInr: quote.amountInr,
      discountInr: quote.discountInr,
      finalAmountInr: quote.finalAmountInr,
      currency: "INR",
      couponId: quote.couponId ?? null,
      couponCode: quote.couponCode ?? null,
      razorpayOrderId: order.id,
    },
    select: {
      id: true,
      planTier: true,
      billingCycle: true,
      amountInr: true,
      discountInr: true,
      finalAmountInr: true,
      couponCode: true,
      razorpayOrderId: true,
    },
  });

  return ok(
    {
      keyId: getRazorpayKeyId(),
      orderId: order.id,
      amountPaise,
      currency: "INR",
      subscriptionOrder,
    },
    201
  );
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
