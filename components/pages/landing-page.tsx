import Link from "next/link";
import { CalendarCheck2, CalendarDays, LogIn, Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <header className="border-b bg-background/90 backdrop-blur">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <CalendarDays className="size-5" />
            <span>Cal Clone</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link href="/sign-in">
                <LogIn className="size-4" />
                Login
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
        <section className="space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5" />
            Scheduling for individuals and teams
          </p>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Simple scheduling, fast booking, clean workflow.
          </h1>

          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            Share your booking link, let people pick a time, and keep everything in sync.
            Built for a Cal.com-style scheduling experience.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/sign-in">Start with Google</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sign-in">Use email and password</Link>
            </Button>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck2 className="size-5" />
              What you get
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Public booking pages and event types</p>
            <p>Timezone-aware availability slots</p>
            <p>Google Meet and calendar integration</p>
            <p>Payments and booking lifecycle handling</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
