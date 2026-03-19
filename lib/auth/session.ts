import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth/options";

export async function getAuthenticatedUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}
