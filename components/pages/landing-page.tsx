"use client";

import Link from "next/link";
import Image from "next/image";
import { ComponentType, MouseEvent, useEffect, useState } from "react";
import { ArrowRight, CalendarCheck2, Check, Clock3, Grid2x2, LogIn, Sparkles } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import {
  IconBrandGoogle,
  IconBrandGoogleAnalytics,
  IconBrandOffice,
  IconBrandTeams,
  IconBrandZoom,
  IconCalendarEvent,
  IconLayoutDashboard,
  IconVideo,
} from "@tabler/icons-react";

import { BrandLogo } from "@/components/layout/brand-logo";
import { FeaturesCard } from "@/components/pages/features-card";
import { PricingSection } from "@/components/pages/pricing-section";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

type LandingPageProps = {
  isLoggedIn: boolean;
};

const integrations: Array<{
  name: string;
  Icon: ComponentType<{ className?: string; size?: number; stroke?: number }>;
}> = [
  { name: "Google", Icon: IconBrandGoogle },
  { name: "Outlook", Icon: IconBrandOffice },
  { name: "Google Meet", Icon: IconVideo },
  { name: "Google Calendar", Icon: IconCalendarEvent },
  { name: "Microsoft Teams", Icon: IconBrandTeams },
  { name: "Dashboard", Icon: IconLayoutDashboard },
  { name: "Zoom", Icon: IconBrandZoom },
  { name: "Analytics", Icon: IconBrandGoogleAnalytics },
];

const iconTones = ["text-primary", "text-chart-1", "text-chart-2", "text-chart-3", "text-chart-4", "text-chart-5"];

export function LandingPage({ isLoggedIn }: LandingPageProps) {
  const primaryHref = isLoggedIn ? "/dashboard" : "/sign-in";
  const primaryLabel = isLoggedIn ? "Dashboard" : "Login";

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springRotateX = useSpring(rotateX, { stiffness: 220, damping: 24, mass: 0.7 });
  const springRotateY = useSpring(rotateY, { stiffness: 220, damping: 24, mass: 0.7 });
  const orbX = useTransform(springRotateY, [-10, 10], [-16, 16]);
  const orbY = useTransform(springRotateX, [-10, 10], [16, -16]);
  const [iconTone, setIconTone] = useState(iconTones[0]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const randomTone = iconTones[Math.floor(Math.random() * iconTones.length)];
      setIconTone(randomTone);
    }, 1400);

    return () => window.clearInterval(interval);
  }, []);

  function onPreviewMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const normalizedX = x / rect.width - 0.5;
    const normalizedY = y / rect.height - 0.5;

    rotateY.set(normalizedX * 12);
    rotateX.set(-normalizedY * 10);
  }

  function onPreviewMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/30">
      <header className="border-b bg-background/90 backdrop-blur">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between border-x border-border/50 px-4 sm:px-6">
          <BrandLogo href="/" showLegalSuffix />

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

          <motion.div
            className="relative perspective-[1400px]"
            initial={{ opacity: 0, y: 24, rotateX: 4 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            onMouseMove={onPreviewMouseMove}
            onMouseLeave={onPreviewMouseLeave}
          >
            <motion.div
              className="pointer-events-none absolute -inset-4 -z-10 rounded-4xl bg-radial from-primary/20 via-transparent to-transparent blur-2xl"
              style={{ x: orbX, y: orbY }}
            />

            <motion.div
              style={{
                rotateX: springRotateX,
                rotateY: springRotateY,
                transformStyle: "preserve-3d",
              }}
            >
              <Card className="slotify-float-slow relative overflow-hidden border-primary/20 bg-background/95 shadow-2xl shadow-primary/10">
              <DottedGlowBackground
                className="pointer-events-none mask-radial-to-90% mask-radial-at-center"
                opacity={1}
                gap={10}
                radius={1.6}
                colorLightVar="--color-neutral-500"
                glowColorLightVar="--color-neutral-600"
                colorDarkVar="--color-neutral-500"
                glowColorDarkVar="--color-sky-800"
                backgroundOpacity={0}
                speedMin={0.3}
                speedMax={1.6}
                speedScale={1}
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-background/5 to-background/35" />

              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarCheck2 className="size-5" />
                  Live Scheduling Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                  <motion.div
                    className="relative overflow-hidden rounded-lg border bg-background"
                    style={{ transform: "translateZ(26px)" }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  >
                    <Image
                      src="/sheduling.png"
                      alt="Scheduling illustration"
                      width={560}
                      height={360}
                      className="slotify-scheduling-illustration h-56 w-full object-contain p-3"
                      priority
                    />
                  </motion.div>

                <div className="slotify-slide-row grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-md border bg-background px-2 py-2 text-center">09:00</div>
                  <div className="rounded-md border bg-background px-2 py-2 text-center">09:30</div>
                  <div className="rounded-md border bg-primary/15 px-2 py-2 text-center font-medium text-primary">10:00</div>
                </div>
              </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="absolute -right-3 -bottom-5 hidden sm:block"
              style={{ transform: "translateZ(38px)" }}
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.35 }}
            >
              <Card className="slotify-float-fast w-52 border bg-background/95 shadow-lg">
                <CardContent className="space-y-2 p-4 text-xs">
                  <p className="font-medium">Booking Confirmed</p>
                  <p className="text-muted-foreground">Google Meet link generated</p>
                  <p className="text-muted-foreground">Reminder email queued</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        <section className="mt-12">
          <FeaturesCard />
        </section>

        <section className="mt-14">
          <Card className="border-border/80 bg-card/70 p-6 shadow-lg sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-5">
                <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm text-foreground/90">
                  <Grid2x2 className="size-4" />
                  App store
                </p>

                <h2 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  All your key tools in-sync with your meetings
                </h2>

                <p className="max-w-xl text-lg text-muted-foreground">
                  Slotify works with tools already in your workflow so scheduling, meeting links, and event updates stay connected.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href={isLoggedIn ? "/dashboard/integrations" : "/sign-in"}>
                      Get started
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/dashboard/integrations">
                      Explore apps
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div>
                <div className="grid grid-cols-2 sm:grid-cols-4">
                  {integrations.map((integration, index) => (
                    <motion.div
                      key={integration.name}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.45 }}
                      transition={{ duration: 0.35, delay: index * 0.03 }}
                      className={`group flex min-h-34 items-center justify-center border-border p-4 text-center ${
                        index % 2 === 1 ? "border-l" : ""
                      } ${index >= 2 ? "border-t" : ""} ${index % 4 !== 0 ? "sm:border-l" : "sm:border-l-0"} ${
                        index >= 4 ? "sm:border-t" : "sm:border-t-0"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="mx-auto grid size-11 place-items-center transition group-hover:-translate-y-0.5">
                          <integration.Icon className={`size-6 transition-colors duration-500 ${iconTone}`} stroke={1.8} />
                        </div>
                        <p className="text-xs text-muted-foreground">{integration.name}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-16">
          <PricingSection
            billingCycle="MONTHLY"
            isAuthenticated={isLoggedIn}
            title="Pricing"
            description="Choose the right plan and upgrade when you are ready."
          />
        </section>

      </main>
    </div>
  );
}
