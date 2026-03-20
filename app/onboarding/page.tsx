import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/pages/onboarding-form";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

function fallbackUsername(email: string | null) {
  const localPart = email?.split("@")[0] ?? "user";
  return localPart
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
}

export default async function OnboardingPage() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    redirect("/sign-in?callbackUrl=%2Fonboarding");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      username: true,
      email: true,
      timezone: true,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <OnboardingForm
      defaultName={user.name ?? ""}
      defaultUsername={user.username ?? fallbackUsername(user.email ?? null)}
      defaultTimezone={user.timezone ?? "UTC"}
    />
  );
}
