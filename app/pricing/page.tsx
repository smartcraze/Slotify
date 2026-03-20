import Link from "next/link";

import { TestUpgradeButton } from "@/components/subscription/test-upgrade-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBSCRIPTION_PLANS } from "@/data/subscription-plans";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function PricingPage() {
  const userId = await getAuthenticatedUserId();

  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: {
          subscriptionTier: true,
          subscriptionStatus: true,
        },
      })
    : null;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Pricing</h1>
          <p className="text-sm text-muted-foreground">
            Test upgrade flows quickly with Razorpay test mode and instant test activation.
          </p>
        </div>

        {userId ? (
          <div className="flex items-center gap-2">
            <Badge variant="outline">{user?.subscriptionTier ?? "FREE"}</Badge>
            <Badge variant="secondary">{user?.subscriptionStatus ?? "INACTIVE"}</Badge>
            <Button asChild variant="outline">
              <Link href="/dashboard/payments">Open payments</Link>
            </Button>
          </div>
        ) : (
          <Button asChild>
            <Link href="/sign-in?callbackUrl=%2Fpricing">Sign in to upgrade</Link>
          </Button>
        )}
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card key={plan.tier}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">INR {plan.monthlyPriceInr}/month</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                {plan.features.map((feature) => (
                  <p key={feature}>{feature}</p>
                ))}
              </div>

              {userId && plan.tier !== "FREE" ? (
                <TestUpgradeButton tier={plan.tier} className="w-full" />
              ) : null}
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
