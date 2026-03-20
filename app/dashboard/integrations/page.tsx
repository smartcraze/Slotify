import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDashboardUser } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";

export default async function IntegrationsPage() {
  const user = await requireDashboardUser();

  const [googleAccount, calendarConnection, recentNotifications] = await Promise.all([
    prisma.account.findFirst({
      where: { userId: user.id, providerId: "google" },
      select: { providerId: true, accessTokenExpiresAt: true },
    }),
    prisma.calendarConnection.findFirst({
      where: { userId: user.id, provider: "google" },
      select: { status: true, lastSyncAt: true, updatedAt: true },
    }),
    prisma.notificationLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, type: true, status: true, recipient: true, createdAt: true },
    }),
  ]);

  return (
    <DashboardPageShell
      title="Integrations"
      subtitle="Google calendar and notification delivery status"
      username={user.username}
      subscriptionTier={user.subscriptionTier}
    >
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Google account</CardTitle>
            <CardDescription>OAuth connection used for Meet and events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Account linked: {googleAccount ? "Yes" : "No"}</p>
            <p>Calendar connection: {calendarConnection?.status || "Not connected"}</p>
            <p>Last sync: {calendarConnection?.lastSyncAt?.toLocaleString() || "N/A"}</p>
            {googleAccount ? <Badge>Connected</Badge> : <Badge variant="secondary">Disconnected</Badge>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email notifications</CardTitle>
            <CardDescription>Recent booking notification logs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentNotifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notification logs yet.</p>
            ) : (
              recentNotifications.map((notification) => (
                <div key={notification.id} className="rounded-md border p-2 text-sm">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p>{notification.type}</p>
                    <Badge variant="outline">{notification.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{notification.recipient}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </DashboardPageShell>
  );
}
