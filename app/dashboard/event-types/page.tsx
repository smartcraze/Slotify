import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { EventTypeCreateForm } from "@/components/dashboard/event-type-create-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDashboardUser } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function EventTypesPage() {
  const user = await requireDashboardUser();

  const eventTypes = await prisma.eventType.findMany({
    where: { hostId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      duration: true,
      status: true,
      isPublic: true,
    },
  });

  return (
    <DashboardPageShell
      userId={user.id}
      title="Event Types"
      subtitle="Create and manage your public booking types"
      username={user.username}
      subscriptionTier={user.subscriptionTier}
      profileName={user.name}
      profileImage={user.image}
    >
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-emerald-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Start taking bookings with your public page</p>
            <p className="text-xs text-emerald-800/90">
              Share this link with your audience: /{user.username}?overlayCalendar=true
            </p>
          </div>
          <Link
            href={{ pathname: `/${user.username}`, query: { overlayCalendar: "true" } }}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
          >
            Open booking page
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Create event type</CardTitle>
          <CardDescription>Add a new scheduling type for your public page</CardDescription>
        </CardHeader>
        <CardContent>
          <EventTypeCreateForm />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Existing event types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {eventTypes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No event types yet.</p>
          ) : (
            eventTypes.map((eventType) => (
              <div key={eventType.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{eventType.name}</p>
                  <p className="text-xs text-muted-foreground">/{user.username}?eventTypeSlug={eventType.slug} • {eventType.duration} min</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={eventType.status === "ACTIVE" ? "default" : "secondary"}>{eventType.status}</Badge>
                  {eventType.isPublic ? <Badge variant="outline">Public</Badge> : null}
                  <Link
                    href={{
                      pathname: `/${user.username}`,
                      query: { overlayCalendar: "true", eventTypeSlug: eventType.slug },
                    }}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary underline underline-offset-4"
                  >
                    Open page
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </DashboardPageShell>
  );
}
