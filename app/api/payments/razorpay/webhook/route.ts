import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api/response";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay";
import { canHostAccessFeature } from "@/lib/subscription/access";
import { razorpayWebhookBodySchema } from "@/types/api/payments";

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

  const parsedWebhook = razorpayWebhookBodySchema.safeParse(parsedJson);

  if (!parsedWebhook.success) {
    return fail("BAD_REQUEST", "Invalid webhook payload", 400, parsedWebhook.error.issues);
  }

  const event = parsedWebhook.data.event;
  const paymentEntity = parsedWebhook.data.payload?.payment?.entity;
  const refundEntity = parsedWebhook.data.payload?.refund?.entity;

  if (event === "payment.captured" || event === "order.paid") {
    if (!paymentEntity?.order_id || !paymentEntity.id) {
      return ok({ received: true, ignored: true, reason: "Missing payment entity ids" });
    }

    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: paymentEntity.order_id },
      select: { id: true, bookingId: true, status: true, hostId: true },
    });

    if (!payment) {
      return ok({ received: true, ignored: true, reason: "Unknown order id" });
    }

    const canUsePayments = await canHostAccessFeature(payment.hostId, "PAYMENTS");

    if (!canUsePayments) {
      return ok({ received: true, ignored: true, reason: "Host payment feature disabled" });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED",
        razorpayPaymentId: paymentEntity.id,
        capturedAt: fromUnixTimestamp(paymentEntity.created_at),
        failureCode: null,
        failureDescription: null,
      },
    });

    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: "CONFIRMED" },
    });

    return ok({ received: true, processed: true, event });
  }

  if (event === "payment.failed") {
    if (!paymentEntity?.order_id) {
      return ok({ received: true, ignored: true, reason: "Missing order id" });
    }

    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: paymentEntity.order_id },
      select: { id: true, bookingId: true, hostId: true },
    });

    if (!payment) {
      return ok({ received: true, ignored: true, reason: "Unknown order id" });
    }

    const canUsePayments = await canHostAccessFeature(payment.hostId, "PAYMENTS");

    if (!canUsePayments) {
      return ok({ received: true, ignored: true, reason: "Host payment feature disabled" });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        razorpayPaymentId: paymentEntity.id ?? null,
        failureCode: paymentEntity.error_code ?? null,
        failureDescription: paymentEntity.error_description ?? null,
      },
    });

    return ok({ received: true, processed: true, event });
  }

  if (event.startsWith("refund.")) {
    const paymentId = refundEntity?.payment_id;

    if (!paymentId) {
      return ok({ received: true, ignored: true, reason: "Missing payment id for refund" });
    }

    const payment = await prisma.payment.findUnique({
      where: { razorpayPaymentId: paymentId },
      select: { id: true, hostId: true },
    });

    if (!payment) {
      return ok({ received: true, ignored: true, reason: "Unknown payment id" });
    }

    const canUsePayments = await canHostAccessFeature(payment.hostId, "PAYMENTS");

    if (!canUsePayments) {
      return ok({ received: true, ignored: true, reason: "Host payment feature disabled" });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "REFUNDED",
        razorpayRefundId: refundEntity.id ?? null,
        refundAmount: refundEntity.amount ?? null,
        refundedAt: fromUnixTimestamp(refundEntity.created_at),
      },
    });

    return ok({ received: true, processed: true, event });
  }

  return ok({ received: true, ignored: true, event });
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
