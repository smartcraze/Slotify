import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { DashboardMobileNav } from "@/components/dashboard/dashboard-mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  title: string;
  subtitle: string;
  username: string;
  profileName?: string | null;
  profileImage?: string | null;
};

export function DashboardHeader(props: DashboardHeaderProps) {
  const displayName = props.profileName || `@${props.username}`;
  const avatarFallback = displayName.trim().charAt(0).toUpperCase() || "U";

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
          <div className="hidden items-center gap-2 rounded-xl border bg-card px-2 py-1 sm:flex">
            <Avatar size="sm" className="ring-2 ring-primary/15">
              <AvatarImage src={props.profileImage ?? undefined} alt={displayName} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <p className="max-w-32 truncate text-xs font-medium text-foreground/90">{displayName}</p>
          </div>
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
