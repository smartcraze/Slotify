import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { EventTypeCreateForm } from "@/components/dashboard/event-type-create-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDashboardUser } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";

export default async function EventTypesPage() {
  const user = await requireDashboardUser();

  const eventTypes = await prisma.eventType.findMany({
    where: { hostId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardPageShell
      title="Event Types"
      subtitle="Create and manage your public booking types"
      username={user.username}
      subscriptionTier={user.subscriptionTier}
    >
      <Card>
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
                  <p className="text-xs text-muted-foreground">/{user.username}/{eventType.slug} • {eventType.duration} min</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={eventType.status === "ACTIVE" ? "default" : "secondary"}>{eventType.status}</Badge>
                  {eventType.isPublic ? <Badge variant="outline">Public</Badge> : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </DashboardPageShell>
  );
}
