"use client";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";

type PublicBookingLinkCardProps = {
  username: string;
};

export function PublicBookingLinkCard(props: PublicBookingLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const bookingPath = useMemo(() => `/${props.username}`, [props.username]);
  const bookingUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return bookingPath;
    }

    return `${window.location.origin}${bookingPath}`;
  }, [bookingPath]);

  async function onCopy() {
    const textToCopy =
      typeof window === "undefined" ? bookingPath : `${window.location.origin}${bookingPath}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="rounded-xl border border-emerald-300/60 bg-emerald-50 p-4 text-emerald-950">
      <p className="text-sm font-medium">Send this link to get booking or meeting with you</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <p className="w-full rounded-md border border-emerald-300/60 bg-background px-3 py-2 text-sm break-all">
          {bookingUrl}
        </p>
        <Button type="button" size="sm" className="shrink-0" onClick={onCopy}>
          {copied ? <Check className="mr-1 size-4" /> : <Copy className="mr-1 size-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </section>
  );
}
