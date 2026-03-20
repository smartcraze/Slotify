import Link from "next/link";

import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { SetupChecklistCard } from "@/components/dashboard/setup-checklist-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getHostSetupStatus, requireDashboardUser } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";

function fmt(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function DashboardPage() {
  const user = await requireDashboardUser();
  const now = new Date();

  const [eventTypeCount, upcomingBookings, availabilityRuleCount, setupStatus] = await Promise.all([
    prisma.eventType.count({ where: { hostId: user.id } }),
    prisma.booking.findMany({
      where: {
        hostId: user.id,
        status: { in: ["PENDING", "CONFIRMED", "RESCHEDULED"] },
        startTimeUtc: { gte: now },
      },
      include: { eventType: { select: { name: true } } },
      orderBy: { startTimeUtc: "asc" },
      take: 6,
    }),
    prisma.availabilityRule.count({ where: { hostId: user.id } }),
    getHostSetupStatus(user.id),
  ]);

  return (
    <DashboardPageShell
      userId={user.id}
      title="Overview"
      subtitle="Your scheduling workspace at a glance"
      username={user.username}
      subscriptionTier={user.subscriptionTier}
    >
      <section className="mb-4">
        <SetupChecklistCard setup={setupStatus} />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Plan" value={user.subscriptionTier} hint={user.subscriptionStatus} />
        <StatCard label="Timezone" value={user.timezone || "UTC"} hint="Host timezone" />
        <StatCard label="Event types" value={eventTypeCount} />
        <StatCard label="Availability rules" value={availabilityRuleCount} />
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
            <Button asChild variant="outline"><Link href="/dashboard/event-types">Manage event types</Link></Button>
            <Button asChild variant="outline"><Link href="/dashboard/bookings">Manage bookings</Link></Button>
            <Button asChild variant="outline"><Link href="/dashboard/availability">Check availability</Link></Button>
            <Button asChild><Link href="/onboarding">Edit profile setup</Link></Button>
          </CardContent>
        </Card>
      </section>
    </DashboardPageShell>
  );
}
