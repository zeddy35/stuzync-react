import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Allow auth, api, static, and onboarding itself
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/uploads/") ||
    pathname === "/onboarding"
  ) {
    return NextResponse.next();
  }

  // If onboarding just completed in this session, allow navigation
  const onboardCookie = req.cookies.get("onboarding_done")?.value;
  if (onboardCookie === "1") {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token && (token as any).mustCompleteProfile && pathname !== "/onboarding") {
    const url = req.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes; we short-circuit inside for api/auth, api, _next, uploads, etc.
  matcher: ["/:path*"]
};
