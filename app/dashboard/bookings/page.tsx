import { BookingActions } from "@/components/dashboard/booking-actions";
import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDashboardUser } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

function fmtDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function fmtTimeRange(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export default async function BookingsPage() {
  const user = await requireDashboardUser();

  const bookings = await prisma.booking.findMany({
    where: { hostId: user.id },
    select: {
      id: true,
      status: true,
      guestName: true,
      guestEmail: true,
      startTimeUtc: true,
      endTimeUtc: true,
      meetingLink: true,
      eventType: { select: { name: true, duration: true } },
    },
    orderBy: { startTimeUtc: "desc" },
    take: 40,
  });

  return (
    <DashboardPageShell
      userId={user.id}
      title="Bookings"
      subtitle="Monitor and manage attendee bookings"
      username={user.username}
      subscriptionTier={user.subscriptionTier}
      profileName={user.name}
      profileImage={user.image}
    >
      <Card>
        <CardHeader>
          <CardTitle>All bookings</CardTitle>
          <CardDescription>Cancel directly from dashboard when needed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="flex flex-wrap items-start justify-between gap-4 rounded-lg border bg-background/50 p-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="shrink-0 rounded-md border bg-white p-1 shadow-sm">
                    <Image
                      src="https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v1/web-96dp/logo_meet_2020q4_color_2x_web_96dp.png"
                      alt="Google Meet"
                      width={28}
                      height={28}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{booking.eventType.name}</p>
                      <Badge variant={booking.status === "CANCELLED" ? "secondary" : "outline"}>{booking.status}</Badge>
                      <Badge variant="outline">{booking.eventType.duration} min</Badge>
                    </div>

                    <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2 sm:gap-x-6">
                      <p>
                        <span className="font-medium text-foreground">Guest:</span> {booking.guestName || "Guest"}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Email:</span> {booking.guestEmail}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Date:</span> {fmtDate(booking.startTimeUtc)}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Time:</span> {fmtTimeRange(booking.startTimeUtc, booking.endTimeUtc)}
                      </p>
                      <p className="sm:col-span-2">
                        <span className="font-medium text-foreground">Meeting:</span>{" "}
                        {booking.meetingLink ? "Google Meet link generated" : "Google Meet"}
                      </p>
                    </div>
                  </div>
                </div>

                <BookingActions bookingId={booking.id} status={booking.status} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </DashboardPageShell>
  );
}
