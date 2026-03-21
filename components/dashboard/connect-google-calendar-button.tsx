"use client";

import { useState } from "react";
import { toast } from "sonner";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type ConnectGoogleCalendarButtonProps = {
  callbackUrl?: string;
};

export function ConnectGoogleCalendarButton({
  callbackUrl = "/dashboard/integrations",
}: ConnectGoogleCalendarButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  async function onConnectGoogleCalendar() {
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