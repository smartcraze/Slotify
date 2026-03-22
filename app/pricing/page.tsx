import Link from "next/link";

import { BrandLogo } from "@/components/layout/brand-logo";
import { PlanCheckoutCard } from "@/components/subscription/plan-checkout-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBSCRIPTION_COUPONS } from "@/data/subscription-coupons";
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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/90 backdrop-blur">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandLogo href="/" />

          <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/" className="transition hover:text-foreground">Home</Link>
            <Link href="/pricing" className="text-foreground">Pricing</Link>
            {userId ? <Link href="/dashboard" className="transition hover:text-foreground">Dashboard</Link> : null}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline">
              <Link href={userId ? "/dashboard" : "/sign-in?callbackUrl=%2Fpricing"}>
                {userId ? "Open dashboard" : "Sign in"}
              </Link>
            </Button>
          </div>
        </nav>
      </header>

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
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/sign-in?callbackUrl=%2Fpricing">Sign in to upgrade</Link>
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

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">FAQ</h2>
          <p className="text-sm text-muted-foreground">Quick answers before you choose a plan.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              question: "Can I change my plan later?",
              answer: "Yes. You can upgrade or downgrade anytime from payments. Changes apply after successful verification.",
            },
            {
              question: "How are prices calculated?",
              answer: "Displayed prices are for reference. Final payable amount is always computed securely on the server.",
            },
            {
              question: "Do coupon codes work on all plans?",
              answer: "Not always. Coupon validity, usage limits, and eligible plans are enforced during checkout.",
            },
            {
              question: "When does subscription become active?",
              answer: "Your subscription is activated only after successful Razorpay payment verification.",
            },
          ].map((item) => (
            <Card key={item.question}>
              <CardHeader>
                <CardTitle className="text-base">{item.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">Plan details</h2>
          <p className="text-sm text-muted-foreground">Plan limits, billing policy, and coupon notes for production billing.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card key={`details-${plan.tier}`}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.highlight ? <Badge>{plan.highlight}</Badge> : null}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Monthly: INR {plan.monthlyPriceInr}</p>
                <p>Yearly: INR {plan.yearlyPriceInr}</p>
                <div className="space-y-1">
                  {plan.featureDetails.map((feature) => (
                    <p key={feature}>• {feature}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Coupon policy</CardTitle>
            <CardDescription>Coupons are validated server-side during checkout.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {SUBSCRIPTION_COUPONS.map((coupon) => (
              <div key={coupon.code} className="rounded-md border p-3">
                <p className="font-medium text-foreground">{coupon.code}</p>
                <p>{coupon.description}</p>
                <p>
                  Discount: {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `INR ${coupon.discountValue}`}
                </p>
              </div>
            ))}
            <p>
              Coupon usage, applicability, and limits are enforced on server and can be changed in the
              pricing data config.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing rules</CardTitle>
            <CardDescription>Important details for paid subscriptions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Frontend prices are display-only; final price is computed on server.</p>
            <p>• Subscription is activated only after successful Razorpay verification.</p>
            <p>• Webhook is idempotent and can safely process retries.</p>
            <p>• Coupon checks include validity, limits, and plan compatibility.</p>
            <p>• Current plans are capped under INR 200/month as requested.</p>
          </CardContent>
        </Card>
      </section>
      </main>
    </div>
  );
}
