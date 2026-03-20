"use client";

import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type AvailabilitySlot = {
  startTimeUtc: string;
  endTimeUtc: string;
};

type PublicSchedulerProps = {
  hostId: string;
  hostName: string;
  hostBio: string | null;
  hostTimezone: string;
  eventTypeId: string;
  eventTypeName: string;
  eventDurationMinutes: number;
};

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function PublicScheduler(props: PublicSchedulerProps) {
  const today = useMemo(() => toDateKey(new Date()), []);
  const [dateKey, setDateKey] = useState(today);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestNotes, setGuestNotes] = useState("");
  const [bookingState, setBookingState] = useState<"idle" | "submitting" | "success">("idle");
  const [bookingError, setBookingError] = useState<string | null>(null);

  const attendeeTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    []
  );

  async function loadSlots(nextDateKey: string) {
    setLoadingSlots(true);
    setSlotError(null);
    setSelectedSlot(null);
    setBookingState("idle");
    setBookingError(null);

    const query = new URLSearchParams({
      hostId: props.hostId,
      eventTypeId: props.eventTypeId,
      startDate: nextDateKey,
      endDate: nextDateKey,
    });

    const response = await fetch(`/api/availability?${query.toString()}`);
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.success) {
      setSlotError(payload?.error?.message ?? "Failed to load available slots");
      setSlots([]);
      setLoadingSlots(false);
      return;
    }

    setSlots(payload.data as AvailabilitySlot[]);
    setLoadingSlots(false);
  }

  async function onDateChange(value: string) {
    setDateKey(value);
    await loadSlots(value);
  }

  async function onBookSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSlot) {
      return;
    }

    setBookingState("submitting");
    setBookingError(null);

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hostId: props.hostId,
        eventTypeId: props.eventTypeId,
        startTimeUtc: selectedSlot.startTimeUtc,
        endTimeUtc: selectedSlot.endTimeUtc,
        guestEmail,
        guestName: guestName || undefined,
        guestNotes: guestNotes || undefined,
        attendeeTimezone,
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.success) {
      setBookingError(payload?.error?.message ?? "Failed to create booking");
      setBookingState("idle");
      return;
    }

    setBookingState("success");
    setSelectedSlot(null);
    setGuestName("");
    setGuestEmail("");
    setGuestNotes("");
    await loadSlots(dateKey);
  }

  function formatSlot(value: string) {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-6 rounded-xl border bg-card p-4 sm:p-6 lg:grid-cols-[320px_1fr_300px]">
        <section className="space-y-4 border-b pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
          <div>
            <p className="text-sm text-muted-foreground">{props.hostName}</p>
            <h1 className="text-3xl font-semibold">{props.eventTypeName}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{props.eventDurationMinutes} minutes</p>
          <p className="text-sm text-muted-foreground">Timezone: {props.hostTimezone}</p>
          {props.hostBio ? <p className="text-sm text-muted-foreground">{props.hostBio}</p> : null}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium" htmlFor="bookingDate">
              Select date
            </label>
            <Input
              id="bookingDate"
              type="date"
              value={dateKey}
              min={today}
              onChange={(event) => void onDateChange(event.target.value)}
              className="max-w-[220px]"
            />
          </div>

          {loadingSlots ? <p className="text-sm text-muted-foreground">Loading slots...</p> : null}
          {slotError ? <p className="text-sm text-destructive">{slotError}</p> : null}

          {!loadingSlots && !slotError && slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No slots available for this date.</p>
          ) : null}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.startTimeUtc === slot.startTimeUtc;
              return (
                <Button
                  key={slot.startTimeUtc}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {formatSlot(slot.startTimeUtc)}
                </Button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4 border-t pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
          {bookingState === "success" ? (
            <div className="rounded-md border bg-background p-3 text-sm">
              Booking confirmed. Check your email for details.
            </div>
          ) : null}

          <p className="text-sm font-medium">
            {selectedSlot
              ? `Selected: ${formatSlot(selectedSlot.startTimeUtc)}`
              : "Choose a time to continue"}
          </p>

          <form className="space-y-3" onSubmit={onBookSlot}>
            <Input
              type="text"
              placeholder="Your name"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
            />
            <Input
              type="email"
              placeholder="you@example.com"
              value={guestEmail}
              onChange={(event) => setGuestEmail(event.target.value)}
              required
            />
            <Textarea
              placeholder="Notes (optional)"
              value={guestNotes}
              onChange={(event) => setGuestNotes(event.target.value)}
              rows={4}
            />

            {bookingError ? <p className="text-sm text-destructive">{bookingError}</p> : null}

            <Button type="submit" disabled={!selectedSlot || bookingState === "submitting"} className="w-full">
              {bookingState === "submitting" ? "Booking..." : "Book meeting"}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
