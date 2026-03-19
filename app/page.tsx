
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Globe,
  Menu,
  Sparkles,
  Video,
} from "lucide-react";

import { PricingCards } from "@/components/pricing-cards";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const QUICK_LINKS = ["Product", "Pricing", "Integrations", "Changelog"];

const EVENT_TYPES = [
  { id: "intro", label: "30-min Intro", duration: "30 min" },
  { id: "demo", label: "60-min Demo", duration: "60 min" },
  { id: "support", label: "15-min Follow-up", duration: "15 min" },
];

const SLOTS_BY_EVENT: Record<string, string[]> = {
  intro: ["09:00", "09:30", "10:00", "11:00", "14:00", "16:30"],
  demo: ["10:00", "12:00", "15:00", "17:00"],
  support: ["09:15", "11:15", "13:45", "18:00"],
};

const FEATURE_LIST = [
  "Public booking links with timezone-safe slots",
  "Google Meet generation for paid plans",
  "Payment-aware booking lifecycle",
  "Delivery-tracked email notifications",
];

function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Cal Clone</SheetTitle>
          <SheetDescription>
            Scheduling for modern teams, inspired by Cal.com.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-2 px-4">
          {QUICK_LINKS.map((item) => (
            <Button key={item} variant="ghost" className="w-full justify-start">
              {item}
            </Button>
          ))}
          <Separator className="my-3" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Home() {
  return (
    <div className="relative isolate min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg border bg-card">
              <CalendarDays className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Cal Clone</p>
              <p className="text-xs text-muted-foreground">Scheduling platform</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {QUICK_LINKS.map((item) => (
              <Button key={item} variant="ghost" size="sm">
                {item}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button className="hidden sm:inline-flex">
              Start free
              <ArrowRight />
            </Button>
            <MobileMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6 sm:py-10">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Card className="ring-1 ring-border">
            <CardHeader className="gap-4">
              <div className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarImage src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=200&auto=format&fit=crop" alt="Host" />
                  <AvatarFallback>AL</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">Aarav from Cal Clone</CardTitle>
                  <CardDescription>Product calls across 32 countries</CardDescription>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge>
                  <Sparkles />
                  Cal.com-like UX
                </Badge>
                <Badge variant="secondary">
                  <Globe />
                  Timezone smart
                </Badge>
                <Badge variant="secondary">
                  <Video />
                  Meet auto-links
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Pick an event, choose a slot, and confirm in one flow. Free hosts can
                schedule core meetings, while paid plans unlock Meet, notifications, and
                advanced automation.
              </p>
              <ul className="space-y-2">
                {FEATURE_LIST.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 text-foreground" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Button className="sm:flex-1">Book this week</Button>
              <Button variant="outline" className="sm:flex-1">
                View public page
              </Button>
            </CardFooter>
          </Card>

          <Card className="ring-1 ring-border">
            <CardHeader>
              <CardTitle className="text-xl">Live booking preview</CardTitle>
              <CardDescription>
                A responsive scheduling panel similar to Cal.com behavior.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Search by date or timezone" />
              <Tabs defaultValue="intro" className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                  {EVENT_TYPES.map((eventType) => (
                    <TabsTrigger key={eventType.id} value={eventType.id}>
                      {eventType.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {EVENT_TYPES.map((eventType) => (
                  <TabsContent key={eventType.id} value={eventType.id} className="space-y-3 pt-2">
                    <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Clock3 className="size-4 text-muted-foreground" />
                        <span className="text-sm">{eventType.duration}</span>
                      </div>
                      <Badge variant="secondary">Available today</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {SLOTS_BY_EVENT[eventType.id].map((slot) => (
                        <Button key={`${eventType.id}-${slot}`} variant="outline" className="justify-center">
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <PricingCards />

          <Card className="ring-1 ring-border">
            <CardHeader>
              <CardTitle>Integration status</CardTitle>
              <CardDescription>System health for your scheduler stack</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Calendar sync
                </p>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Email delivery
                </p>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Payments
                </p>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
