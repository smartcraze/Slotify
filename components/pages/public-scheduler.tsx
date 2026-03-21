"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, Globe, Video } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type AvailabilitySlot = {
  startTimeUtc: string;
  endTimeUtc: string;
};

type PublicSchedulerProps = {
  hostId: string;
  hostName: string;
  hostImage?: string | null;
  hostBio: string | null;
  hostTimezone: string;
  eventTypeId: string;
  eventTypeName: string;
  eventDurationMinutes: number;
};

type BookingConfirmationDetails = {
  id: string;
  status: string;
  createdAt: string;
  startTimeUtc: string;
  endTimeUtc: string;
  guestName: string | null;
  guestEmail: string;
  guestNotes: string | null;
  meetingLink: string | null;
  integrationStatus?: {
    calendar?: {
      attempted: boolean;
      success: boolean;
      message: string;
    };
    email?: {
      sent: boolean;
      message: string;
    };
  };
};

const DISPLAY_LOCALE = "en-US";

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function PublicScheduler(props: PublicSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [step, setStep] = useState<"slots" | "details" | "success">("slots");
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<AvailabilitySlot | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestNotes, setGuestNotes] = useState("");
  const [bookingState, setBookingState] = useState<"idle" | "submitting" | "success">("idle");
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingConfirmationDetails | null>(
    null
  );

  const attendeeTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    []
  );
  const dateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);
  const today = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);

  const loadSlots = useCallback(async (nextDate: Date) => {
    const nextDateKey = toDateKey(nextDate);

    setLoadingSlots(true);
    setSlotError(null);
    setActiveSlot(null);
    setBookingState("idle");
    setBookingError(null);
    setConfirmedBooking(null);

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
  }, [props.eventTypeId, props.hostId]);

  useEffect(() => {
    void loadSlots(selectedDate);
  }, [selectedDate, loadSlots]);

  function onDateChange(nextDate: Date | undefined) {
    if (!nextDate) {
      return;
    }

    setSelectedDate(nextDate);
    setStep("slots");
  }

  async function onBookSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeSlot) {
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
        startTimeUtc: activeSlot.startTimeUtc,
        endTimeUtc: activeSlot.endTimeUtc,
        guestEmail,
        guestName: guestName || undefined,
        guestNotes: guestNotes || undefined,
        attendeeTimezone,
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.success) {
      setBookingError(payload?.error?.message ?? "Failed to create booking");
      toast.error(payload?.error?.message ?? "Failed to create booking");
      setBookingState("idle");
      return;
    }

    const booking = payload.data as {
      id: string;
      status: string;
      createdAt: string;
      startTimeUtc: string;
      endTimeUtc: string;
      guestName: string | null;
      guestEmail: string;
      guestNotes: string | null;
      meetingLink: string | null;
      integrationStatus?: {
        calendar?: {
          attempted: boolean;
          success: boolean;
          message: string;
        };
        email?: {
          sent: boolean;
          message: string;
        };
      };
    };

    toast.success("Booking confirmed");

    if (booking.integrationStatus?.calendar?.attempted && !booking.integrationStatus.calendar.success) {
      toast.warning(booking.integrationStatus.calendar.message);
    }

    if (booking.integrationStatus?.email && !booking.integrationStatus.email.sent) {
      toast.warning(booking.integrationStatus.email.message);
    }

    setBookingState("success");
    setConfirmedBooking(booking);
    setStep("success");
  }

  function formatSlot(value: string) {
    return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  function formatSelectedDate(value: Date) {
    return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(value);
  }

  function formatFullDateTime(value: string) {
    return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(value));
  }

  function onSelectSlot(slot: AvailabilitySlot) {
    setActiveSlot(slot);
  }

  function onContinueToDetails() {
    if (!activeSlot) {
      return;
    }

    setStep("details");
  }

  const hostInitial = props.hostName.trim().charAt(0).toUpperCase() || "H";

  if (step === "success" && confirmedBooking) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="mx-auto grid w-full max-w-3xl gap-0 overflow-hidden rounded-2xl border bg-card md:grid-cols-[320px_1fr]">
          <section className="space-y-4 border-b p-6 md:border-b-0 md:border-r">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Step 3 of 3
            </p>

            <h1 className="text-3xl font-semibold">Booking Confirmed</h1>

            <p className="text-sm text-muted-foreground">
              Your meeting request has been confirmed and added to the host schedule.
            </p>
          </section>

          <section className="space-y-4 p-6">
            <div className="space-y-3 rounded-lg border bg-background p-4 text-sm">
              <p><span className="font-medium">Booking ID:</span> {confirmedBooking.id}</p>
              <p><span className="font-medium">Status:</span> {confirmedBooking.status}</p>
              <p>
                <span className="font-medium">With whom:</span> {props.hostName}
                {confirmedBooking.guestName ? ` and ${confirmedBooking.guestName}` : ""}
              </p>
              <p><span className="font-medium">Guest email:</span> {confirmedBooking.guestEmail}</p>
              <p><span className="font-medium">When:</span> {formatFullDateTime(confirmedBooking.startTimeUtc)}</p>
              <p><span className="font-medium">Ends:</span> {formatFullDateTime(confirmedBooking.endTimeUtc)}</p>
              <p><span className="font-medium">Host timezone:</span> {props.hostTimezone}</p>
              <p><span className="font-medium">Your timezone:</span> {attendeeTimezone}</p>
              <p><span className="font-medium">Where:</span> Google Meet</p>
              <p><span className="font-medium">Platform:</span> Google Calendar + Google Meet</p>
              <p>
                <span className="font-medium">Meeting link:</span>{" "}
                {confirmedBooking.meetingLink ? (
                  <a
                    href={confirmedBooking.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    Join meeting
                  </a>
                ) : (
                  "Will be sent by email after calendar sync"
                )}
              </p>
              <p>
                <span className="font-medium">Calendar sync:</span>{" "}
                {confirmedBooking.integrationStatus?.calendar?.message ?? "Not attempted"}
              </p>
              <p>
                <span className="font-medium">Email delivery:</span>{" "}
                {confirmedBooking.integrationStatus?.email?.message ?? "Unknown"}
              </p>
              <p>
                <span className="font-medium">Created at:</span>{" "}
                {formatFullDateTime(confirmedBooking.createdAt)}
              </p>
              <p>
                <span className="font-medium">Notes:</span>{" "}
                {confirmedBooking.guestNotes || "No additional notes"}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  setStep("slots");
                  setActiveSlot(null);
                  setGuestName("");
                  setGuestEmail("");
                  setGuestNotes("");
                  setBookingState("idle");
                  setBookingError(null);
                  setConfirmedBooking(null);
                  await loadSlots(selectedDate);
                }}
              >
                Book another slot
              </Button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (step === "details" && activeSlot) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="mx-auto grid w-full max-w-3xl gap-0 overflow-hidden rounded-2xl border bg-card md:grid-cols-[320px_1fr]">
          <section className="space-y-4 border-b p-6 md:border-b-0 md:border-r">
            <div className="flex items-center gap-3">
              <Avatar size="default" className="ring-2 ring-primary/15">
                <AvatarImage src={props.hostImage ?? undefined} alt={props.hostName} />
                <AvatarFallback>{hostInitial}</AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">{props.hostName}</p>
            </div>

            <h1 className="text-3xl font-semibold">{props.eventTypeName}</h1>

            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Step 2 of 3
            </p>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <CalendarDays className="size-4" />
                {formatSelectedDate(selectedDate)}
              </p>
              <p className="flex items-center gap-2">
                <Clock3 className="size-4" />
                {formatSlot(activeSlot.startTimeUtc)} - {formatSlot(activeSlot.endTimeUtc)}
              </p>
              <p className="flex items-center gap-2">
                <Video className="size-4" />
                Google Meet
              </p>
              <p className="flex items-center gap-2">
                <Globe className="size-4" />
                {attendeeTimezone}
              </p>
            </div>
          </section>

          <section className="space-y-4 p-6">
            <form className="space-y-4" onSubmit={onBookSlot}>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="guestName">
                  Your name
                </label>
                <Input
                  id="guestName"
                  type="text"
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="guestEmail">
                  Email address
                </label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={guestEmail}
                  onChange={(event) => setGuestEmail(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="guestNotes">
                  Additional notes
                </label>
                <Textarea
                  id="guestNotes"
                  placeholder="Please share anything that will help prepare for our meeting."
                  value={guestNotes}
                  onChange={(event) => setGuestNotes(event.target.value)}
                  rows={4}
                />
              </div>

              {bookingError ? <p className="text-sm text-destructive">{bookingError}</p> : null}

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("slots")}
                >
                  Back
                </Button>
                <Button type="submit" disabled={bookingState === "submitting"}>
                  {bookingState === "submitting" ? "Confirming..." : "Confirm"}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-0 overflow-hidden rounded-2xl border bg-card lg:grid-cols-[280px_1fr_280px]">
        <section className="space-y-4 border-b p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <Avatar size="default" className="ring-2 ring-primary/15">
              <AvatarImage src={props.hostImage ?? undefined} alt={props.hostName} />
              <AvatarFallback>{hostInitial}</AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">{props.hostName}</p>
          </div>
          <h1 className="text-4xl font-semibold leading-tight">{props.eventTypeName}</h1>

          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Step 1 of 3
          </p>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Clock3 className="size-4" />
              {props.eventDurationMinutes}m
            </p>
            <p className="flex items-center gap-2">
              <Video className="size-4" />
              Google Meet
            </p>
            <p className="flex items-center gap-2">
              <Globe className="size-4" />
              {props.hostTimezone}
            </p>
          </div>

          {props.hostBio ? <p className="text-sm text-muted-foreground">{props.hostBio}</p> : null}
        </section>

        <section className="space-y-3 border-b p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">{new Intl.DateTimeFormat(DISPLAY_LOCALE, { month: "long", year: "numeric" }).format(selectedDate)}</h2>
            <p className="text-xs text-muted-foreground">Select date</p>
          </div>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            disabled={{ before: today }}
            className="w-full rounded-lg border bg-background"
          />

          {loadingSlots ? <p className="text-sm text-muted-foreground">Loading slots...</p> : null}
          {slotError ? <p className="text-sm text-destructive">{slotError}</p> : null}
        </section>

        <section className="space-y-3 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">
              {new Intl.DateTimeFormat(DISPLAY_LOCALE, { weekday: "short", day: "numeric" }).format(selectedDate)}
            </h2>
            <div className="rounded-md border px-2 py-1 text-xs text-muted-foreground">{dateKey}</div>
          </div>

          {!loadingSlots && !slotError && slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No slots available for this date.</p>
          ) : null}

          <div className="max-h-105 space-y-2 overflow-y-auto pr-1">
            {slots.map((slot) => {
              const isSelected = activeSlot?.startTimeUtc === slot.startTimeUtc;
              return (
                <Button
                  key={slot.startTimeUtc}
                  variant={isSelected ? "default" : "outline"}
                  className="w-full justify-between"
                  onClick={() => onSelectSlot(slot)}
                >
                  <span>{formatSlot(slot.startTimeUtc)}</span>
                  <span className="text-xs opacity-70">{props.eventDurationMinutes}m</span>
                </Button>
              );
            })}
          </div>

          <Button className="w-full" disabled={!activeSlot} onClick={onContinueToDetails}>
            Continue
          </Button>
        </section>
      </div>
    </main>
  );
}
