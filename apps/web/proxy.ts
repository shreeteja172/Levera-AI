import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { authRateLimit, generalRateLimit } from "@/lib/rateLimit";

const SENSITIVE_AUTH_API_PREFIXES = [
  "/api/auth/sign-in",
  "/api/auth/sign-up",
  "/api/auth/email-otp",
  "/api/auth/forget-password",
  "/api/auth/reset-password",
  "/api/auth/change-password",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";

  if (pathname.includes(".") && !pathname.endsWith(".html")) {
    return NextResponse.next();
  }

  const isSensitiveAuthPage =
    pathname.startsWith("/auth/sign-in") ||
    pathname.startsWith("/auth/sign-up") ||
    pathname.startsWith("/auth/verify-otp");

  const isSensitiveAuthApiCall =
    request.method === "POST" &&
    SENSITIVE_AUTH_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isSensitiveAuthPage || isSensitiveAuthApiCall) {
    const { success } = await authRateLimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many attempts. Try again shortly." },
        { status: 429 },
      );
    }
  } else if (!pathname.startsWith("/api/")) {
    const { success } = await generalRateLimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (pathname === "/home" || pathname.startsWith("/home/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isProtectedPage =
    pathname.startsWith("/dashboard") || pathname.startsWith("/problems");

  const isAuthOrLandingPage =
    pathname.startsWith("/auth/sign-in") ||
    pathname.startsWith("/auth/sign-up") ||
    pathname.startsWith("/auth/verify-otp");

  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (session && isAuthOrLandingPage) {
      if (pathname.startsWith("/auth/extension")) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!session && isProtectedPage) {
      const callbackURL = encodeURIComponent(pathname + request.nextUrl.search);
      return NextResponse.redirect(
        new URL(`/auth/sign-in?callbackURL=${callbackURL}`, request.url),
      );
    }
  } catch (error) {
    console.error("Error in proxy.ts session verification:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    "/api/auth/:path*",
  ],
};
