import { ConnectGoogleCalendarButton } from "@/components/dashboard/connect-google-calendar-button";
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
      userId={user.id}
      title="Integrations"
      subtitle="Google calendar and notification delivery status"
      username={user.username}
      isGuest={user.isGuest}
      subscriptionTier={user.subscriptionTier}
      profileName={user.name}
      profileImage={user.image}
    >
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Google account</CardTitle>
            <CardDescription>OAuth connection used for Meet and events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Account linked: {googleAccount ? "Yes" : "No"}</p>
            <p>
              Calendar connection: {calendarConnection?.status || (googleAccount ? "Connected via OAuth" : "Not connected")}
            </p>
            <p>Last sync: {calendarConnection?.lastSyncAt?.toLocaleString() || "N/A"}</p>
            {googleAccount ? <Badge>Connected</Badge> : <Badge variant="secondary">Disconnected</Badge>}

            {!googleAccount ? (
              <div className="mt-3 space-y-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-950">
                <p className="text-xs font-medium">
                  Google Meet links require a connected Google account with Calendar access.
                </p>
                <ConnectGoogleCalendarButton callbackUrl="/dashboard/integrations" isGuest={user.isGuest} />
              </div>
            ) : null}
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
