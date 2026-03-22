import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBSCRIPTION_PLANS } from "@/data/subscription-plans";
import { SUBSCRIPTION_COUPONS } from "@/data/subscription-coupons";

export default function PricingDetailsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Pricing details</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Plan limits, billing policy, and coupon notes for production billing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/pricing">Back to pricing</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/payments">Open payments</Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card key={plan.tier}>
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
  );
}
