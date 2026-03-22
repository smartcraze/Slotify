import Link from "next/link";
import Image from "next/image";
import { CalendarCheck2, Check, Clock3, LogIn, Sparkles } from "lucide-react";

import { BrandLogo } from "@/components/layout/brand-logo";
import { FeaturesCard } from "@/components/pages/features-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LandingPageProps = {
  isLoggedIn: boolean;
};

export function LandingPage({ isLoggedIn }: LandingPageProps) {
  const primaryHref = isLoggedIn ? "/dashboard" : "/sign-in";
  const primaryLabel = isLoggedIn ? "Dashboard" : "Login";

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/30">
      <header className="border-b bg-background/90 backdrop-blur">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between border-x border-border/50 px-4 sm:px-6">
          <BrandLogo href="/" />

          <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/pricing" className="transition hover:text-foreground">Pricing</Link>
            <Link href="/dashboard/event-types" className="transition hover:text-foreground">Event Types</Link>
            <Link href="/dashboard/integrations" className="transition hover:text-foreground">Integrations</Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link href={primaryHref}>
                <LogIn className="size-4" />
                {primaryLabel}
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl border-x border-border/50 px-4 py-12 sm:px-6 lg:py-16">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5" />
              Scheduling for individuals and teams
            </p>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              The aesthetic way to schedule your meetings.
            </h1>

            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              A polished scheduling workflow with public booking pages, timezone-safe slots,
              and payment-ready plan controls. Built for modern creators and teams.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="min-w-40">
                <Link href={isLoggedIn ? "/dashboard" : "/sign-in"}>
                  {isLoggedIn ? "Open dashboard" : "Start with Google"}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-w-40">
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>

            <div className="grid max-w-xl gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <p className="inline-flex items-center gap-2"><Check className="size-4 text-emerald-600" /> Public booking links</p>
              <p className="inline-flex items-center gap-2"><Check className="size-4 text-emerald-600" /> Calendar and Meet sync</p>
              <p className="inline-flex items-center gap-2"><Check className="size-4 text-emerald-600" /> Secure server pricing</p>
              <p className="inline-flex items-center gap-2"><Check className="size-4 text-emerald-600" /> Coupon-ready checkout</p>
            </div>
          </div>

          <div className="relative">
            <Card className="slotify-float-slow overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarCheck2 className="size-5" />
                  Live Scheduling Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                  <div className="relative overflow-hidden rounded-lg border bg-background">
                    <Image
                      src="/sheduling.png"
                      alt="Scheduling illustration"
                      width={560}
                      height={360}
                      className="slotify-scheduling-illustration h-56 w-full object-contain p-3"
                      priority
                    />
                  </div>
              

                <div className="slotify-slide-row grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-md border bg-background px-2 py-2 text-center">09:00</div>
                  <div className="rounded-md border bg-background px-2 py-2 text-center">09:30</div>
                  <div className="rounded-md border bg-primary/15 px-2 py-2 text-center font-medium text-primary">10:00</div>
                </div>
              </CardContent>
            </Card>

            <Card className="slotify-float-fast absolute -right-3 -bottom-5 hidden w-52 border bg-background/95 shadow-lg sm:block">
              <CardContent className="space-y-2 p-4 text-xs">
                <p className="font-medium">Booking Confirmed</p>
                <p className="text-muted-foreground">Google Meet link generated</p>
                <p className="text-muted-foreground">Reminder email queued</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-12">
          <FeaturesCard />
        </section>

      </main>
    </div>
  );
}
