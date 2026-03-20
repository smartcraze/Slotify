"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  const { theme = "light" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      className="toaster group"
      toastOptions={{
        className:
          "!fixed !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 !w-[min(92vw,420px)]",
      }}
      {...props}
    />
  );
}
