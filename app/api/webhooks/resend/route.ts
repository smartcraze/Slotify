import type { NextRequest } from "next/server";
import type { WebhookEventPayload } from "resend";

import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api/response";
import { verifyResendWebhookSignature } from "@/lib/email/resend";

function parseIsoDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
}

function parseFailureReason(event: WebhookEventPayload) {
  if (event.type === "email.failed") {
    return event.data.failed.reason;
  }

  if (event.type === "email.bounced") {
    return event.data.bounce.message;
  }

  if (event.type === "email.suppressed") {
    return event.data.suppressed.message;
  }

  return null;
}

function getNotificationLogId(event: WebhookEventPayload) {
  if (!event.type.startsWith("email.")) {
    return null;
  }

  const tags = "tags" in event.data ? event.data.tags : undefined;

  if (!tags) {
    return null;
  }

  return tags.notification_log_id ?? null;
}

export async function POST(request: NextRequest) {
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return fail("BAD_REQUEST", "Missing Resend webhook signature headers", 400);
  }

  const payload = await request.text();

  let verifiedEvent: WebhookEventPayload;

  try {
    verifiedEvent = verifyResendWebhookSignature({
      payload,
      headers: {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
    });
  } catch {
    return fail("BAD_REQUEST", "Invalid Resend webhook signature", 400);
  }

  const notificationLogId = getNotificationLogId(verifiedEvent);

  if (!notificationLogId) {
    return ok({ received: true, ignored: true, reason: "Missing notification_log_id tag" });
  }

  const eventType = verifiedEvent.type;
  const eventTime = parseIsoDate(verifiedEvent.created_at);

  if (eventType === "email.sent") {
    await prisma.notificationLog.updateMany({
      where: {
        id: notificationLogId,
      },
      data: {
        status: "SENT",
        sentAt: eventTime,
        failureReason: null,
      },
    });

    return ok({ received: true, processed: true, eventType });
  }

  if (eventType === "email.delivered") {
    await prisma.notificationLog.updateMany({
      where: {
        id: notificationLogId,
      },
      data: {
        status: "DELIVERED",
        deliveredAt: eventTime,
        sentAt: eventTime,
        failureReason: null,
      },
    });

    return ok({ received: true, processed: true, eventType });
  }

  if (
    eventType === "email.failed" ||
    eventType === "email.bounced" ||
    eventType === "email.complained" ||
    eventType === "email.suppressed"
  ) {
    const failureReason = parseFailureReason(verifiedEvent);

    await prisma.notificationLog.updateMany({
      where: {
        id: notificationLogId,
      },
      data: {
        status: "FAILED",
        failureReason: failureReason ?? `Resend event: ${eventType}`,
        retryCount: {
          increment: 1,
        },
      },
    });

    return ok({ received: true, processed: true, eventType });
  }

  return ok({ received: true, ignored: true, eventType });
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
