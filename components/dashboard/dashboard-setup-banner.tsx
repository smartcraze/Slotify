import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getHostSetupStatus } from "@/lib/dashboard";

type DashboardSetupBannerProps = {
  userId: string;
};

export async function DashboardSetupBanner(props: DashboardSetupBannerProps) {
  const setup = await getHostSetupStatus(props.userId);

  if (setup.hasEventType && setup.hasAvailability && setup.hasGoogleCalendar) {
    return null;
  }

  return (
    <section className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950">
      <p className="text-sm font-semibold">Finish setup to start accepting bookings</p>
      <p className="mt-1 text-xs">
        Connect Google Calendar so events and Meet links are created automatically and double bookings are avoided.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span>{setup.hasEventType ? "Done" : "Pending"} Event type</span>
        <span>{setup.hasAvailability ? "Done" : "Pending"} Availability</span>
        <span>{setup.hasGoogleCalendar ? "Done" : "Pending"} Google Calendar</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {!setup.hasGoogleCalendar ? (
          <Button asChild size="sm">
            <Link href="/dashboard/integrations">Connect Google Calendar</Link>
          </Button>
        ) : null}

        {!setup.hasEventType ? (
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/event-types">Create event type</Link>
          </Button>
        ) : null}

        {!setup.hasAvailability ? (
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/availability">Set availability</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
