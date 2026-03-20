import { AppFooter } from "@/components/layout/app-footer";
import { LandingPage } from "@/components/pages/landing-page";
import { getAuthenticatedUserId } from "@/lib/auth/session";

export default async function Home() {
  const userId = await getAuthenticatedUserId();

  return (
    <div>
      <LandingPage isLoggedIn={Boolean(userId)} />
      <AppFooter />
    </div>
  );
}
