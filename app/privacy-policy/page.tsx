import type { Metadata } from "next";

import { APP_DOMAIN, APP_LEGAL_NAME } from "@/data/branding";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Slotify - by surajv.dev and Google Calendar integration.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Effective date: March 21, 2026
      </p>

      <p className="mt-6 text-sm text-muted-foreground">
        This Privacy Policy explains how {APP_LEGAL_NAME} collects, uses, and protects your information when you use
        our scheduling service at {APP_DOMAIN}, including Google OAuth and Google Calendar integration.
      </p>

      <ol className="mt-6 list-decimal space-y-4 pl-5 text-sm leading-6 text-foreground">
        <li>
          <span className="font-medium">Information we collect</span>
          <p className="text-muted-foreground">
            We collect account information (name, email), booking details (meeting time, attendees, notes), and
            integration credentials (for example OAuth tokens) when you connect Google Calendar.
          </p>
        </li>
        <li>
          <span className="font-medium">Why we request Google Calendar access</span>
          <p className="text-muted-foreground">
            Google Calendar access is used only to check availability and create, update, or cancel meetings
            requested by the user. We do not sell Google user data, and users can revoke calendar access from their
            Google account at any time.
          </p>
        </li>
        <li>
          <span className="font-medium">How we use data</span>
          <p className="text-muted-foreground">
            We use your data to authenticate your account, provide booking flows, send booking notifications, and keep
            your connected calendar in sync with the meetings you create in Slotify.
          </p>
        </li>
        <li>
          <span className="font-medium">Data sharing and Google user data</span>
          <p className="text-muted-foreground">
            We do not sell personal information. We may share data only with
            trusted service providers required to operate the service (such as
            hosting, email, and payments). Google user data is not used for advertising and is not sold.
          </p>
        </li>
        <li>
          <span className="font-medium">Data storage and retention</span>
          <p className="text-muted-foreground">
            Data is stored on secure infrastructure and retained while your account is active, or as required for
            legal, security, and operational obligations. Calendar access tokens are stored securely and can be revoked
            by disconnecting integration settings or from your Google account permissions page.
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
          <span className="font-medium">Your rights and controls</span>
          <p className="text-muted-foreground">
            You can request access, correction, export, or deletion of your account data. You can also revoke Google
            Calendar access at any time from your Google account settings.
          </p>
        </li>
        <li>
          <span className="font-medium">Contact</span>
          <p className="text-muted-foreground">
            For privacy requests, contact: hello@surajv.dev (Developer: Suraj)
          </p>
        </li>
      </ol>
    </main>
  );
}
