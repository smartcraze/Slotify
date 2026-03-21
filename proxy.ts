import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

function buildSignInRedirect(request: NextRequest) {
  const callback = encodeURIComponent(`${request.nextUrl.pathname}${request.nextUrl.search}`);
  return new URL(`/sign-in?callbackUrl=${callback}`, request.url);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAuthenticated = Boolean(getSessionCookie(request));

  if (pathname === "/sign-up") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");

  if (isProtectedPage && !isAuthenticated) {
    return NextResponse.redirect(buildSignInRedirect(request));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
