export const SUBSCRIPTION_TIER_ORDER = [
  "FREE",
  "STARTER",
  "PRO",
  "ENTERPRISE",
] as const;

export type SubscriptionTier = (typeof SUBSCRIPTION_TIER_ORDER)[number];

export type SubscriptionFeatureKey =
  | "CORE_SCHEDULING"
  | "GOOGLE_CALENDAR_MEET"
  | "EMAIL_NOTIFICATIONS"
  | "PAYMENTS";

export type SubscriptionPlan = {
  tier: SubscriptionTier;
  name: string;
  monthlyPriceInr: number;
  yearlyPriceInr: number;
  highlight?: string;
  description: string;
  ctaLabel: string;
  features: SubscriptionFeatureKey[];
  featureDetails: string[];
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: "FREE",
    name: "Free",
    monthlyPriceInr: 0,
    yearlyPriceInr: 0,
    description: "For getting started with personal booking links",
    ctaLabel: "Get started",
    features: ["CORE_SCHEDULING", "GOOGLE_CALENDAR_MEET"],
    featureDetails: [
      "1 active event type",
      "Basic availability rules",
      "Google Meet link on bookings",
      "Community support",
    ],
  },
  {
    tier: "STARTER",
    name: "Starter",
    monthlyPriceInr: 99,
    yearlyPriceInr: 990,
    description: "For creators and consultants who need paid bookings",
    ctaLabel: "Upgrade to Starter",
    features: ["CORE_SCHEDULING", "GOOGLE_CALENDAR_MEET", "PAYMENTS"],
    featureDetails: [
      "Unlimited event types",
      "Custom booking links",
      "Razorpay payment collection",
      "Email support",
    ],
  },
  {
    tier: "PRO",
    name: "Pro",
    monthlyPriceInr: 199,
    yearlyPriceInr: 1990,
    highlight: "Most popular",
    description: "For serious hosts scaling bookings and reminders",
    ctaLabel: "Upgrade to Pro",
    features: [
      "CORE_SCHEDULING",
      "GOOGLE_CALENDAR_MEET",
      "EMAIL_NOTIFICATIONS",
      "PAYMENTS",
    ],
    featureDetails: [
      "Everything in Starter",
      "Booking lifecycle email automations",
      "Priority processing",
      "Priority support",
    ],
  },
];

export const FEATURE_MINIMUM_TIER: Record<SubscriptionFeatureKey, SubscriptionTier> = {
  CORE_SCHEDULING: "FREE",
  GOOGLE_CALENDAR_MEET: "FREE",
  EMAIL_NOTIFICATIONS: "STARTER",
  PAYMENTS: "STARTER",
};

export const BILLING_CYCLE_MONTHS = {
  MONTHLY: 1,
  YEARLY: 12,
} as const;

export type BillingCycle = keyof typeof BILLING_CYCLE_MONTHS;

export function getPlanByTier(tier: SubscriptionTier) {
  return SUBSCRIPTION_PLANS.find((plan) => plan.tier === tier);
}

export function getPlanAmountInr(tier: SubscriptionTier, billingCycle: BillingCycle) {
  const plan = getPlanByTier(tier);

  if (!plan) {
    return null;
  }

  return billingCycle === "YEARLY" ? plan.yearlyPriceInr : plan.monthlyPriceInr;
}
