import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validation";
import { getRazorpayClient, getRazorpayKeyId } from "@/lib/payments/razorpay";
import { canHostAccessFeature } from "@/lib/subscription/access";
import { createRazorpayOrderBodySchema } from "@/types/api/payments";

export async function POST(request: NextRequest) {
  const parsedBody = await parseJsonBody(request, createRazorpayOrderBodySchema);

  if (!parsedBody.success) {
    return fail("BAD_REQUEST", "Invalid request body", 400, parsedBody.details);
  }

  const booking = await prisma.booking.findUnique({
    where: {
      id: parsedBody.data.bookingId,
    },
    include: {
      payment: true,
      eventType: {
        select: { id: true, name: true },
      },
    },
  });

  if (!booking) {
    return fail("NOT_FOUND", "Booking not found", 404);
  }

  const canUsePayments = await canHostAccessFeature(booking.hostId, "PAYMENTS");

  if (!canUsePayments) {
    return fail(
      "PAYMENT_REQUIRED",
      "Host must have an active paid subscription to accept payments",
      402
    );
  }

  if (booking.guestEmail.toLowerCase() !== parsedBody.data.guestEmail.toLowerCase()) {
    return fail(
      "FORBIDDEN",
      "Only the booking attendee can initiate this payment",
      403
    );
  }

  if (booking.status === "CANCELLED") {
    return fail("BAD_REQUEST", "Cannot pay for a cancelled booking", 400);
  }

  if (booking.payment?.status === "COMPLETED") {
    return fail("CONFLICT", "Payment already completed for this booking", 409);
  }

  if (booking.payment?.status === "PENDING" && booking.payment.razorpayOrderId) {
    return ok({
      orderId: booking.payment.razorpayOrderId,
      keyId: getRazorpayKeyId(),
      amount: booking.payment.amount,
      currency: booking.payment.currency,
      bookingId: booking.payment.bookingId,
      status: booking.payment.status,
      eventType: booking.eventType.name,
    });
  }

  const razorpay = getRazorpayClient();

  const order = await razorpay.orders.create({
    amount: parsedBody.data.amount,
    currency: parsedBody.data.currency,
    receipt: booking.id,
    notes: {
      bookingId: booking.id,
      hostId: booking.hostId,
      eventTypeId: booking.eventTypeId,
      guestEmail: booking.guestEmail,
      ...(parsedBody.data.notes ?? {}),
    },
  });

  const paymentRecord = booking.payment
    ? await prisma.payment.update({
        where: { bookingId: booking.id },
        data: {
          amount: parsedBody.data.amount,
          currency: parsedBody.data.currency,
          status: "PENDING",
          razorpayOrderId: order.id,
          razorpayPaymentId: null,
          razorpaySignature: null,
          razorpayRefundId: null,
          failureCode: null,
          failureDescription: null,
          refundAmount: null,
          refundedAt: null,
          capturedAt: null,
        },
      })
    : await prisma.payment.create({
        data: {
          bookingId: booking.id,
          hostId: booking.hostId,
          amount: parsedBody.data.amount,
          currency: parsedBody.data.currency,
          status: "PENDING",
          razorpayOrderId: order.id,
        },
      });

  return ok(
    {
      orderId: order.id,
      keyId: getRazorpayKeyId(),
      amount: paymentRecord.amount,
      currency: paymentRecord.currency,
      bookingId: paymentRecord.bookingId,
      status: paymentRecord.status,
      eventType: booking.eventType.name,
    },
    201
  );
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
