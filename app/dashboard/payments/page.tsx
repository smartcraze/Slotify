import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { PlanCheckoutCard } from "@/components/subscription/plan-checkout-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBSCRIPTION_PLANS } from "@/data/subscription-plans";
import { requireDashboardUser } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";

export default async function PaymentsPage() {
  const user = await requireDashboardUser();

  const [subscriptionOrders, currentUser] = await Promise.all([
    prisma.subscriptionOrder.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        planTier: true,
        billingCycle: true,
        finalAmountInr: true,
        discountInr: true,
        status: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        email: true,
      },
    }),
  ]);

  return (
    <DashboardPageShell
      userId={user.id}
      title="Payments"
      subtitle="Subscription plan and payment records"
      username={user.username}
      isGuest={user.isGuest}
      subscriptionTier={user.subscriptionTier}
      profileName={currentUser?.name ?? user.name}
      profileImage={user.image}
    >
      <Card>
        <CardHeader>
          <CardTitle>Subscription plans</CardTitle>
          <CardDescription>
            Upgrade your plan with secure Razorpay checkout.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <PlanCheckoutCard
              key={plan.tier}
              plan={plan}
              isAuthenticated
              isCurrentPlan={user.subscriptionTier === plan.tier}
              customerName={currentUser?.name}
              customerEmail={currentUser?.email}
              isGuest={user.isGuest}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Subscription orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {subscriptionOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subscription orders yet.</p>
          ) : (
            subscriptionOrders.map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm">
                <p>{order.planTier} ({order.billingCycle})</p>
                <p>
                  INR {order.finalAmountInr}
                  {order.discountInr > 0 ? ` (saved ${order.discountInr})` : ""}
                </p>
                <Badge variant="outline">{order.status}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

    </DashboardPageShell>
  );
}
