import { addMonths } from "date-fns";

import { BILLING_CYCLE_MONTHS, type BillingCycle } from "@/data/subscription-plans";

export function computeSubscriptionPeriod(input: {
  billingCycle: BillingCycle;
  from?: Date;
}) {
  const startsAt = input.from ?? new Date();
  const months = BILLING_CYCLE_MONTHS[input.billingCycle];
  const endsAt = addMonths(startsAt, months);

  return { startsAt, endsAt };
}
