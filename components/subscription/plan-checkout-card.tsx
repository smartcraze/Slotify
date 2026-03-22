"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { BillingCycle, SubscriptionPlan } from "@/data/subscription-plans";

type PlanCheckoutCardProps = {
  plan: SubscriptionPlan;
  isAuthenticated: boolean;
  isCurrentPlan: boolean;
  defaultBillingCycle?: BillingCycle;
  customerName?: string | null;
  customerEmail?: string | null;
};

type CreateOrderResponse = {
  success: true;
  data: {
    keyId: string;
    orderId: string;
    amountPaise: number;
    currency: string;
    subscriptionOrder: {
      id: string;
      planTier: string;
      billingCycle: string;
      amountInr: number;
      discountInr: number;
      finalAmountInr: number;
      couponCode?: string | null;
      razorpayOrderId: string;
    };
  };
};

type VerifyResponse = {
  success: boolean;
  error?: {
    message?: string;
  };
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
};

type RazorpayWindow = Window & {
  Razorpay?: new (options: RazorpayOptions) => { open: () => void };
};

function getPrice(plan: SubscriptionPlan, billingCycle: BillingCycle) {
  return billingCycle === "YEARLY" ? plan.yearlyPriceInr : plan.monthlyPriceInr;
}

async function ensureRazorpayLoaded() {
  const razorpayWindow = window as RazorpayWindow;
  if (razorpayWindow.Razorpay) {
    return true;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });

  return Boolean((window as RazorpayWindow).Razorpay);
}

export function PlanCheckoutCard(props: PlanCheckoutCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    props.defaultBillingCycle ?? "MONTHLY"
  );

  const displayPrice = useMemo(
    () => getPrice(props.plan, billingCycle),
    [props.plan, billingCycle]
  );

  const savings = useMemo(() => {
    if (billingCycle !== "YEARLY") {
      return 0;
    }

    const yearlyFromMonthly = props.plan.monthlyPriceInr * 12;
    return Math.max(0, yearlyFromMonthly - props.plan.yearlyPriceInr);
  }, [billingCycle, props.plan.monthlyPriceInr, props.plan.yearlyPriceInr]);

  async function handlePaidCheckout() {
    setLoading(true);

    try {
      const orderResponse = await fetch("/api/subscription/razorpay/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tier: props.plan.tier,
          billingCycle,
          couponCode: couponCode.trim() || undefined,
        }),
      });

      const orderPayload = (await orderResponse.json().catch(() => null)) as
        | CreateOrderResponse
        | VerifyResponse
        | null;
      const orderErrorMessage = (
        orderPayload as { error?: { message?: string } } | null
      )?.error?.message;

      if (!orderResponse.ok || !orderPayload || !orderPayload.success || !("data" in orderPayload)) {
        toast.error(orderErrorMessage ?? "Failed to create subscription order");
        setLoading(false);
        return;
      }

      const sdkReady = await ensureRazorpayLoaded();
      if (!sdkReady) {
        toast.error("Unable to load Razorpay checkout");
        setLoading(false);
        return;
      }

      const razorpayWindow = window as RazorpayWindow;
      const checkout = new razorpayWindow.Razorpay!({
        key: orderPayload.data.keyId,
        amount: orderPayload.data.amountPaise,
        currency: orderPayload.data.currency,
        name: "Slotify",
        description: `${props.plan.name} (${billingCycle.toLowerCase()})`,
        order_id: orderPayload.data.orderId,
        prefill: {
          name: props.customerName ?? undefined,
          email: props.customerEmail ?? undefined,
        },
        theme: {
          color: "#16a34a",
        },
        handler: async (response) => {
          const verifyResponse = await fetch("/api/subscription/razorpay/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const verifyPayload = (await verifyResponse.json().catch(() => null)) as
            | VerifyResponse
            | null;

          if (!verifyResponse.ok || !verifyPayload?.success) {
            toast.error(verifyPayload?.error?.message ?? "Payment verification failed");
            setLoading(false);
            return;
          }

          toast.success("Subscription activated successfully");
          setLoading(false);
          router.refresh();
          router.push("/dashboard/payments");
        },
      });

      checkout.open();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment checkout failed");
      setLoading(false);
      return;
    }
  }

  return (
    <Card className={props.plan.highlight ? "border-emerald-400 shadow-md" : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{props.plan.name}</CardTitle>
          {props.plan.highlight ? <Badge className="bg-emerald-600">{props.plan.highlight}</Badge> : null}
        </div>
        <CardDescription>{props.plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="inline-flex rounded-md border p-1 text-xs">
          <button
            type="button"
            className={`rounded px-3 py-1 ${billingCycle === "MONTHLY" ? "bg-foreground text-background" : "text-muted-foreground"}`}
            onClick={() => setBillingCycle("MONTHLY")}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`rounded px-3 py-1 ${billingCycle === "YEARLY" ? "bg-foreground text-background" : "text-muted-foreground"}`}
            onClick={() => setBillingCycle("YEARLY")}
          >
            Yearly
          </button>
        </div>

        <div>
          <p className="text-3xl font-semibold">INR {displayPrice}</p>
          <p className="text-xs text-muted-foreground">
            per {billingCycle === "YEARLY" ? "year" : "month"}
          </p>
          {savings > 0 ? (
            <p className="mt-1 text-xs font-medium text-emerald-700">Save INR {savings} with yearly billing</p>
          ) : null}
        </div>

        <div className="space-y-2">
          {props.plan.featureDetails.map((feature) => (
            <p key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="mt-0.5 size-3.5 text-emerald-600" aria-hidden="true" />
              <span>{feature}</span>
            </p>
          ))}
        </div>

        {props.plan.tier !== "FREE" ? (
          <div className="space-y-2">
            <Input
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
              placeholder="Coupon code (optional)"
              maxLength={32}
            />

            {!props.isAuthenticated ? (
              <Button asChild className="w-full">
                <Link href="/sign-in?callbackUrl=%2Fpricing">Sign in to upgrade</Link>
              </Button>
            ) : props.isCurrentPlan ? (
              <Button disabled className="w-full">Current plan</Button>
            ) : (
              <Button className="w-full" onClick={handlePaidCheckout} disabled={loading}>
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Processing...
                  </span>
                ) : (
                  props.plan.ctaLabel
                )}
              </Button>
            )}
          </div>
        ) : (
          <Button disabled className="w-full">Free forever</Button>
        )}
      </CardContent>
    </Card>
  );
}
