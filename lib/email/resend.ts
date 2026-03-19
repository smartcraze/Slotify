import { Resend } from "resend";

type BookingNotificationType =
  | "BOOKING_CONFIRMATION"
  | "BOOKING_CANCELLED"
  | "BOOKING_RESCHEDULED"
  | "BOOKING_REMINDER"
  | "BOOKING_COMPLETED";

type BookingEmailPayload = {
  bookingId: string;
  notificationLogId: string;
  notificationType: BookingNotificationType;
  to: string;
  eventTypeName: string;
  startTimeUtc: Date;
  endTimeUtc: Date;
  meetingLink?: string | null;
  hostName?: string | null;
};

type SendBookingEmailResult = {
  data: { id: string } | null;
  error: { message: string } | null;
};

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

function formatDateRange(startTimeUtc: Date, endTimeUtc: Date) {
  return `${startTimeUtc.toISOString()} to ${endTimeUtc.toISOString()} (UTC)`;
}

function getSubject(type: BookingNotificationType, eventTypeName: string) {
  if (type === "BOOKING_CONFIRMATION") {
    return `Booking confirmed: ${eventTypeName}`;
  }

  if (type === "BOOKING_CANCELLED") {
    return `Booking cancelled: ${eventTypeName}`;
  }

  if (type === "BOOKING_RESCHEDULED") {
    return `Booking rescheduled: ${eventTypeName}`;
  }

  if (type === "BOOKING_REMINDER") {
    return `Booking reminder: ${eventTypeName}`;
  }

  return `Booking update: ${eventTypeName}`;
}

function getMessageIntro(type: BookingNotificationType) {
  if (type === "BOOKING_CONFIRMATION") {
    return "Your booking is confirmed.";
  }

  if (type === "BOOKING_CANCELLED") {
    return "Your booking has been cancelled.";
  }

  if (type === "BOOKING_RESCHEDULED") {
    return "Your booking has been rescheduled.";
  }

  if (type === "BOOKING_REMINDER") {
    return "This is a reminder for your upcoming booking.";
  }

  return "Your booking has been updated.";
}

function buildTextBody(payload: BookingEmailPayload) {
  const hostLine = payload.hostName ? `Host: ${payload.hostName}` : "Host: Calendar host";
  const meetingLine = payload.meetingLink
    ? `Meeting link: ${payload.meetingLink}`
    : "Meeting link: Not available yet";

  return [
    getMessageIntro(payload.notificationType),
    "",
    `Event: ${payload.eventTypeName}`,
    `When: ${formatDateRange(payload.startTimeUtc, payload.endTimeUtc)}`,
    hostLine,
    meetingLine,
    "",
    "If this looks incorrect, please contact the host.",
  ].join("\n");
}

function buildHtmlBody(payload: BookingEmailPayload) {
  const hostLine = payload.hostName ? payload.hostName : "Calendar host";
  const meetingHtml = payload.meetingLink
    ? `<p><strong>Meeting link:</strong> <a href="${payload.meetingLink}">${payload.meetingLink}</a></p>`
    : "<p><strong>Meeting link:</strong> Not available yet</p>";

  return [
    `<p>${getMessageIntro(payload.notificationType)}</p>`,
    `<p><strong>Event:</strong> ${payload.eventTypeName}</p>`,
    `<p><strong>When:</strong> ${formatDateRange(payload.startTimeUtc, payload.endTimeUtc)}</p>`,
    `<p><strong>Host:</strong> ${hostLine}</p>`,
    meetingHtml,
    "<p>If this looks incorrect, please contact the host.</p>",
  ].join("");
}

export function verifyResendWebhookSignature(args: {
  payload: string;
  headers: {
    id: string;
    timestamp: string;
    signature: string;
  };
}) {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("RESEND_WEBHOOK_SECRET is not configured");
  }

  return resend.webhooks.verify({
    payload: args.payload,
    headers: args.headers,
    webhookSecret,
  });
}

export async function sendBookingLifecycleEmail(
  payload: BookingEmailPayload
): Promise<SendBookingEmailResult> {
  if (!resend) {
    return {
      data: null,
      error: { message: "RESEND_API_KEY is not configured" },
    };
  }

  if (!resendFromEmail) {
    return {
      data: null,
      error: { message: "RESEND_FROM_EMAIL is not configured" },
    };
  }

  const { data, error } = await resend.emails.send(
    {
      from: resendFromEmail,
      to: payload.to,
      subject: getSubject(payload.notificationType, payload.eventTypeName),
      text: buildTextBody(payload),
      html: buildHtmlBody(payload),
      tags: [
        { name: "notification_log_id", value: payload.notificationLogId },
        { name: "booking_id", value: payload.bookingId },
        { name: "notification_type", value: payload.notificationType },
      ],
    },
    {
      idempotencyKey: `booking-${payload.bookingId}-notification-${payload.notificationLogId}`,
    }
  );

  if (error) {
    return {
      data: null,
      error: { message: error.message },
    };
  }

  return {
    data: data ? { id: data.id } : null,
    error: null,
  };
}
