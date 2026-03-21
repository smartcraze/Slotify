import type { ReactNode } from "react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSetupBanner } from "@/components/dashboard/dashboard-setup-banner";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { prisma } from "@/lib/prisma";

type DashboardPageShellProps = {
  userId: string;
  title: string;
  subtitle: string;
  username: string;
  subscriptionTier: string;
  children: ReactNode;
};

export async function DashboardPageShell(props: DashboardPageShellProps) {
  const profile = await prisma.user.findUnique({
    where: { id: props.userId },
    select: {
      name: true,
      image: true,
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-7xl">
        <DashboardSidebar
          username={props.username}
          subscriptionTier={props.subscriptionTier}
        />

        <div className="min-w-0 flex-1">
          <DashboardHeader
            title={props.title}
            subtitle={props.subtitle}
            username={props.username}
            profileName={profile?.name}
            profileImage={profile?.image}
          />
          <div className="px-4 py-6 sm:px-6">
            <DashboardSetupBanner userId={props.userId} />
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
}
