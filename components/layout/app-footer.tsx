import Link from "next/link";

import { BrandLogo } from "@/components/layout/brand-logo";
import { APP_LEGAL_NAME } from "@/data/branding";

export function AppFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 text-base text-muted-foreground sm:px-6">
        <div className="flex w-full flex-col items-center justify-between gap-3 sm:flex-row">
          <BrandLogo href="/" textClassName="text-muted-foreground" />
          <nav className="flex items-center justify-end gap-6 text-base">
            <Link href="/privacy-policy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-foreground">
              Terms of Service
            </Link>
          </nav>
        </div>

        <p className="text-sm leading-6 text-muted-foreground/90 text-center">
          &copy; 2026 All rights reserved. {APP_LEGAL_NAME}. Developer: Suraj.
        </p>
      </div>
    </footer>
  );
}
