"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type IntegrationStatus = {
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

type BookingConfirmationViewProps = {
  bookingId: string;
  status: string;
  eventTypeName: string;
  startTimeUtc: string;
  endTimeUtc: string;
  guestName: string | null;
  guestEmail: string;
  hostEmail?: string | null;
  guestNotes: string | null;
  meetingLink: string | null;
  createdAt: string;
  hostName: string;
  hostTimezone: string;
  bookAnotherHref: string;
  integrationStatus?: IntegrationStatus;
};

const DISPLAY_LOCALE = "en-US";

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function BookingConfirmationView(props: BookingConfirmationViewProps) {
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);

  const attendeeTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    []
  );

  async function onCancelBooking() {
    setIsCancelling(true);
    setCancelError(null);

    const response = await fetch(`/api/bookings/public/${props.bookingId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestEmail: props.guestEmail,
        cancelReason,
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.success) {
      setCancelError(payload?.error?.message ?? "Failed to cancel booking");
      setIsCancelling(false);
      return;
    }

    setIsCancelling(false);
    setShowCancelForm(false);
    setIsCancelled(true);
  }

  return (
    <main className="min-h-svh px-4 py-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-center py-10">
        <section className="w-full rounded-2xl border border-border bg-card p-7 text-foreground shadow-xl sm:p-8">
          <div className="flex justify-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Check className="size-5" />
            </div>
          </div>

          <h1 className="mt-5 text-center text-4xl font-semibold tracking-tight">This meeting is scheduled</h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-base text-muted-foreground">
            We sent an email with a calendar invitation with the details to everyone.
          </p>

          <div className="my-7 border-t border-border" />

          <dl className="space-y-6 text-[1.05rem]">
            <div className="grid grid-cols-[96px_1fr] gap-3">
              <dt className="text-muted-foreground">What</dt>
              <dd>{props.eventTypeName} between {props.hostName}{props.guestName ? ` and ${props.guestName}` : ""}</dd>
            </div>

            <div className="grid grid-cols-[96px_1fr] gap-3">
              <dt className="text-muted-foreground">When</dt>
              <dd>
                {formatDate(props.startTimeUtc)}
                <br />
                {formatTime(props.startTimeUtc)} - {formatTime(props.endTimeUtc)} ({attendeeTimezone})
              </dd>
            </div>

            <div className="grid grid-cols-[96px_1fr] gap-3">
              <dt className="text-muted-foreground">Who</dt>
              <dd className="space-y-2">
                <p>
                  {props.hostName}
                  {props.hostEmail ? (
                    <>
                      <br />
                      {props.hostEmail}
                    </>
                  ) : null}
                </p>
                <p>
                  {props.guestName || "Guest"}
                  <br />
                  {props.guestEmail}
                </p>
              </dd>
            </div>

            <div className="grid grid-cols-[96px_1fr] gap-3">
              <dt className="text-muted-foreground">Where</dt>
              <dd>
                {props.meetingLink ? (
                  <a href={props.meetingLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-4">
                    Google Meet <ExternalLink className="size-4" />
                  </a>
                ) : (
                  "Google Meet"
                )}
              </dd>
            </div>
          </dl>

          <div className="my-7 border-t border-border" />

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href={props.bookAnotherHref}>Book another slot</Link>
            </Button>
            <button
              type="button"
              className="text-base text-muted-foreground underline underline-offset-4"
              onClick={() => {
                setShowCancelForm((v) => !v);
                setCancelError(null);
              }}
            >
              Cancel
            </button>
          </div>

          {showCancelForm ? (
            <div className="mt-5 space-y-3 rounded-lg border border-border bg-background p-4">
              <label htmlFor="cancelReason" className="text-sm font-medium">Cancellation reason</label>
              <Textarea
                id="cancelReason"
                rows={3}
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Please tell us why you want to cancel"
              />
              {cancelError ? <p className="text-sm text-destructive">{cancelError}</p> : null}
              {isCancelled ? <p className="text-sm text-primary">Booking cancelled successfully.</p> : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCancelForm(false)}>Keep booking</Button>
                <Button type="button" variant="destructive" disabled={isCancelling || cancelReason.trim().length === 0 || isCancelled} onClick={onCancelBooking}>
                  {isCancelling ? "Cancelling..." : "Confirm cancel"}
                </Button>
              </div>
            </div>
          ) : null}

          <p className="mt-6 text-xs text-muted-foreground">
            Booking #{props.bookingId} • {props.status} • Created {formatFullDateTime(props.createdAt)} • {props.guestNotes || "No notes"}
          </p>
        </section>
      </div>
    </main>
  );
}
