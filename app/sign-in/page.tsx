"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { BrandLogo } from "@/components/layout/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "@/lib/auth-client";

function GoogleLogo() {
  return (
    <span className="inline-flex size-4 items-center justify-center">
      <Image src="/google.png" alt="Google" width={16} height={16} className="h-4 w-4 object-contain" />
    </span>
  );
}

function resolveCallbackUrl(rawCallbackUrl: string | null) {
  if (!rawCallbackUrl) {
    return "/dashboard";
  }

  if (!rawCallbackUrl.startsWith("/")) {
    return "/dashboard";
  }

  return rawCallbackUrl;
}

function SignInPageContent() {
  const searchParams = useSearchParams();
  const callbackUrl = resolveCallbackUrl(searchParams.get("callbackUrl"));
  const isGoogleLinkMode = searchParams.get("mode") === "link-google";

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onGoogleSignIn() {
    setErrorMessage(null);
    setLoading(true);
    toast.info("Redirecting to Google...");

    const { error } = await signIn.social({
      provider: "google",
      callbackURL: callbackUrl,
    });

    if (error) {
      setErrorMessage(error.message ?? "Unable to start Google sign-in");
      toast.error(error.message ?? "Unable to start Google sign-in");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <header className="border-b bg-background/90 backdrop-blur">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandLogo href="/" showLegalSuffix />

          <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/" className="transition hover:text-foreground">Home</Link>
            <Link href="/pricing" className="transition hover:text-foreground">Pricing</Link>

          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/">Back</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center px-4 sm:px-6">

        <Card className="mx-auto w-full max-w-md rounded-2xl shadow-sm">
          <CardHeader className="space-y-3 text-center">

            <CardDescription>
              {isGoogleLinkMode
                ? "Connect your Google account to enable Google Meet link generation."
                : "Continue with Google to start scheduling and calendar sync."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex items-center justify-center">
              <Button
                type="button"
                className="h-11 w-full max-w-sm items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90"
                onClick={onGoogleSignIn}
                disabled={loading}
              >
                <GoogleLogo />
                Continue with Google
              </Button>
            </div>

            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

            <p className="text-xs text-muted-foreground">
              Slotify uses Google sign-in only. New users can continue and complete profile setup after sign-in.
            </p>


          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageContent />
    </Suspense>
  );
}
