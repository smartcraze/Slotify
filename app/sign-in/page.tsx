"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    return "/onboarding";
  }

  if (!rawCallbackUrl.startsWith("/")) {
    return "/onboarding";
  }

  return rawCallbackUrl;
}

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = resolveCallbackUrl(searchParams.get("callbackUrl"));
  const isGoogleLinkMode = searchParams.get("mode") === "link-google";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"google" | "credentials" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onGoogleSignIn() {
    setErrorMessage(null);
    setLoading("google");
    toast.info("Redirecting to Google...");

    const { error } = await signIn.social({
      provider: "google",
      callbackURL: callbackUrl,
    });

    if (error) {
      setErrorMessage(error.message ?? "Unable to start Google sign-in");
      toast.error(error.message ?? "Unable to start Google sign-in");
      setLoading(null);
    }
  }

  async function onCredentialsSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage(null);
    setLoading("credentials");

    const { error } = await signIn.email({
      email,
      password,
      callbackURL: callbackUrl,
    });

    if (error) {
      setErrorMessage(error.message ?? "Invalid email or password");
      toast.error(error.message ?? "Sign-in failed. Check your credentials.");
      setLoading(null);
      return;
    }

    toast.success("Sign-in successful. Redirecting...");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            {isGoogleLinkMode
              ? "Connect your Google account to enable Google Meet link generation."
              : "Continue with Google or use email and password."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <Button
            type="button"
            className="w-full"
            onClick={onGoogleSignIn}
            disabled={loading !== null}
          >
            <GoogleLogo />
            Continue with Google
          </Button>

          <form className="space-y-4" onSubmit={onCredentialsSignIn}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

            <Button type="submit" variant="outline" className="w-full" disabled={loading !== null}>
              Sign in with email
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            New users can start with Google and complete profile setup after sign-in.
          </p>

          <p className="text-xs text-muted-foreground">
            Need an account?{" "}
            <Link href="/sign-up" className="underline underline-offset-4">
              Create one
            </Link>
          </p>

          <p className="text-xs text-muted-foreground">
            Back to <Link href="/" className="underline underline-offset-4">home</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
