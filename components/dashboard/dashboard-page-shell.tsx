import type { ReactNode } from "react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

type DashboardPageShellProps = {
  userId: string;
  title: string;
  subtitle: string;
  username: string;
  isGuest?: boolean;
  subscriptionTier: string;
  profileName?: string | null;
  profileImage?: string | null;
  children: ReactNode;
};

export async function DashboardPageShell(props: DashboardPageShellProps) {
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
            profileName={props.profileName}
            profileImage={props.profileImage}
          />
          <div className="px-4 py-6 sm:px-6">
            {props.isGuest ? (
              <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
                Guest mode is enabled. You can explore the app, but write actions are disabled.
              </div>
            ) : null}
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
}
