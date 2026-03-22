import Image from "next/image";
import { CalendarCheck2, CheckCircle2, Clock3, Mail, Video } from "lucide-react";

export function FeaturesCard() {
  const features = [
    {
      step: "01",
      title: "Connect your calendar",
      description: "Sync your existing calendars so double-bookings are blocked automatically.",
    },
    {
      step: "02",
      title: "Set your availability",
      description: "Choose working days, time windows, and buffers in a simple weekly setup.",
    },
    {
      step: "03",
      title: "Choose how to meet",
      description: "Share video call details and send polished confirmations instantly.",
    },
  ] as const;

  return (
    <section className="grid gap-5 md:grid-cols-3">
      {features.map((item, index) => (
        <article
          key={item.step}
          className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm"
        >
          <div className="space-y-4 p-6">
            <span className="inline-flex rounded-xl bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground">
              {item.step}
            </span>

            <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {item.title}
            </h3>

            <p className="max-w-[28ch] text-base leading-7 text-muted-foreground">
              {item.description}
            </p>
          </div>

          <div className="mt-auto h-56 border-t bg-muted/30 p-4">
            {index === 0 ? (
              <div className="relative h-full overflow-hidden rounded-xl border bg-background p-4">
                <div className="absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border" />
                <div className="absolute top-1/2 left-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border" />

                <div className="absolute top-1/2 left-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-semibold text-foreground">
                  <CalendarCheck2 className="size-4" />
                  Connected
                </div>

                <div className="absolute top-5 right-6 inline-flex size-10 items-center justify-center rounded-full border bg-background shadow-sm">
                  <Image src="/calender.webp" alt="Calendar" width={22} height={22} className="object-contain" />
                </div>

                <div className="absolute bottom-8 left-7 inline-flex size-10 items-center justify-center rounded-full border bg-background shadow-sm">
                  <Image src="/google.webp" alt="Google" width={22} height={22} className="object-contain" />
                </div>

                <div className="absolute bottom-4 right-20 inline-flex size-10 items-center justify-center rounded-full border bg-background shadow-sm">
                  <Image src="/gmail.webp" alt="Gmail" width={22} height={22} className="object-contain" />
                </div>
              </div>
            ) : null}

            {index === 1 ? (
              <div className="relative h-full overflow-hidden rounded-xl border bg-background p-4">
                {["Mon", "Tue", "Wed"].map((day, rowIndex) => (
                  <div key={day} className="mt-4 flex items-center gap-3 first:mt-0">
                    <div
                      className={`relative h-6 w-11 rounded-full ${
                        day === "Tue" ? "bg-muted" : "bg-foreground"
                      }`}
                    >
                      <span
                        className={`absolute top-1 size-4 rounded-full bg-white ${
                          day === "Tue" ? "left-1" : "left-6"
                        }`}
                      />
                    </div>

                    <span className="w-8 text-sm text-muted-foreground">{day}</span>

                    <span className="rounded-md border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
                      {rowIndex === 0 ? "8:30 am" : rowIndex === 1 ? "9:00 am" : "10:00 am"}
                    </span>
                    <span className="text-muted-foreground/60">-</span>
                    <span className="rounded-md border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
                      {rowIndex === 0 ? "5:00 pm" : rowIndex === 1 ? "6:30 pm" : "7:00 pm"}
                    </span>

                    <Clock3 className="size-4 text-muted-foreground/70" />
                  </div>
                ))}
              </div>
            ) : null}

            {index === 2 ? (
              <div className="relative h-full overflow-hidden rounded-xl border bg-background">
                <div className="h-9 border-b bg-muted/40" />

                <div className="grid h-[calc(100%-2.25rem)] grid-cols-2">
                  <div className="flex items-center justify-center border-r">
                    <div className="flex flex-col items-center gap-2">
                      <div className="size-7 rounded-full bg-foreground" />
                      <div className="h-7 w-12 rounded-t-full bg-foreground" />
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="flex size-24 items-center justify-center rounded-full bg-muted">
                      <div className="flex flex-col items-center gap-2">
                        <div className="size-7 rounded-full bg-foreground" />
                        <div className="h-7 w-12 rounded-t-full bg-foreground" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-lg border bg-background px-3 py-2 shadow-sm">
                  <Video className="size-4 text-foreground" />
                  <Mail className="size-4 text-foreground" />
                  <CheckCircle2 className="size-4 text-foreground" />
                </div>
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </section>
  );
}

export default FeaturesCard;