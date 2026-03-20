import { BookingActions } from "@/components/dashboard/booking-actions";
import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDashboardUser } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";

function fmt(date: Date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function BookingsPage() {
  const user = await requireDashboardUser();

  const bookings = await prisma.booking.findMany({
    where: { hostId: user.id },
    include: { eventType: { select: { name: true } } },
    orderBy: { startTimeUtc: "desc" },
    take: 40,
  });

  return (
    <DashboardPageShell
      title="Bookings"
      subtitle="Monitor and manage attendee bookings"
      username={user.username}
      subscriptionTier={user.subscriptionTier}
    >
      <Card>
        <CardHeader>
          <CardTitle>All bookings</CardTitle>
          <CardDescription>Cancel directly from dashboard when needed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-sm font-medium">{booking.eventType.name}</p>
                    <Badge variant="outline">{booking.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{booking.guestName || booking.guestEmail}</p>
                  <p className="text-xs text-muted-foreground">{fmt(booking.startTimeUtc)}</p>
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
