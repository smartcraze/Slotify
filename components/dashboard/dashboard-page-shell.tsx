import type { ReactNode } from "react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

type DashboardPageShellProps = {
  title: string;
  subtitle: string;
  username: string;
  subscriptionTier: string;
  children: ReactNode;
};

export function DashboardPageShell(props: DashboardPageShellProps) {
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
          />
          <div className="px-4 py-6 sm:px-6">{props.children}</div>
        </div>
      </div>
    </div>
  );
}
