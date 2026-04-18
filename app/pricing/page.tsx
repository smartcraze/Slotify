import type { Metadata } from "next";
import Link from "next/link";

import { BrandLogo } from "@/components/layout/brand-logo";
import { PricingPageContent } from "@/components/pages/pricing-page-content";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/data/branding";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Compare Slotify plans, coupon eligibility, and secure billing rules.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: `${APP_NAME} Pricing`,
    description: "Compare Slotify plans, coupon eligibility, and secure billing rules.",
    url: "/pricing",
    images: ["/sheduling.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} Pricing`,
    description: "Compare Slotify plans, coupon eligibility, and secure billing rules.",
    images: ["/sheduling.png"],
  },
};

export default async function PricingPage() {
  const userId = await getAuthenticatedUserId();

  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          subscriptionTier: true,
          subscriptionStatus: true,
        },
      })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/90 backdrop-blur">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandLogo href="/" showLegalSuffix />

          <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/" className="transition hover:text-foreground">Home</Link>
            <Link href="/pricing" className="text-foreground">Pricing</Link>
            {userId ? <Link href="/dashboard" className="transition hover:text-foreground">Dashboard</Link> : null}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline">
              <Link href={userId ? "/dashboard" : "/sign-in?callbackUrl=%2Fpricing"}>
                {userId ? "Open dashboard" : "Sign in"}
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <PricingPageContent
        isAuthenticated={Boolean(userId)}
        user={
          user
            ? {
                name: user.name,
                email: user.email ?? "",
                subscriptionTier: user.subscriptionTier,
                subscriptionStatus: user.subscriptionStatus,
              }
            : null
        }
      />
    </div>
  );
}
