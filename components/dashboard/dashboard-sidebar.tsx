"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DASHBOARD_NAV_ITEMS,
  getPublicProfileHref,
  isActivePath,
} from "@/components/dashboard/nav-items";

type DashboardSidebarProps = {
  username: string;
  subscriptionTier: string;
};

export function DashboardSidebar(props: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r p-4 lg:block">
      <div className="mb-6 space-y-1">
        <p className="text-sm font-semibold">Cal Clone</p>
        <Badge variant="outline">{props.subscriptionTier}</Badge>
      </div>

      <nav className="space-y-1">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;

          return (
            <Button
              key={item.href}
              asChild
              variant={active ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href={item.href}>
                <Icon className="size-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="mt-6 border-t pt-4">
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href={getPublicProfileHref(props.username)}>
            <span className="truncate">Public Page</span>
          </Link>
        </Button>
      </div>
    </aside>
  );
}
