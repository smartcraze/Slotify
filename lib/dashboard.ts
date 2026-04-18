import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export type HostSetupStatus = {
  hasUsername: boolean;
  hasEventType: boolean;
  hasAvailability: boolean;
  hasGoogleCalendar: boolean;
};

export async function requireDashboardUser() {
  const authUser = await getAuthenticatedUser();

  if (!authUser) {
    redirect("/sign-in?callbackUrl=%2Fdashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      username: true,
      timezone: true,
      subscriptionTier: true,
      subscriptionStatus: true,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  if (!user.username && !authUser.isGuest) {
    redirect("/onboarding");
  }

  return {
    ...user,
    username: user.username ?? "guest-preview",
    isGuest: authUser.isGuest,
  };
}

export async function getHostSetupStatus(userId: string): Promise<HostSetupStatus> {
  const [eventTypeCount, availabilityRuleCount, googleAccount] =
    await Promise.all([
      prisma.eventType.count({ where: { hostId: userId } }),
      prisma.availabilityRule.count({ where: { hostId: userId } }),
      prisma.account.findFirst({
        where: { userId, providerId: "google" },
        select: { id: true },
      }),
    ]);

  return {
    hasUsername: true,
    hasEventType: eventTypeCount > 0,
    hasAvailability: availabilityRuleCount > 0,
    hasGoogleCalendar: Boolean(googleAccount),
  };
}
