import type { Metadata } from "next";

import { AppFooter } from "@/components/layout/app-footer";
import { LandingPage } from "@/components/pages/landing-page";
import { APP_DESCRIPTION, APP_NAME } from "@/data/branding";
import { getAuthenticatedUserId } from "@/lib/auth/session";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Home | Slotify",
  description: APP_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${APP_NAME} | Smart Scheduling`,
    description: APP_DESCRIPTION,
    url: "/",
    images: ["/sheduling.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} | Smart Scheduling`,
    description: APP_DESCRIPTION,
    images: ["/sheduling.png"],
  },
};

export default async function Home() {
  const userId = await getAuthenticatedUserId();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: APP_DESCRIPTION,
    url: siteUrl,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LandingPage isLoggedIn={Boolean(userId)} />
      <AppFooter />
    </div>
  );
}
