import { AvailabilityChecker } from "@/components/dashboard/availability-checker";
import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDashboardUser } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";

export default async function AvailabilityPage() {
  const user = await requireDashboardUser();

  const eventTypes = await prisma.eventType.findMany({
    where: { hostId: user.id, status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });

  return (
    <DashboardPageShell
      userId={user.id}
      title="Availability"
      subtitle="Inspect generated slots using your API rules"
      username={user.username}
      subscriptionTier={user.subscriptionTier}
    >
      <Card>
        <CardHeader>
          <CardTitle>Slot generator</CardTitle>
          <CardDescription>
            Uses your real /api/availability endpoint with selected event type and date range.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventTypes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Create an active event type first.</p>
          ) : (
            <AvailabilityChecker hostId={user.id} eventTypes={eventTypes} />
          )}
        </CardContent>
      </Card>
    </DashboardPageShell>
  );
}
