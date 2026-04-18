"use client";

import { useState } from "react";
import { toast } from "sonner";

import { signIn } from "@/lib/auth-client";
import { GUEST_MODE_RESTRICTION_MESSAGE } from "@/lib/auth/guest";
import { Button } from "@/components/ui/button";

type ConnectGoogleCalendarButtonProps = {
  callbackUrl?: string;
  isGuest?: boolean;
};

export function ConnectGoogleCalendarButton({
  callbackUrl = "/dashboard/integrations",
  isGuest,
}: ConnectGoogleCalendarButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  async function onConnectGoogleCalendar() {
    if (isGuest) {
      toast.warning(GUEST_MODE_RESTRICTION_MESSAGE);
      return;
    }

    setIsConnecting(true);
    toast.info("Redirecting to Google...");

    const { error } = await signIn.social({
      provider: "google",
      callbackURL: callbackUrl,
    });

    if (error) {
      toast.error(error.message ?? "Unable to start Google Calendar connection");
      setIsConnecting(false);
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      className="w-full sm:w-auto"
      onClick={onConnectGoogleCalendar}
      disabled={isConnecting}
    >
      {isConnecting ? "Redirecting..." : "Connect Google Calendar"}
    </Button>
  );
}