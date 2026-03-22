import { prisma } from "@/lib/prisma";
import {
  getPlanAmountInr,
  getPlanByTier,
  type BillingCycle,
  type SubscriptionTier,
} from "@/data/subscription-plans";
import { SUBSCRIPTION_COUPONS } from "@/data/subscription-coupons";

type QuoteInput = {
  tier: SubscriptionTier;
  billingCycle: BillingCycle;
  couponCode?: string;
  userId?: string;
};

export type PricingQuote = {
  tier: SubscriptionTier;
  billingCycle: BillingCycle;
  amountInr: number;
  discountInr: number;
  finalAmountInr: number;
  couponId?: string;
  couponCode?: string;
};

function calculateDiscountInr(input: {
  amountInr: number;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  maxDiscountInr: number | null;
}) {
  if (input.amountInr <= 0) {
    return 0;
  }

  let discountInr =
    input.discountType === "PERCENTAGE"
      ? Math.floor((input.amountInr * input.discountValue) / 100)
      : input.discountValue;

  if (input.maxDiscountInr && discountInr > input.maxDiscountInr) {
    discountInr = input.maxDiscountInr;
  }

  if (discountInr < 0) {
    return 0;
  }

  if (discountInr > input.amountInr) {
    return input.amountInr;
  }

  return discountInr;
}

export async function syncConfiguredCoupons() {
  await Promise.all(
    SUBSCRIPTION_COUPONS.map((coupon) =>
      prisma.coupon.upsert({
        where: { code: coupon.code.toUpperCase() },
        update: {
          name: coupon.name,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          maxDiscountInr: coupon.maxDiscountInr ?? null,
          minOrderAmountInr: coupon.minOrderAmountInr ?? null,
          applicableTiers: coupon.applicableTiers,
          isActive: coupon.isActive,
          usageLimit: coupon.usageLimit ?? null,
          perUserLimit: coupon.perUserLimit ?? 1,
        },
        create: {
          code: coupon.code.toUpperCase(),
          name: coupon.name,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          maxDiscountInr: coupon.maxDiscountInr ?? null,
          minOrderAmountInr: coupon.minOrderAmountInr ?? null,
          applicableTiers: coupon.applicableTiers,
          isActive: coupon.isActive,
          usageLimit: coupon.usageLimit ?? null,
          perUserLimit: coupon.perUserLimit ?? 1,
        },
      })
    )
  );
}

export async function buildPricingQuote(input: QuoteInput): Promise<PricingQuote> {
  const plan = getPlanByTier(input.tier);

  if (!plan) {
    throw new Error("Selected plan is not available");
  }

  const amountInr = getPlanAmountInr(input.tier, input.billingCycle);

  if (amountInr === null) {
    throw new Error("Unable to resolve plan amount");
  }

  if (!input.couponCode) {
    return {
      tier: input.tier,
      billingCycle: input.billingCycle,
      amountInr,
      discountInr: 0,
      finalAmountInr: amountInr,
    };
  }

  const normalizedCode = input.couponCode.trim().toUpperCase();
  const configuredCoupon = SUBSCRIPTION_COUPONS.find(
    (coupon) => coupon.code.toUpperCase() === normalizedCode
  );

  if (!normalizedCode) {
    return {
      tier: input.tier,
      billingCycle: input.billingCycle,
      amountInr,
      discountInr: 0,
      finalAmountInr: amountInr,
    };
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: normalizedCode },
    select: {
      id: true,
      code: true,
      isActive: true,
      startsAt: true,
      endsAt: true,
      discountType: true,
      discountValue: true,
      maxDiscountInr: true,
      minOrderAmountInr: true,
      usageLimit: true,
      perUserLimit: true,
      usedCount: true,
      applicableTiers: true,
      redemptions: input.userId
        ? {
            where: { userId: input.userId },
            select: { id: true },
          }
        : false,
    },
  });

  if (!coupon || !coupon.isActive) {
    throw new Error("Invalid coupon code");
  }

  if (
    configuredCoupon?.applicableBillingCycles &&
    !configuredCoupon.applicableBillingCycles.includes(input.billingCycle)
  ) {
    throw new Error("Coupon is not valid for this billing cycle");
  }

  const now = Date.now();
  if (coupon.startsAt && coupon.startsAt.getTime() > now) {
    throw new Error("Coupon is not active yet");
  }

  if (coupon.endsAt && coupon.endsAt.getTime() < now) {
    throw new Error("Coupon has expired");
  }

  if (!coupon.applicableTiers.includes(input.tier)) {
    throw new Error("Coupon is not valid for this plan");
  }

  if (coupon.minOrderAmountInr && amountInr < coupon.minOrderAmountInr) {
    throw new Error("Coupon minimum order value not met");
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("Coupon usage limit reached");
  }

  if (
    input.userId &&
    coupon.perUserLimit &&
    Array.isArray(coupon.redemptions) &&
    coupon.redemptions.length >= coupon.perUserLimit
  ) {
    throw new Error("Coupon usage limit reached for this user");
  }

  const discountInr = calculateDiscountInr({
    amountInr,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maxDiscountInr: coupon.maxDiscountInr,
  });

  return {
    tier: input.tier,
    billingCycle: input.billingCycle,
    amountInr,
    discountInr,
    finalAmountInr: Math.max(0, amountInr - discountInr),
    couponId: coupon.id,
    couponCode: coupon.code,
  };
}
