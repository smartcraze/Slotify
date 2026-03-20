"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Chrome, KeyRound, Mail } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/onboarding";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"google" | "credentials" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onGoogleSignIn() {
    setErrorMessage(null);
    setLoading("google");
    await signIn("google", { callbackUrl });
  }

  async function onCredentialsSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage(null);
    setLoading("credentials");

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    if (!result || result.error) {
      setErrorMessage("Invalid email or password");
      setLoading(null);
      return;
    }

    window.location.href = result.url ?? callbackUrl;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Continue with Google or use email and password.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <Button
            type="button"
            className="w-full"
            onClick={onGoogleSignIn}
            disabled={loading !== null}
          >
            <Chrome className="size-4" />
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
            Back to <Link href="/" className="underline underline-offset-4">home</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
