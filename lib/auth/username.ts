import { prisma } from "@/lib/prisma";

export function normalizeUsernameBase(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);

  return normalized || "user";
}

export async function assignUsernameIfMissing(args: {
  userId?: string;
  email?: string | null;
  name?: string | null;
}) {
  if (!args.userId) {
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: args.userId },
    select: { username: true },
  });

  if (!existingUser || existingUser.username) {
    return;
  }

  const emailLocalPart = args.email?.split("@")[0];
  const baseUsername = normalizeUsernameBase(emailLocalPart || args.name || "user");

  for (let index = 0; index < 100; index += 1) {
    const candidate = index === 0 ? baseUsername : `${baseUsername}-${index}`;
    const usedByAnother = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });

    if (usedByAnother) {
      continue;
    }

    await prisma.user.update({
      where: { id: args.userId },
      data: { username: candidate },
    });

    return;
  }
}

export async function buildAvailableUsername(seed: string) {
  const baseUsername = normalizeUsernameBase(seed);

  for (let index = 0; index < 100; index += 1) {
    const candidate = index === 0 ? baseUsername : `${baseUsername}-${index}`;
    const usedByAnother = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });

    if (!usedByAnother) {
      return candidate;
    }
  }

  return `${baseUsername}-${Date.now()}`;
}
