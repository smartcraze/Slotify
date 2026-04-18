"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";

import { PricingSection } from "@/components/pages/pricing-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBSCRIPTION_COUPONS } from "@/data/subscription-coupons";
import {
  SUBSCRIPTION_PLANS,
  type BillingCycle,
} from "@/data/subscription-plans";

type PricingPageContentProps = {
  isAuthenticated: boolean;
  user: {
    name: string | null;
    email: string | null;
    subscriptionTier: string;
    subscriptionStatus: string;
  } | null;
};

const faqItems = [
  {
    question: "Can I change my plan later?",
    answer:
      "Yes. You can upgrade or downgrade anytime from payments. Changes apply after successful verification.",
  },
  {
    question: "How are prices calculated?",
    answer:
      "Displayed prices are for reference. Final payable amount is always computed securely on the server.",
  },
  {
    question: "Do coupon codes work on all plans?",
    answer:
      "Coupon validity, usage limits, and eligible plans are always enforced during checkout.",
  },
  {
    question: "When does a subscription become active?",
    answer: "A subscription becomes active only after successful Razorpay payment verification.",
  },
];

export function PricingPageContent({ isAuthenticated, user }: PricingPageContentProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY");

  const yearlySavingsByTier = useMemo(() => {
    return Object.fromEntries(
      SUBSCRIPTION_PLANS.map((plan) => {
        const yearlyFromMonthly = plan.monthlyPriceInr * 12;
        const savings = Math.max(0, yearlyFromMonthly - plan.yearlyPriceInr);
        return [plan.tier, savings];
      })
    ) as Record<string, number>;
  }, []);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card/40 p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-radial from-primary/10 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <Badge variant="outline" className="inline-flex items-center gap-2">
              <Sparkles className="size-3.5" />
              Production-ready billing
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple pricing that scales with your bookings</h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Choose a plan, apply coupons securely, and activate subscriptions only after verified payments.
            </p>
          </div>

          {isAuthenticated ? (
            <div className="flex flex-wrap items-center gap-2">
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
      </section>

      <section className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Plans</h2>
          <p className="text-sm text-muted-foreground">Switch billing cycle for instant pricing updates.</p>
        </div>

        <div className="inline-flex rounded-md border p-1 text-sm">
          <button
            type="button"
            className={`rounded px-3 py-1.5 transition ${billingCycle === "MONTHLY" ? "bg-foreground text-background" : "text-muted-foreground"}`}
            onClick={() => setBillingCycle("MONTHLY")}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`rounded px-3 py-1.5 transition ${billingCycle === "YEARLY" ? "bg-foreground text-background" : "text-muted-foreground"}`}
            onClick={() => setBillingCycle("YEARLY")}
          >
            Yearly
          </button>
        </div>
      </section>

      <PricingSection
        billingCycle={billingCycle}
        isAuthenticated={isAuthenticated}
        currentTier={user?.subscriptionTier}
        customerName={user?.name}
        customerEmail={user?.email}
        showHeader={false}
      />

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Coupon policy</CardTitle>
            <CardDescription>Coupons are always validated server-side during checkout.</CardDescription>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing rules</CardTitle>
            <CardDescription>Important details for secure subscription handling.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Frontend prices are display-only; final payable amount is computed on server.</p>
            <p>• Subscription activates only after successful Razorpay verification.</p>
            <p>• Webhook handling is idempotent and safe for retries.</p>
            <p>• Coupon checks include validity windows, limits, and plan compatibility.</p>
            {billingCycle === "YEARLY" ? (
              <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3 text-emerald-700">
                You are viewing yearly pricing. Savings: up to INR {Math.max(...Object.values(yearlySavingsByTier))} per year.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">FAQ</h2>
          <p className="text-sm text-muted-foreground">Quick answers before you choose a plan.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {faqItems.map((item) => (
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
    </main>
  );
}
