import { ok } from "@/lib/api/response";
import { SUBSCRIPTION_PLANS } from "@/data/subscription-plans";
import { SUBSCRIPTION_COUPONS } from "@/data/subscription-coupons";

export async function GET() {
  return ok({
    plans: SUBSCRIPTION_PLANS,
    coupons: SUBSCRIPTION_COUPONS.filter((coupon) => coupon.isActive).map((coupon) => ({
      code: coupon.code,
      description: coupon.description,
    })),
  });
}

export const dynamic = "force-dynamic";
export const maxDuration = 30;
