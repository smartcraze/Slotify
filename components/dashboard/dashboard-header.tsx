import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { DashboardMobileNav } from "@/components/dashboard/dashboard-mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  title: string;
  subtitle: string;
  username: string;
};

export function DashboardHeader(props: DashboardHeaderProps) {
  return (
    <header className="border-b px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <DashboardMobileNav username={props.username} />
          <div>
            <h1 className="text-lg font-semibold sm:text-xl">{props.title}</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">{props.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/onboarding">Setup</Link>
          </Button>
          <SignOutButton className="hidden sm:inline-flex" />
        </div>
      </div>
    </header>
  );
}
