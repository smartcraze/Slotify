import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { isGuestEmail } from "@/lib/auth/guest";

export type AuthenticatedUser = {
  id: string;
  email: string | null;
  name: string | null;
  isGuest: boolean;
};

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
    isGuest: isGuestEmail(session.user.email),
  };
}

export async function getAuthenticatedUserId() {
  const user = await getAuthenticatedUser();
  return user?.id ?? null;
}
