"use client";

import { CalendarDays, Clock3, Globe, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePublicSchedulerBooking } from "@/components/pages/booking/use-public-scheduler-booking";

type PublicSchedulerProps = {
  hostId: string;
  hostName: string;
  hostImage?: string | null;
  hostBio: string | null;
  hostTimezone: string;
  eventTypeId: string;
  eventTypeSlug?: string;
  eventTypeName: string;
  eventDurationMinutes: number;
};

const DISPLAY_LOCALE = "en-US";

export function PublicScheduler(props: PublicSchedulerProps) {
  const {
    selectedDate,
    step,
    slots,
    loadingSlots,
    slotError,
    activeSlot,
    guestName,
    setGuestName,
    guestEmail,
    setGuestEmail,
    guestNotes,
    setGuestNotes,
    bookingState,
    bookingError,
    attendeeTimezone,
    dateKey,
    today,
    onDateChange,
    onSelectSlot,
    onContinueToDetails,
    onBookSlot,
    setStep,
  } = usePublicSchedulerBooking({
    hostId: props.hostId,
    eventTypeId: props.eventTypeId,
    eventTypeSlug: props.eventTypeSlug,
  });

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

  const hostInitial = props.hostName.trim().charAt(0).toUpperCase() || "H";

  if (step === "details" && activeSlot) {
    return (
      <main className="min-h-svh px-4 py-8 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center py-6">
          <div className="grid w-full max-w-3xl gap-0 overflow-hidden rounded-2xl border bg-card md:grid-cols-[320px_1fr]">
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
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-svh px-4 py-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center py-6">
        <div className="grid w-full gap-0 overflow-hidden rounded-2xl border bg-card lg:grid-cols-[280px_1fr_280px]">
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
      </div>
    </main>
  );
}
