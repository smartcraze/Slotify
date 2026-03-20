import { LandingPage } from "@/components/pages/landing-page";
import { getAuthenticatedUserId } from "@/lib/auth/session";

export default async function Home() {
  const userId = await getAuthenticatedUserId();

  return <LandingPage isLoggedIn={Boolean(userId)} />;
}
