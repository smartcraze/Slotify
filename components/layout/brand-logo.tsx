import Link from "next/link";

import { cn } from "@/lib/utils";
import { APP_NAME } from "@/data/branding";

type BrandLogoProps = {
  href?: string;
  withText?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
};

function BrandGlyph({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg bg-linear-to-br from-sky-100 via-emerald-100 to-indigo-100 text-sky-700 shadow-sm dark:from-sky-950/40 dark:via-emerald-950/40 dark:to-indigo-950/40 dark:text-sky-300",
        className
      )}
    >
      <svg viewBox="0 0 24 24" className="slotify-logo-icon size-5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3 10h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle
          className="slotify-logo-orbit"
          cx="16"
          cy="16"
          r="6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="slotify-logo-hand"
          d="M16 14v2.2l1.6 1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function BrandLogo({
  href = "/",
  withText = true,
  className,
  iconClassName,
  textClassName,
}: BrandLogoProps) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)}>
      <BrandGlyph className={iconClassName} />
      {withText ? <span className={cn("text-sm font-semibold tracking-tight", textClassName)}>{APP_NAME}</span> : null}
    </Link>
  );
}
