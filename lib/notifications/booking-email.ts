import { prisma } from "@/lib/prisma";
import { sendBookingLifecycleEmail } from "@/lib/email/resend";

type BookingNotificationType =
  | "BOOKING_CONFIRMATION"
  | "BOOKING_CANCELLED"
  | "BOOKING_RESCHEDULED"
  | "BOOKING_REMINDER"
  | "BOOKING_COMPLETED";

type SendBookingNotificationInput = {
  bookingId: string;
  userId: string;
  type: BookingNotificationType;
  recipient: string;
  eventTypeName: string;
  startTimeUtc: Date;
  endTimeUtc: Date;
  meetingLink?: string | null;
  hostName?: string | null;
};

export async function createAndSendBookingNotification(
  input: SendBookingNotificationInput
) {
  const notificationLog = await prisma.notificationLog.create({
    data: {
      bookingId: input.bookingId,
      userId: input.userId,
      type: input.type,
      status: "PENDING",
      channel: "EMAIL",
      recipient: input.recipient,
    },
    select: {
      id: true,
    },
  });

  const { data, error } = await sendBookingLifecycleEmail({
    bookingId: input.bookingId,
    notificationLogId: notificationLog.id,
    notificationType: input.type,
    to: input.recipient,
    eventTypeName: input.eventTypeName,
    startTimeUtc: input.startTimeUtc,
    endTimeUtc: input.endTimeUtc,
    meetingLink: input.meetingLink,
    hostName: input.hostName,
  });

  if (error) {
    await prisma.notificationLog.update({
      where: { id: notificationLog.id },
      data: {
        status: "FAILED",
        failureReason: error.message,
        retryCount: {
          increment: 1,
        },
      },
    });

    return { notificationLogId: notificationLog.id, sent: false, reason: error.message };
  }

  await prisma.notificationLog.update({
    where: { id: notificationLog.id },
    data: {
      status: "SENT",
      sentAt: new Date(),
      failureReason: null,
    },
  });

  return {
    notificationLogId: notificationLog.id,
    providerEmailId: data?.id ?? null,
    sent: true,
    reason: null,
  };
}
