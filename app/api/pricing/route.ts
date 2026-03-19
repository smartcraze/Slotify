import { ok } from "@/lib/api/response";
import { SUBSCRIPTION_PLANS } from "@/data/subscription-plans";

export async function GET() {
  return ok({
    plans: SUBSCRIPTION_PLANS,
  });
}

export const dynamic = "force-dynamic";
export const maxDuration = 30;
