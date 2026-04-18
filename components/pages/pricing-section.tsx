"use client";

import { CheckCircle2, ShieldCheck } from "lucide-react";

import { PlanCheckoutCard } from "@/components/subscription/plan-checkout-card";
import {
  FEATURE_MINIMUM_TIER,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_TIER_ORDER,
  type BillingCycle,
  type SubscriptionFeatureKey,
} from "@/data/subscription-plans";

type PricingSectionProps = {
  billingCycle: BillingCycle;
  isAuthenticated: boolean;
  currentTier?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  showHeader?: boolean;
  title?: string;
  description?: string;
};

const featureLabels: Record<SubscriptionFeatureKey, string> = {
  CORE_SCHEDULING: "Core scheduling",
  GOOGLE_CALENDAR_MEET: "Google Calendar + Meet",
  EMAIL_NOTIFICATIONS: "Email notifications",
  PAYMENTS: "Payments",
};

export function PricingSection({
  billingCycle,
  isAuthenticated,
  currentTier,
  customerName,
  customerEmail,
  showHeader = true,
  title = "Plans",
  description = "Switch billing cycle for instant pricing updates.",
}: PricingSectionProps) {
  return (
    <>
      {showHeader ? (
        <section className="mt-8">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </section>
      ) : null}

      <section className={`${showHeader ? "mt-4" : "mt-6"} grid gap-4 md:grid-cols-2 xl:grid-cols-3`}>
        {SUBSCRIPTION_PLANS.map((plan) => (
          <PlanCheckoutCard
            key={plan.tier}
            plan={plan}
            isAuthenticated={isAuthenticated}
            isCurrentPlan={currentTier === plan.tier}
            customerName={customerName}
            customerEmail={customerEmail}
            defaultBillingCycle={billingCycle}
            showBillingToggle={false}
          />
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-background/70 p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Feature matrix</h2>
            <p className="text-sm text-muted-foreground">Compare access levels by plan tier.</p>
          </div>
          <ShieldCheck className="size-5 text-muted-foreground" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-2xl border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="border-b border-border px-3 py-2 text-left font-medium">Feature</th>
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <th key={`head-${plan.tier}`} className="border-b border-border px-3 py-2 text-left font-medium">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Object.keys(featureLabels) as SubscriptionFeatureKey[]).map((featureKey) => (
                <tr key={featureKey}>
                  <td className="border-b border-border px-3 py-2">{featureLabels[featureKey]}</td>
                  {SUBSCRIPTION_PLANS.map((plan) => {
                    const isIncluded =
                      SUBSCRIPTION_TIER_ORDER.indexOf(plan.tier) >=
                      SUBSCRIPTION_TIER_ORDER.indexOf(FEATURE_MINIMUM_TIER[featureKey]);

                    return (
                      <td key={`${featureKey}-${plan.tier}`} className="border-b border-border px-3 py-2">
                        {isIncluded ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <CheckCircle2 className="size-4" />
                            Included
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Not included</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
