"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { GUEST_MODE_RESTRICTION_MESSAGE } from "@/lib/auth/guest";

type BookingActionsProps = {
  bookingId: string;
  status: string;
  isGuest?: boolean;
};

export function BookingActions(props: BookingActionsProps) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (props.status === "CANCELLED") {
    return <span className="text-xs text-muted-foreground">Cancelled</span>;
  }

  async function cancelBooking() {
    if (props.isGuest) {
      toast.warning(GUEST_MODE_RESTRICTION_MESSAGE);
      return;
    }

    setErrorMessage(null);
    setIsCancelling(true);

    const response = await fetch(`/api/bookings/${props.bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel", cancelledBy: "host" }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.success) {
      setErrorMessage(payload?.error?.message ?? "Failed to cancel booking");
      toast.error(payload?.error?.message ?? "Failed to cancel booking");
      setIsCancelling(false);
      return;
    }

    setIsCancelling(false);
    toast.success("Booking cancelled");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button size="sm" variant="outline" onClick={cancelBooking} disabled={isCancelling}>
        {isCancelling ? "Cancelling..." : "Cancel"}
      </Button>
      {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}
    </div>
  );
}
