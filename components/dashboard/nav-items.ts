import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ClipboardList,
  House,
  Link2,
  Puzzle,
  Wallet,
  Wrench,
} from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: House },
  { href: "/dashboard/event-types", label: "Event Types", icon: CalendarDays },
  { href: "/dashboard/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/dashboard/availability", label: "Availability", icon: Wrench },
  { href: "/dashboard/payments", label: "Payments", icon: Wallet },
  { href: "/dashboard/integrations", label: "Integrations", icon: Puzzle },
];

export function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getPublicProfileHref(username: string) {
  return `/${username}`;
}
