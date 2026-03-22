import Link from "next/link";

import { cn } from "@/lib/utils";
import { APP_NAME } from "@/data/branding";

type BrandLogoProps = {
  href?: string;
  withText?: boolean;
  showLegalSuffix?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
};

function BrandGlyph({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-xl border border-border/70 bg-card text-foreground shadow-xs",
        className
      )}
    >
      <svg viewBox="0 0 24 24" className="slotify-logo-icon size-5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 3v3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 3v3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M20 7.5V6.5a2.5 2.5 0 0 0-2.5-2.5h-11A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M4 9h8.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        <circle
          className="slotify-logo-orbit"
          cx="15"
          cy="15"
          r="5.5"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="slotify-logo-hand"
          d="M15 12.8v2.6l1.8 1.1"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="13" r="1.1" className="text-primary" fill="currentColor" />
      </svg>
    </span>
  );
}

export function BrandLogo({
  href = "/",
  withText = true,
  showLegalSuffix = false,
  className,
  iconClassName,
  textClassName,
}: BrandLogoProps) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)}>
      <BrandGlyph className={iconClassName} />
      {withText ? (
        <span className={cn("text-sm font-semibold tracking-tight", textClassName)}>
          {showLegalSuffix ? (
            <>
              {APP_NAME} <span className="font-medium text-muted-foreground">by</span>{" "}
              <span className="text-emerald-600 dark:text-emerald-400">surajv.dev</span>
            </>
          ) : (
            APP_NAME
          )}
        </span>
      ) : null}
    </Link>
  );
}
