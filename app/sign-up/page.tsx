"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Mail, UserRound } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ApiErrorPayload = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

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

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = resolveCallbackUrl(searchParams.get("callbackUrl"));

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"google" | "manual" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onGoogleSignUp() {
    setErrorMessage(null);
    setLoading("google");
    await signIn("google", { callbackUrl });
  }

  async function onManualSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage(null);
    setLoading("manual");

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        name: name || undefined,
        username: username || undefined,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;
      setErrorMessage(payload?.error?.message ?? "Unable to create your account");
      setLoading(null);
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    if (!signInResult || signInResult.error) {
      setErrorMessage("Account created, but automatic sign-in failed. Please sign in manually.");
      setLoading(null);
      return;
    }

    router.replace(callbackUrl);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Sign up with email/password or use Google for calendar-connected scheduling.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <Button
            type="button"
            className="w-full"
            onClick={onGoogleSignUp}
            disabled={loading !== null}
          >
            <GoogleLogo />
            Continue with Google
          </Button>

          <form className="space-y-4" onSubmit={onManualSignUp}>
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username (optional)</Label>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value.toLowerCase())}
                placeholder="your-name"
                pattern="^[a-z0-9-]{3,32}$"
                title="Use 3-32 lowercase letters, numbers, or hyphens"
              />
            </div>

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
                  placeholder="At least 8 characters"
                  minLength={8}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

            <Button type="submit" variant="outline" className="w-full" disabled={loading !== null}>
              Create account
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
