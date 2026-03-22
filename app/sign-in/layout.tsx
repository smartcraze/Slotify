import type { Metadata } from "next";

import { APP_NAME } from "@/data/branding";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Slotify with Google to manage bookings and integrations.",
  alternates: {
    canonical: "/sign-in",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: `Sign In | ${APP_NAME}`,
    description: "Sign in to Slotify with Google to manage bookings and integrations.",
    url: "/sign-in",
    images: ["/sheduling.png"],
  },
  twitter: {
    card: "summary",
    title: `Sign In | ${APP_NAME}`,
    description: "Sign in to Slotify with Google to manage bookings and integrations.",
  },
};

export default function SignInLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
