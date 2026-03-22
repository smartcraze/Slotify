"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { HostSetupStatus } from "@/lib/dashboard";

type SetupChecklistCardProps = {
  setup: HostSetupStatus;
};

function StepItem(props: {
  label: string;
  done: boolean;
  href: string;
  action: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm">
      <div className="flex items-center gap-2">
        <Badge variant={props.done ? "default" : "secondary"}>{props.done ? "Done" : "Pending"}</Badge>
        <span>{props.label}</span>
      </div>
      {!props.done ? (
        <Button asChild size="sm" variant="outline">
          <Link href={props.href}>{props.action}</Link>
        </Button>
      ) : null}
    </div>
  );
}

export function SetupChecklistCard(props: SetupChecklistCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const complete =
    props.setup.hasEventType && props.setup.hasAvailability && props.setup.hasGoogleCalendar;

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Host setup checklist</CardTitle>
            <CardDescription>
              Complete these steps so users can book confidently and meetings sync to Google Calendar.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => setIsOpen((value) => !value)}
            aria-expanded={isOpen}
          >
            {isOpen ? "Collapse" : "Expand"}
            {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
      </CardHeader>
      {isOpen ? <CardContent className="space-y-2">
        <StepItem
          label="Create at least one event type"
          done={props.setup.hasEventType}
          href="/dashboard/event-types"
          action="Open event types"
        />
        <StepItem
          label="Set your availability rules"
          done={props.setup.hasAvailability}
          href="/dashboard/availability"
          action="Set availability"
        />
        <StepItem
          label="Connect Google Calendar"
          done={props.setup.hasGoogleCalendar}
          href="/dashboard/integrations"
          action="Connect now"
        />

        {complete ? (
          <p className="pt-1 text-sm text-emerald-700">All set. Your booking flow is fully configured.</p>
        ) : (
          <p className="pt-1 text-sm text-muted-foreground">
            Tip: connect Google Calendar last to enable automatic event creation and Meet links.
          </p>
        )}
      </CardContent> : null}
    </Card>
  );
}
