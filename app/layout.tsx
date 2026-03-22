import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { APP_DESCRIPTION, APP_NAME } from "@/data/branding";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: APP_NAME,
  title: {
    default: `${APP_NAME} | Smart Scheduling`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "scheduling",
    "appointment booking",
    "calendar",
    "meeting links",
    "Slotify",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: APP_NAME,
    title: `${APP_NAME} | Smart Scheduling`,
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/sheduling.png",
        width: 1200,
        height: 630,
        alt: `${APP_NAME} scheduling preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} | Smart Scheduling`,
    description: APP_DESCRIPTION,
    images: ["/sheduling.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "WOBvoHYJ_MAcI-cvXhCIExK6oX9kAlwLhIdJcph4kmo",
  },
  category: "productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <div className="flex-1">{children}</div>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
