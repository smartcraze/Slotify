import Link from "next/link";

import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { PublicBookingLinkCard } from "@/components/dashboard/public-booking-link-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDashboardUser } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";
import { CalendarDays, Clock3, Crown, Globe2 } from "lucide-react";

function fmt(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function DashboardPage() {
  const user = await requireDashboardUser();
  const now = new Date();

  const [eventTypeCount, upcomingBookings, availabilityRuleCount] = await Promise.all([
    prisma.eventType.count({ where: { hostId: user.id } }),
    prisma.booking.findMany({
      where: {
        hostId: user.id,
        status: { in: ["PENDING", "CONFIRMED", "RESCHEDULED"] },
        startTimeUtc: { gte: now },
      },
      select: {
        id: true,
        status: true,
        guestName: true,
        guestEmail: true,
        startTimeUtc: true,
        eventType: { select: { name: true } },
      },
      orderBy: { startTimeUtc: "asc" },
      take: 6,
    }),
    prisma.availabilityRule.count({ where: { hostId: user.id } }),
  ]);

  return (
    <DashboardPageShell
      userId={user.id}
      title="Overview"
      subtitle="Your scheduling workspace at a glance"
      username={user.username}
      subscriptionTier={user.subscriptionTier}
      profileName={user.name}
      profileImage={user.image}
    >
      <section className="mb-4">
        <PublicBookingLinkCard username={user.username} />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Plan"
          value={user.subscriptionTier}
          hint={user.subscriptionStatus}
          icon={<Crown className="size-4" aria-hidden="true" />}
          iconClassName="bg-amber-100 text-amber-700"
        />
        <StatCard
          label="Timezone"
          value={user.timezone || "UTC"}
          hint="Host timezone"
          icon={<Globe2 className="size-4" aria-hidden="true" />}
          iconClassName="bg-sky-100 text-sky-700"
        />
        <StatCard
          label="Event types"
          value={eventTypeCount}
          icon={<CalendarDays className="size-4" aria-hidden="true" />}
          iconClassName="bg-fuchsia-100 text-fuchsia-700"
        />
        <StatCard
          label="Availability rules"
          value={availabilityRuleCount}
          icon={<Clock3 className="size-4" aria-hidden="true" />}
          iconClassName="bg-emerald-100 text-emerald-700"
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming bookings</CardTitle>
            <CardDescription>Next meetings on your calendar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming bookings yet.</p>
            ) : (
              upcomingBookings.map((booking) => (
                <div key={booking.id} className="rounded-md border p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{booking.eventType.name}</p>
                    <Badge variant="outline">{booking.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{booking.guestName || booking.guestEmail}</p>
                  <p className="text-xs text-muted-foreground">{fmt(booking.startTimeUtc)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Manage core scheduling workflows</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <Button asChild variant="outline"><Link href="/dashboard/event-types" prefetch>Manage event types</Link></Button>
            <Button asChild variant="outline"><Link href="/dashboard/bookings" prefetch>Manage bookings</Link></Button>
            <Button asChild variant="outline"><Link href="/dashboard/availability" prefetch>Check availability</Link></Button>
            <Button asChild><Link href="/onboarding" prefetch>Edit profile setup</Link></Button>
          </CardContent>
        </Card>
      </section>
    </DashboardPageShell>
  );
}
