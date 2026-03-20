import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function DashboardPage() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    redirect("/sign-in?callbackUrl=%2Fdashboard");
  }

  const now = new Date();

  const [user, eventTypes, upcomingBookings, availabilityRuleCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        username: true,
        email: true,
        timezone: true,
        subscriptionTier: true,
        subscriptionStatus: true,
      },
    }),
    prisma.eventType.findMany({
      where: { hostId: userId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        slug: true,
        duration: true,
        isPublic: true,
        status: true,
      },
    }),
    prisma.booking.findMany({
      where: {
        hostId: userId,
        status: { in: ["PENDING", "CONFIRMED", "RESCHEDULED"] },
        startTimeUtc: { gte: now },
      },
      orderBy: { startTimeUtc: "asc" },
      take: 10,
      select: {
        id: true,
        guestName: true,
        guestEmail: true,
        startTimeUtc: true,
        status: true,
        eventType: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.availabilityRule.count({
      where: { hostId: userId },
    }),
  ]);

  if (!user) {
    redirect("/sign-in");
  }

  if (!user.username) {
    redirect("/onboarding");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user.name || user.username}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/${user.username}`}>View public page</Link>
          </Button>
          <Button asChild>
            <Link href="/onboarding">Edit setup</Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Plan</CardDescription>
            <CardTitle>{user.subscriptionTier}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{user.subscriptionStatus}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Timezone</CardDescription>
            <CardTitle>{user.timezone || "UTC"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Host profile timezone</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Event types</CardDescription>
            <CardTitle>{eventTypes.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Active + inactive</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Availability rules</CardDescription>
            <CardTitle>{availabilityRuleCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Weekly schedule rules</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your event types</CardTitle>
            <CardDescription>Public booking types currently configured</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {eventTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No event types yet. Complete onboarding to create your first one.</p>
            ) : (
              eventTypes.map((eventType) => (
                <div key={eventType.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">{eventType.name}</p>
                    <p className="text-xs text-muted-foreground">
                      /{user.username}/{eventType.slug} • {eventType.duration} min
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={eventType.status === "ACTIVE" ? "default" : "secondary"}>
                      {eventType.status}
                    </Badge>
                    {eventType.isPublic ? <Badge variant="outline">Public</Badge> : null}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming bookings</CardTitle>
            <CardDescription>Next confirmed or pending meetings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming bookings yet.</p>
            ) : (
              upcomingBookings.map((booking) => (
                <div key={booking.id} className="rounded-md border p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{booking.eventType.name}</p>
                    <Badge variant="outline">{booking.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{booking.guestName || booking.guestEmail}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(booking.startTimeUtc)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
