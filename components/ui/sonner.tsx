"use client";

import { useEffect, useState } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useTheme } from "@/components/theme-provider";

export function Toaster(props: ToasterProps) {
  const { theme = "light" } = useTheme();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position={isDesktop ? "top-center" : "bottom-center"}
      className="toaster group"
      toastOptions={{
        className:
          "!fixed !left-1/2 !-translate-x-1/2 !bottom-4 !w-[min(92vw,420px)] md:!top-1/2 md:!bottom-auto md:!-translate-y-1/2",
      }}
      {...props}
    />
  );
}
