import type { BillingCycle, SubscriptionTier } from "@/data/subscription-plans";

export type CouponConfig = {
  code: string;
  name: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  maxDiscountInr?: number;
  minOrderAmountInr?: number;
  applicableTiers: SubscriptionTier[];
  applicableBillingCycles?: BillingCycle[];
  isActive: boolean;
  usageLimit?: number;
  perUserLimit?: number;
};

export const SUBSCRIPTION_COUPONS: CouponConfig[] = [
  {
    code: "WELCOME20",
    name: "Welcome 20% Off",
    description: "20% off for first-time paid upgrade",
    discountType: "PERCENTAGE",
    discountValue: 20,
    maxDiscountInr: 50,
    applicableTiers: ["STARTER", "PRO"],
    applicableBillingCycles: ["MONTHLY", "YEARLY"],
    isActive: true,
    usageLimit: 5000,
    perUserLimit: 1,
  },
  {
    code: "PRO40",
    name: "Pro Flat 40",
    description: "INR 40 off on Pro monthly",
    discountType: "FIXED_AMOUNT",
    discountValue: 40,
    minOrderAmountInr: 150,
    applicableTiers: ["PRO"],
    applicableBillingCycles: ["MONTHLY"],
    isActive: true,
    usageLimit: 3000,
    perUserLimit: 1,
  },
];
