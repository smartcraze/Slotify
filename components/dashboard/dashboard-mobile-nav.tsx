"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  DASHBOARD_NAV_ITEMS,
  getPublicProfileHref,
  isActivePath,
} from "@/components/dashboard/nav-items";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type DashboardMobileNavProps = {
  username: string;
};

export function DashboardMobileNav(props: DashboardMobileNavProps) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon-sm" variant="outline" className="lg:hidden">
          <Menu className="size-4" />
          <span className="sr-only">Open dashboard navigation</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Dashboard</SheetTitle>
          <SheetDescription className="sr-only">
            Dashboard navigation links and account actions.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-1 p-4">
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

          <Button asChild variant="outline" className="mt-3 w-full justify-start">
            <Link href={getPublicProfileHref(props.username)}>Public Page</Link>
          </Button>

          <SignOutButton className="w-full justify-start" variant="ghost" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
