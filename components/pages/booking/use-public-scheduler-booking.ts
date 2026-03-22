"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export type AvailabilitySlot = {
  startTimeUtc: string;
  endTimeUtc: string;
};

type UsePublicSchedulerBookingParams = {
  hostId: string;
  eventTypeId: string;
  eventTypeSlug?: string;
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function usePublicSchedulerBooking(params: UsePublicSchedulerBookingParams) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [step, setStep] = useState<"slots" | "details">("slots");
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<AvailabilitySlot | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestNotes, setGuestNotes] = useState("");
  const [bookingState, setBookingState] = useState<"idle" | "submitting">("idle");
  const [bookingError, setBookingError] = useState<string | null>(null);

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

  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams.toString());
    let changed = false;

    if (urlParams.get("overlayCalendar") !== "true") {
      urlParams.set("overlayCalendar", "true");
      changed = true;
    }

    if (params.eventTypeSlug && urlParams.get("eventTypeSlug") !== params.eventTypeSlug) {
      urlParams.set("eventTypeSlug", params.eventTypeSlug);
      changed = true;
    }

    if (changed) {
      router.replace(`${pathname}?${urlParams.toString()}`, { scroll: false });
    }
  }, [params.eventTypeSlug, pathname, router, searchParams]);

  const loadSlots = useCallback(async (nextDate: Date) => {
    const nextDateKey = toDateKey(nextDate);

    setLoadingSlots(true);
    setSlotError(null);
    setActiveSlot(null);
    setBookingState("idle");
    setBookingError(null);

    const query = new URLSearchParams({
      hostId: params.hostId,
      eventTypeId: params.eventTypeId,
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
  }, [params.eventTypeId, params.hostId]);

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

  function onSelectSlot(slot: AvailabilitySlot) {
    setActiveSlot(slot);
  }

  function onContinueToDetails() {
    if (!activeSlot) {
      return;
    }

    setStep("details");
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
        hostId: params.hostId,
        eventTypeId: params.eventTypeId,
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
      guestEmail: string;
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
      const calendarMessage = booking.integrationStatus.calendar.message;
      const isHostReconnectNotice = /reconnect|delayed|host google calendar/i.test(
        calendarMessage
      );

      if (!isHostReconnectNotice) {
        toast.warning(calendarMessage);
      }
    }

    if (booking.integrationStatus?.email && !booking.integrationStatus.email.sent) {
      toast.warning(booking.integrationStatus.email.message);
    }

    const query = new URLSearchParams({
      "flag.coep": "false",
      isSuccessBookingPage: "true",
      email: booking.guestEmail,
    });

    if (params.eventTypeSlug) {
      query.set("eventTypeSlug", params.eventTypeSlug);
    }

    if (booking.integrationStatus?.calendar) {
      query.set("calendarAttempted", String(booking.integrationStatus.calendar.attempted));
      query.set("calendarSuccess", String(booking.integrationStatus.calendar.success));
      query.set("calendarMessage", booking.integrationStatus.calendar.message);
    }

    if (booking.integrationStatus?.email) {
      query.set("emailSent", String(booking.integrationStatus.email.sent));
      query.set("emailMessage", booking.integrationStatus.email.message);
    }

    router.push(`/booking/${booking.id}?${query.toString()}`);
  }

  return {
    selectedDate,
    setSelectedDate,
    step,
    setStep,
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
  };
}
