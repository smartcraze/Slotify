"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GUEST_MODE_RESTRICTION_MESSAGE } from "@/lib/auth/guest";

type EventTypeOption = {
  id: string;
  name: string;
};

type Slot = {
  startTimeUtc: string;
  endTimeUtc: string;
};

type AvailabilityCheckerProps = {
  hostId: string;
  eventTypes: EventTypeOption[];
  isGuest?: boolean;
};

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function AvailabilityChecker(props: AvailabilityCheckerProps) {
  const today = useMemo(() => dateKey(new Date()), []);
  const [eventTypeId, setEventTypeId] = useState(props.eventTypes[0]?.id || "");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadSlots() {
    if (props.isGuest) {
      toast.warning(GUEST_MODE_RESTRICTION_MESSAGE);
      return;
    }

    if (!eventTypeId) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const query = new URLSearchParams({
      hostId: props.hostId,
      eventTypeId,
      startDate,
      endDate,
    });

    const response = await fetch(`/api/availability?${query.toString()}`);
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.success) {
      setErrorMessage(payload?.error?.message ?? "Failed to load slots");
      setSlots([]);
      setLoading(false);
      return;
    }

    setSlots(payload.data as Slot[]);
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_150px_150px_auto]">
        <select
          value={eventTypeId}
          onChange={(event) => setEventTypeId(event.target.value)}
          className="flex h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
        >
          {props.eventTypes.map((eventType) => (
            <option key={eventType.id} value={eventType.id}>{eventType.name}</option>
          ))}
        </select>
        <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        <Button onClick={loadSlots} disabled={loading}>{loading ? "Loading..." : "Fetch"}</Button>
      </div>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <div className="max-h-72 space-y-2 overflow-auto rounded-md border p-3">
        {slots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No slots loaded.</p>
        ) : (
          slots.map((slot) => (
            <div key={slot.startTimeUtc} className="rounded border p-2 text-sm">
              {new Date(slot.startTimeUtc).toLocaleString()}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
