"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GUEST_MODE_RESTRICTION_MESSAGE } from "@/lib/auth/guest";

type EventTypeCreateFormProps = {
  defaultName?: string;
  isGuest?: boolean;
};

export function EventTypeCreateForm(props: EventTypeCreateFormProps) {
  const router = useRouter();
  const [name, setName] = useState(props.defaultName ?? "30 Min Meeting");
  const [slug, setSlug] = useState("30-min-meeting");
  const [duration, setDuration] = useState(30);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (props.isGuest) {
      toast.warning(GUEST_MODE_RESTRICTION_MESSAGE);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const response = await fetch("/api/event-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        duration,
        isPublic: true,
        status: "ACTIVE",
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.success) {
      setErrorMessage(payload?.error?.message ?? "Failed to create event type");
      toast.error(payload?.error?.message ?? "Failed to create event type");
      setIsSubmitting(false);
      return;
    }

    setName("30 Min Meeting");
    setSlug("30-min-meeting");
    setDuration(30);
    setIsSubmitting(false);
    toast.success("Event type created");
    router.refresh();
  }

  return (
    <form className="grid gap-2 sm:grid-cols-[1fr_1fr_120px_auto]" onSubmit={onSubmit}>
      <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Meeting title" required />
      <Input
        value={slug}
        onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
        placeholder="slug"
        required
      />
      <Input
        type="number"
        min={15}
        step={15}
        max={240}
        value={duration}
        onChange={(event) => setDuration(Number(event.target.value))}
      />
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Add"}</Button>
      {errorMessage ? <p className="sm:col-span-4 text-sm text-destructive">{errorMessage}</p> : null}
    </form>
  );
}
