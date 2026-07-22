import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.includes(".") && !pathname.endsWith(".html")) {
    return NextResponse.next();
  }

  const isProtectedPage = pathname.startsWith("/home") || pathname.startsWith("/problems");

  const isAuthOrLandingPage =
    pathname === "/" ||
    pathname.startsWith("/auth/sign-in") ||
    pathname.startsWith("/auth/sign-up") ||
    pathname.startsWith("/auth/verify-otp");

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (session && isAuthOrLandingPage) {
      if (pathname.startsWith("/auth/extension")) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/home", request.url));
    }

    if (!session && isProtectedPage) {
      const callbackURL = encodeURIComponent(pathname + request.nextUrl.search);
      return NextResponse.redirect(new URL(`/auth/sign-in?callbackURL=${callbackURL}`, request.url));
    }
  } catch (error) {
    console.error("Error in proxy.ts session verification:", error);
  }

  return NextResponse.next();
}

export const runtime = "nodejs";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
