"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type OnboardingFormProps = {
  defaultName: string;
  defaultUsername: string;
  defaultTimezone: string;
};

type OnboardingResponse = {
  success: boolean;
  data?: {
    publicProfilePath: string;
  };
  error?: {
    message?: string;
  };
};

const WEEK_DAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function OnboardingForm(props: OnboardingFormProps) {
  const router = useRouter();

  const [name, setName] = useState(props.defaultName);
  const [username, setUsername] = useState(props.defaultUsername);
  const [timezone, setTimezone] = useState(props.defaultTimezone);
  const [bio, setBio] = useState("");
  const [eventTypeName, setEventTypeName] = useState("15 Min Meeting");
  const [eventTypeSlug, setEventTypeSlug] = useState("15-min-meeting");
  const [eventTypeDescription, setEventTypeDescription] = useState("Short call for planning and updates");
  const [eventDurationMinutes, setEventDurationMinutes] = useState(15);
  const [availabilityDays, setAvailabilityDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [availabilityStartTime, setAvailabilityStartTime] = useState("09:00");
  const [availabilityEndTime, setAvailabilityEndTime] = useState("17:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timezones = useMemo(() => {
    if (typeof Intl.supportedValuesOf !== "function") {
      return [props.defaultTimezone, "UTC"];
    }

    return Intl.supportedValuesOf("timeZone");
  }, [props.defaultTimezone]);

  function onEventTypeNameBlur() {
    if (eventTypeSlug.trim().length > 0) {
      return;
    }

    setEventTypeSlug(slugify(eventTypeName));
  }

  function toggleDay(dayValue: number) {
    setAvailabilityDays((current) => {
      if (current.includes(dayValue)) {
        const next = current.filter((day) => day !== dayValue);
        return next.length === 0 ? current : next;
      }

      return [...current, dayValue].sort((a, b) => a - b);
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const response = await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || undefined,
        username,
        timezone,
        bio: bio || undefined,
        eventTypeName,
        eventTypeSlug: slugify(eventTypeSlug || eventTypeName),
        eventTypeDescription: eventTypeDescription || undefined,
        eventDurationMinutes,
        availabilityDays,
        availabilityStartTime,
        availabilityEndTime,
      }),
    });

    const payload = (await response.json().catch(() => null)) as OnboardingResponse | null;

    if (!response.ok || !payload?.success || !payload.data) {
      setErrorMessage(payload?.error?.message ?? "Failed to finish onboarding");
      toast.error(payload?.error?.message ?? "Failed to finish onboarding");
      setIsSubmitting(false);
      return;
    }

    toast.success("Setup completed. Redirecting to your public page...");
    router.push(payload.data.publicProfilePath);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Set up your scheduling profile</CardTitle>
          <CardDescription>
            Configure your public booking page, meeting type, and weekly availability.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-8" onSubmit={onSubmit}>
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Display name</Label>
                <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Public username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value.toLowerCase())}
                  placeholder="your-name"
                  pattern="^[a-z0-9-]{3,32}$"
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="timezone">Host timezone</Label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(event) => setTimezone(event.target.value)}
                  className="flex h-9 w-full rounded-md border bg-white px-3 py-1 text-sm text-black shadow-xs"
                >
                  {timezones.map((value) => (
                    <option key={value} value={value} className="text-black">
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Tell attendees what this meeting is for"
                  rows={3}
                />
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eventTypeName">Meeting title</Label>
                <Input
                  id="eventTypeName"
                  value={eventTypeName}
                  onChange={(event) => setEventTypeName(event.target.value)}
                  onBlur={onEventTypeNameBlur}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventTypeSlug">Meeting URL slug</Label>
                <Input
                  id="eventTypeSlug"
                  value={eventTypeSlug}
                  onChange={(event) => setEventTypeSlug(slugify(event.target.value))}
                  pattern="^[a-z0-9-]{3,80}$"
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="eventTypeDescription">Meeting description</Label>
                <Textarea
                  id="eventTypeDescription"
                  value={eventTypeDescription}
                  onChange={(event) => setEventTypeDescription(event.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventDurationMinutes">Duration (minutes)</Label>
                <Input
                  id="eventDurationMinutes"
                  type="number"
                  min={15}
                  max={240}
                  step={15}
                  value={eventDurationMinutes}
                  onChange={(event) => setEventDurationMinutes(Number(event.target.value))}
                  required
                />
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium">Weekly availability</p>
                <p className="text-xs text-muted-foreground">Pick days and a time window for your default event type.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {WEEK_DAYS.map((day) => {
                  const isActive = availabilityDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`rounded-md border px-3 py-1 text-sm ${
                        isActive ? "bg-foreground text-background" : "bg-background"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="availabilityStartTime">Start time</Label>
                  <Input
                    id="availabilityStartTime"
                    type="time"
                    value={availabilityStartTime}
                    onChange={(event) => setAvailabilityStartTime(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availabilityEndTime">End time</Label>
                  <Input
                    id="availabilityEndTime"
                    type="time"
                    value={availabilityEndTime}
                    onChange={(event) => setAvailabilityEndTime(event.target.value)}
                    required
                  />
                </div>
              </div>
            </section>

            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Finish setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
