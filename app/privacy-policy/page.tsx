import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Slotify and Google Calendar integration.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Effective date: March 21, 2026
      </p>

      <p className="mt-6 text-sm text-muted-foreground">
        This Privacy Policy explains how Slotify collects, uses, and protects
        your information, including when you connect Google Calendar.
      </p>

      <ol className="mt-6 list-decimal space-y-4 pl-5 text-sm leading-6 text-foreground">
        <li>
          <span className="font-medium">Information we collect</span>
          <p className="text-muted-foreground">
            We collect account details (name, email), booking details, and
            calendar integration tokens when you connect a provider.
          </p>
        </li>
        <li>
          <span className="font-medium">How we use information</span>
          <p className="text-muted-foreground">
            We use your information to authenticate users, create bookings,
            check availability, and create calendar events you request.
          </p>
        </li>
        <li>
          <span className="font-medium">Google Calendar data use</span>
          <p className="text-muted-foreground">
            Google Calendar access is used only to create and manage scheduling
            events for your account. We do not sell Google user data.
          </p>
        </li>
        <li>
          <span className="font-medium">Data sharing</span>
          <p className="text-muted-foreground">
            We do not sell personal information. We may share data only with
            trusted service providers needed to run the app (for example,
            email, payments, or infrastructure).
          </p>
        </li>
        <li>
          <span className="font-medium">Data retention</span>
          <p className="text-muted-foreground">
            We keep data while your account is active or as needed for legal,
            security, and operational reasons.
          </p>
        </li>
        <li>
          <span className="font-medium">Security</span>
          <p className="text-muted-foreground">
            We use reasonable technical and organizational safeguards to protect
            your information.
          </p>
        </li>
        <li>
          <span className="font-medium">Your rights</span>
          <p className="text-muted-foreground">
            You can request access, correction, or deletion of your account data
            by contacting us.
          </p>
        </li>
        <li>
          <span className="font-medium">Contact</span>
          <p className="text-muted-foreground">
            For privacy requests, contact: support@slotify.app
          </p>
        </li>
      </ol>
    </main>
  );
}
