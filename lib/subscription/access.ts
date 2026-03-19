import {
  FEATURE_MINIMUM_TIER,
  SUBSCRIPTION_TIER_ORDER,
  type SubscriptionFeatureKey,
  type SubscriptionTier,
} from "@/data/subscription-plans";
import { prisma } from "@/lib/prisma";

type SubscriptionStatus = "INACTIVE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";

type SubscriptionSnapshot = {
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndsAt: Date | null;
};

function isPaidTier(tier: SubscriptionTier) {
  return tier !== "FREE";
}

function hasActiveSubscriptionStatus(status: SubscriptionStatus) {
  return status === "ACTIVE" || status === "TRIALING";
}

function isSubscriptionExpired(endsAt: Date | null) {
  if (!endsAt) {
    return false;
  }

  return endsAt.getTime() <= Date.now();
}

function tierRank(tier: SubscriptionTier) {
  return SUBSCRIPTION_TIER_ORDER.indexOf(tier);
}

function hasMinimumTier(currentTier: SubscriptionTier, minimumTier: SubscriptionTier) {
  return tierRank(currentTier) >= tierRank(minimumTier);
}

function hasFeatureAccess(snapshot: SubscriptionSnapshot, feature: SubscriptionFeatureKey) {
  if (!isPaidTier(snapshot.subscriptionTier)) {
    return false;
  }

  if (!hasActiveSubscriptionStatus(snapshot.subscriptionStatus)) {
    return false;
  }

  if (isSubscriptionExpired(snapshot.subscriptionEndsAt)) {
    return false;
  }

  const minimumTier = FEATURE_MINIMUM_TIER[feature];
  return hasMinimumTier(snapshot.subscriptionTier, minimumTier);
}

async function getSubscriptionSnapshot(userId: string): Promise<SubscriptionSnapshot | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      subscriptionEndsAt: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    subscriptionTier: user.subscriptionTier,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionEndsAt: user.subscriptionEndsAt,
  };
}

export async function canUserAccessFeature(userId: string, feature: SubscriptionFeatureKey) {
  const snapshot = await getSubscriptionSnapshot(userId);

  if (!snapshot) {
    return false;
  }

  return hasFeatureAccess(snapshot, feature);
}

export async function canHostAccessFeature(hostId: string, feature: SubscriptionFeatureKey) {
  return canUserAccessFeature(hostId, feature);
}
