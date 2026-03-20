import Link from "next/link";

import { APP_NAME } from "@/data/branding";

export function AppFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 text-sm text-muted-foreground sm:px-6">
        <p>{APP_NAME}</p>
        <nav className="flex items-center gap-4">
          <Link href="/privacy-policy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:text-foreground">
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
