import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validation";
import { verifyRazorpayPaymentSignature } from "@/lib/payments/razorpay";
import { verifyRazorpayPaymentBodySchema } from "@/types/api/payments";

export async function POST(request: NextRequest) {
  const parsedBody = await parseJsonBody(request, verifyRazorpayPaymentBodySchema);

  if (!parsedBody.success) {
    return fail("BAD_REQUEST", "Invalid request body", 400, parsedBody.details);
  }

  const isValidSignature = verifyRazorpayPaymentSignature(parsedBody.data);

  if (!isValidSignature) {
    return fail("BAD_REQUEST", "Invalid Razorpay signature", 400);
  }

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: parsedBody.data.razorpayOrderId },
  });

  if (!payment) {
    return fail("NOT_FOUND", "Payment order not found", 404);
  }

  if (
    payment.razorpayPaymentId &&
    payment.razorpayPaymentId !== parsedBody.data.razorpayPaymentId
  ) {
    return fail("CONFLICT", "Payment already linked to a different payment id", 409);
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "COMPLETED",
      razorpayPaymentId: parsedBody.data.razorpayPaymentId,
      razorpaySignature: parsedBody.data.razorpaySignature,
      capturedAt: new Date(),
      failureCode: null,
      failureDescription: null,
    },
  });

  await prisma.booking.update({
    where: { id: updatedPayment.bookingId },
    data: {
      status: "CONFIRMED",
    },
  });

  return ok({
    paymentId: updatedPayment.id,
    bookingId: updatedPayment.bookingId,
    status: updatedPayment.status,
    razorpayOrderId: updatedPayment.razorpayOrderId,
    razorpayPaymentId: updatedPayment.razorpayPaymentId,
  });
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
