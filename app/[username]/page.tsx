import { notFound } from "next/navigation";

import { PublicScheduler } from "@/components/pages/public-scheduler";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function PublicProfilePage({ params }: PageProps) {
  const resolved = await params;
  const rawUsername = resolved.username;
  const normalizedUsername = rawUsername.startsWith("@")
    ? rawUsername.slice(1)
    : rawUsername;

  const user = await prisma.user.findUnique({
    where: {
      username: normalizedUsername,
    },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      timezone: true,
    },
  });

  if (!user) {
    notFound();
  }

  const eventType = await prisma.eventType.findFirst({
    where: {
      hostId: user.id,
      status: "ACTIVE",
      isPublic: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      name: true,
      duration: true,
    },
  });

  if (!eventType) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">No public event types yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This host has not published a public booking type yet.
        </p>
      </main>
    );
  }

  return (
    <PublicScheduler
      hostId={user.id}
      hostName={user.name || user.username || "Host"}
      hostBio={user.bio}
      hostTimezone={user.timezone || "UTC"}
      eventTypeId={eventType.id}
      eventTypeName={eventType.name}
      eventDurationMinutes={eventType.duration}
    />
  );
}
