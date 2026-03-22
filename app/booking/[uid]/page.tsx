import { notFound } from "next/navigation";

import { BookingConfirmationView } from "@/components/pages/booking/booking-confirmation-view";
import { prisma } from "@/lib/prisma";

type BookingConfirmationPageProps = {
  params: Promise<{ uid: string }>;
  searchParams: Promise<{
    eventTypeSlug?: string;
    calendarAttempted?: string;
    calendarSuccess?: string;
    calendarMessage?: string;
    emailSent?: string;
    emailMessage?: string;
  }>;
};

export default async function BookingConfirmationPage({
  params,
  searchParams,
}: BookingConfirmationPageProps) {
  const { uid } = await params;
  const query = await searchParams;

  const booking = await prisma.booking.findUnique({
    where: { id: uid },
    include: {
      eventType: {
        select: {
          name: true,
        },
      },
      host: {
        select: {
          name: true,
          username: true,
          timezone: true,
          email: true,
        },
      },
    },
  });

  if (!booking) {
    notFound();
  }

  const hostUsername = booking.host.username || "";
  const eventTypeSlug = query.eventTypeSlug;
  const bookAnotherHref = hostUsername
    ? `/${hostUsername}?overlayCalendar=true${eventTypeSlug ? `&eventTypeSlug=${eventTypeSlug}` : ""}`
    : "/";

  const integrationStatus = {
    calendar: {
      attempted: query.calendarAttempted === "true",
      success: query.calendarSuccess === "true",
      message: query.calendarMessage || "Not attempted",
    },
    email: {
      sent: query.emailSent === "true",
      message: query.emailMessage || "Unknown",
    },
  };

  return (
    <BookingConfirmationView
      bookingId={booking.id}
      status={booking.status}
      eventTypeName={booking.eventType.name}
      startTimeUtc={booking.startTimeUtc.toISOString()}
      endTimeUtc={booking.endTimeUtc.toISOString()}
      guestName={booking.guestName}
      guestEmail={booking.guestEmail}
      hostEmail={booking.host.email}
      guestNotes={booking.guestNotes}
      meetingLink={booking.meetingLink}
      createdAt={booking.createdAt.toISOString()}
      hostName={booking.host.name || "Host"}
      hostTimezone={booking.host.timezone || "UTC"}
      bookAnotherHref={bookAnotherHref}
      integrationStatus={integrationStatus}
    />
  );
}
