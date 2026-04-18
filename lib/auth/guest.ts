export const GUEST_EMAIL_DOMAIN = "guest.slotify.local";

export const GUEST_MODE_RESTRICTION_MESSAGE =
  "Guest mode is view-only. Sign in with email and password to perform this action.";

export function isGuestEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return email.toLowerCase().endsWith(`@${GUEST_EMAIL_DOMAIN}`);
}

export function createTemporaryGuestCredentials() {
  const token =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replaceAll("-", "")
      : `${Date.now()}${Math.random().toString(16).slice(2)}`;

  const shortToken = token.slice(0, 12);

  return {
    name: "Guest Reviewer",
    email: `guest-${Date.now()}-${shortToken}@${GUEST_EMAIL_DOMAIN}`,
    password: `Guest#${token.slice(0, 16)}A1`,
  };
}
