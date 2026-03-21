"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "@/lib/auth-client";

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        d="M21.35 11.1H12v2.98h5.39c-.23 1.49-1.78 4.37-5.39 4.37A6 6 0 0 1 12 6.46a5.38 5.38 0 0 1 3.81 1.48l2.6-2.51A8.96 8.96 0 0 0 12 3a9 9 0 1 0 0 18c5.2 0 8.64-3.65 8.64-8.8 0-.59-.07-.94-.16-1.1z"
        fill="#FFC107"
      />
      <path
        d="M3.55 7.7l2.45 1.8A5.98 5.98 0 0 1 12 6.46a5.38 5.38 0 0 1 3.81 1.48l2.6-2.51A8.96 8.96 0 0 0 12 3 8.99 8.99 0 0 0 3.55 7.7z"
        fill="#FF3D00"
      />
      <path
        d="M12 21a9 9 0 0 0 6.16-2.39l-2.84-2.4A5.66 5.66 0 0 1 12 18.45a5.99 5.99 0 0 1-5.67-4.13l-2.54 1.96A9 9 0 0 0 12 21z"
        fill="#4CAF50"
      />
      <path
        d="M21.35 11.1H12v2.98h5.39a4.58 4.58 0 0 1-2.07 2.13l2.84 2.4c1.64-1.51 2.84-3.74 2.84-6.41 0-.59-.07-.94-.16-1.1z"
        fill="#1976D2"
      />
    </svg>
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
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            {isGoogleLinkMode
              ? "Connect your Google account to enable Google Meet link generation."
              : "Continue with Google to start scheduling and calendar sync."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <Button
            type="button"
            className="w-full"
            onClick={onGoogleSignIn}
            disabled={loading}
          >
            <GoogleLogo />
            Continue with Google
          </Button>

          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

          <p className="text-xs text-muted-foreground">
            Slotify uses Google sign-in only. New users can continue and complete profile setup after sign-in.
          </p>

          <p className="text-xs text-muted-foreground">
            Back to <Link href="/" className="underline underline-offset-4">home</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageContent />
    </Suspense>
  );
}
