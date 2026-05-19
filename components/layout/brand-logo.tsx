import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
type BrandLogoProps = {
  href?: string;
  withText?: boolean;
  showLegalSuffix?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
};


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
      <Image
        src="/slotify.png"
        alt="Logo"
        width={150}
        height={150}
        className={cn("transition duration-300 dark:invert", iconClassName)}
      />
    </Link>
  );
}
