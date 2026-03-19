import { createHmac, timingSafeEqual } from "node:crypto";

import Razorpay from "razorpay";

let razorpayClient: Razorpay | null = null;

export function getRazorpayKeyId() {
  const keyId = process.env.RAZORPAY_KEY_ID;

  if (!keyId) {
    throw new Error("Missing RAZORPAY_KEY_ID");
  }

  return keyId;
}

function getRazorpayKeySecret() {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    throw new Error("Missing RAZORPAY_KEY_SECRET");
  }

  return keySecret;
}

function getRazorpayWebhookSecret() {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("Missing RAZORPAY_WEBHOOK_SECRET");
  }

  return webhookSecret;
}

export function getRazorpayClient() {
  if (razorpayClient) {
    return razorpayClient;
  }

  razorpayClient = new Razorpay({
    key_id: getRazorpayKeyId(),
    key_secret: getRazorpayKeySecret(),
  });

  return razorpayClient;
}

function safeEqualHex(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export function verifyRazorpayPaymentSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const expectedSignature = createHmac("sha256", getRazorpayKeySecret())
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");

  return safeEqualHex(expectedSignature, input.razorpaySignature);
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string
) {
  const expectedSignature = createHmac("sha256", getRazorpayWebhookSecret())
    .update(rawBody)
    .digest("hex");

  return safeEqualHex(expectedSignature, signature);
}
