import { redirect } from "next/navigation";

import { getAuthenticatedUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function requireDashboardUser() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    redirect("/sign-in?callbackUrl=%2Fdashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
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

  if (!user.username) {
    redirect("/onboarding");
  }

  return {
    ...user,
    username: user.username,
  };
}
