import Link from "next/link";

import { PlanCheckoutCard } from "@/components/subscription/plan-checkout-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PLANS } from "@/data/subscription-plans";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function PricingPage() {
  const userId = await getAuthenticatedUserId();

  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
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
            Transparent, production-ready pricing with secure server-side checkout.
          </p>
        </div>

        {userId ? (
          <div className="flex items-center gap-2">
            <Badge variant="outline">{user?.subscriptionTier ?? "FREE"}</Badge>
            <Badge variant="secondary">{user?.subscriptionStatus ?? "INACTIVE"}</Badge>
            <Button asChild variant="outline">
              <Link href="/dashboard/payments">Open payments</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing/details">Pricing details</Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/sign-in?callbackUrl=%2Fpricing">Sign in to upgrade</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing/details">Pricing details</Link>
            </Button>
          </div>
        )}
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <PlanCheckoutCard
            key={plan.tier}
            plan={plan}
            isAuthenticated={Boolean(userId)}
            isCurrentPlan={user?.subscriptionTier === plan.tier}
            customerName={user?.name}
            customerEmail={user?.email}
          />
        ))}
      </section>
    </main>
  );
}
