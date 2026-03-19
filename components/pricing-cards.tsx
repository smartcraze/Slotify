"use client";

import * as React from "react";
import { Check, Sparkles } from "lucide-react";

import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlan,
} from "@/data/subscription-plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

function planPrice(plan: SubscriptionPlan, yearly: boolean) {
  if (plan.monthlyPriceInr === 0) {
    return "Free";
  }

  const amount = yearly ? plan.yearlyPriceInr : plan.monthlyPriceInr;
  const suffix = yearly ? "/year" : "/month";

  return `INR ${amount}${suffix}`;
}

export function PricingCards() {
  const [yearly, setYearly] = React.useState(false);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Plans built for growth</h2>
          <p className="text-sm text-muted-foreground">
            Start free and unlock advanced scheduling as your volume grows.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-full border bg-card px-4 py-2">
          <span className="text-xs text-muted-foreground">Monthly</span>
          <Switch checked={yearly} onCheckedChange={setYearly} aria-label="Toggle yearly billing" />
          <span className="text-xs text-muted-foreground">Yearly</span>
          <Badge variant="secondary">Save 2 months</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isPro = plan.tier === "PRO";

          return (
            <Card
              key={plan.tier}
              className={isPro ? "ring-2 ring-primary shadow-sm" : "ring-1 ring-border"}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {isPro ? (
                    <Badge>
                      <Sparkles />
                      Popular
                    </Badge>
                  ) : null}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg font-semibold">{planPrice(plan, yearly)}</p>
                <Separator />
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="size-4 text-foreground" />
                      {feature.replaceAll("_", " ")}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={isPro ? "default" : "outline"}>
                  {plan.monthlyPriceInr === 0 ? "Start free" : `Choose ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
