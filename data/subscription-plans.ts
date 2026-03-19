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
  tier: Exclude<SubscriptionTier, "FREE">;
  name: string;
  monthlyPriceInr: number;
  yearlyPriceInr: number;
  description: string;
  features: SubscriptionFeatureKey[];
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: "STARTER",
    name: "Starter",
    monthlyPriceInr: 499,
    yearlyPriceInr: 4990,
    description: "Core scheduling for individual hosts",
    features: ["CORE_SCHEDULING", "PAYMENTS"],
  },
  {
    tier: "PRO",
    name: "Pro",
    monthlyPriceInr: 1499,
    yearlyPriceInr: 14990,
    description: "Calendar integrations with automated meeting links",
    features: [
      "CORE_SCHEDULING",
      "GOOGLE_CALENDAR_MEET",
      "EMAIL_NOTIFICATIONS",
      "PAYMENTS",
    ],
  },
  {
    tier: "ENTERPRISE",
    name: "Enterprise",
    monthlyPriceInr: 4999,
    yearlyPriceInr: 49990,
    description: "All features with highest limits and priority support",
    features: [
      "CORE_SCHEDULING",
      "GOOGLE_CALENDAR_MEET",
      "EMAIL_NOTIFICATIONS",
      "PAYMENTS",
    ],
  },
];

export const FEATURE_MINIMUM_TIER: Record<SubscriptionFeatureKey, SubscriptionTier> = {
  CORE_SCHEDULING: "STARTER",
  GOOGLE_CALENDAR_MEET: "PRO",
  EMAIL_NOTIFICATIONS: "PRO",
  PAYMENTS: "STARTER",
};
