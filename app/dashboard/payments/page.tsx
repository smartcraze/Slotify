import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBSCRIPTION_PLANS } from "@/data/subscription-plans";
import { requireDashboardUser } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";

export default async function PaymentsPage() {
  const user = await requireDashboardUser();

  const payments = await prisma.payment.findMany({
    where: { hostId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <DashboardPageShell
      title="Payments"
      subtitle="Subscription plan and payment records"
      username={user.username}
      subscriptionTier={user.subscriptionTier}
    >
      <Card>
        <CardHeader>
          <CardTitle>Subscription plans</CardTitle>
          <CardDescription>Plan catalog from your pricing configuration</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div key={plan.tier} className="rounded-md border p-3">
              <p className="text-sm font-medium">{plan.name}</p>
              <p className="text-xs text-muted-foreground">INR {plan.monthlyPriceInr}/month</p>
              {user.subscriptionTier === plan.tier ? <Badge className="mt-2">Current</Badge> : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Payment records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment records yet.</p>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm">
                <p>Order: {payment.razorpayOrderId}</p>
                <p>Amount: {payment.amount} {payment.currency}</p>
                <Badge variant="outline">{payment.status}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </DashboardPageShell>
  );
}
