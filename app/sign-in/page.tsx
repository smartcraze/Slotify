"use client";

import { FormEvent, Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { BrandLogo } from "@/components/layout/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn, signUp } from "@/lib/auth-client";
import { createTemporaryGuestCredentials } from "@/lib/auth/guest";

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

  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onGoogleSignIn() {
    setErrorMessage(null);
    setGoogleLoading(true);
    toast.info("Redirecting to Google...");

    const { error } = await signIn.social({
      provider: "google",
      callbackURL: callbackUrl,
    });

    if (error) {
      setErrorMessage(error.message ?? "Unable to start Google sign-in");
      toast.error(error.message ?? "Unable to start Google sign-in");
      setGoogleLoading(false);
    }
  }

  async function onEmailAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setEmailLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim();

    if (authMode === "sign-up" && !name) {
      setErrorMessage("Name is required for sign up");
      setEmailLoading(false);
      return;
    }

    const result =
      authMode === "sign-up"
        ? await signUp.email({
            name,
            email,
            password,
            callbackURL: callbackUrl,
          })
        : await signIn.email({
            email,
            password,
            callbackURL: callbackUrl,
            rememberMe: true,
          });

    if (result.error) {
      const fallbackMessage = authMode === "sign-up" ? "Unable to create account" : "Invalid email or password";
      setErrorMessage(result.error.message ?? fallbackMessage);
      toast.error(result.error.message ?? fallbackMessage);
      setEmailLoading(false);
      return;
    }

    toast.success(authMode === "sign-up" ? "Account created" : "Signed in successfully");
    window.location.href = callbackUrl;
  }

  async function onGuestSignIn() {
    setErrorMessage(null);
    setGuestLoading(true);

    const guest = createTemporaryGuestCredentials();
    const { error } = await signUp.email({
      name: guest.name,
      email: guest.email,
      password: guest.password,
      callbackURL: "/dashboard",
    });

    if (error) {
      const message = error.message ?? "Unable to start guest mode";
      setErrorMessage(message);
      toast.error(message);
      setGuestLoading(false);
      return;
    }

    toast.success("Guest mode enabled");
    window.location.href = "/dashboard";
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

      <section className="border-b border-amber-200 bg-amber-50/90">
        <div className="mx-auto w-full max-w-6xl px-4 py-3 text-amber-950 sm:px-6">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="size-4" aria-hidden="true" />
            <p className="text-sm font-semibold">Google Calendar Access Notice</p>
          </div>
          <p className="text-xs leading-relaxed">
            Slotify requests Google Calendar access to schedule your meetings, generate meeting links, and add events to your calendar.
          </p>
          <p className="mt-2 text-xs leading-relaxed">
            This app is currently unverified. For demo purposes, if Google shows a warning screen, continue with:
            <span className="font-medium"> Advanced - Go to Slotify (unsafe)</span>. Verification is in progress.
          </p>
        </div>
      </section>

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center px-4 sm:px-6">

        <Card className="mx-auto w-full max-w-md rounded-2xl shadow-sm">
          <CardHeader className="space-y-3 text-center">
            <CardTitle>{isGoogleLinkMode ? "Connect Google" : "Welcome to Slotify"}</CardTitle>

            <CardDescription>
              {isGoogleLinkMode
                ? "Connect your Google account to enable Google Meet link generation."
                : "Use email and password, Google, or guest mode for preview access."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {!isGoogleLinkMode ? (
              <form className="space-y-3" onSubmit={onEmailAuthSubmit}>
                <Tabs
                  value={authMode}
                  onValueChange={(value) => setAuthMode(value as "sign-in" | "sign-up")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                    <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
                  </TabsList>
                </Tabs>

                {authMode === "sign-up" ? (
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" placeholder="Your name" required={authMode === "sign-up"} />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="you@surajv.dev" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      minLength={8}
                      placeholder="At least 8 characters"
                      className="pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-9 w-9 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="h-11 w-full" disabled={emailLoading}>
                  {emailLoading
                    ? authMode === "sign-up"
                      ? "Creating account..."
                      : "Signing in..."
                    : authMode === "sign-up"
                      ? "Create account"
                      : "Sign in with email"}
                </Button>
              </form>
            ) : null}

            {!isGoogleLinkMode ? <Separator /> : null}

            <div className="flex items-center justify-center">
              <Button
                type="button"
                className="h-11 w-full max-w-sm items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90"
                onClick={onGoogleSignIn}
                disabled={googleLoading}
              >
                <GoogleLogo />
                {googleLoading ? "Redirecting..." : "Continue with Google"}
              </Button>
            </div>

            {!isGoogleLinkMode ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full"
                onClick={onGuestSignIn}
                disabled={guestLoading}
              >
                {guestLoading ? "Starting guest mode..." : "Continue as Guest"}
              </Button>
            ) : null}

            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

            <p className="text-xs text-muted-foreground">
              Guest mode is view-only. Use email and password to test write actions.
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
