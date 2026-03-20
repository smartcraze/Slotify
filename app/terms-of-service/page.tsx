import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Slotify.",
};

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Effective date: March 21, 2026
      </p>

      <p className="mt-6 text-sm text-muted-foreground">
        These Terms govern your use of Slotify and related scheduling features,
        including Google Calendar integration.
      </p>

      <ol className="mt-6 list-decimal space-y-4 pl-5 text-sm leading-6 text-foreground">
        <li>
          <span className="font-medium">Acceptance of terms</span>
          <p className="text-muted-foreground">
            By using Slotify, you agree to these Terms.
          </p>
        </li>
        <li>
          <span className="font-medium">Account responsibilities</span>
          <p className="text-muted-foreground">
            You are responsible for account security and for activity under your
            account.
          </p>
        </li>
        <li>
          <span className="font-medium">Permitted use</span>
          <p className="text-muted-foreground">
            You must use the service lawfully and must not misuse integrations,
            APIs, or booking flows.
          </p>
        </li>
        <li>
          <span className="font-medium">Google integration</span>
          <p className="text-muted-foreground">
            If you connect Google Calendar, you authorize Slotify to access
            required calendar scopes to create and manage events.
          </p>
        </li>
        <li>
          <span className="font-medium">Payments and subscriptions</span>
          <p className="text-muted-foreground">
            Paid features, if enabled, are billed according to your selected
            plan and applicable provider terms.
          </p>
        </li>
        <li>
          <span className="font-medium">Service availability</span>
          <p className="text-muted-foreground">
            We may update, suspend, or discontinue parts of the service at any
            time.
          </p>
        </li>
        <li>
          <span className="font-medium">Limitation of liability</span>
          <p className="text-muted-foreground">
            Slotify is provided "as is" without warranties to the fullest extent
            allowed by law.
          </p>
        </li>
        <li>
          <span className="font-medium">Contact</span>
          <p className="text-muted-foreground">
            For legal questions, contact: support@slotify.app
          </p>
        </li>
      </ol>
    </main>
  );
}
