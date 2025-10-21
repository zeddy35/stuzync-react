// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const APP_GUARDED = ["/feed", "/groups", "/profile", "/settings", "/me", "/onboarding", "/register"];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAuthed = !!token?.sub;
  const mustComplete = Boolean((token as any)?.mustCompleteProfile);
  const oauthNew = Boolean((token as any)?.oauthNew);
  const oauthName  = ((token as any)?.oauthName as string) || "";
  const oauthEmail = ((token as any)?.oauthEmail as string) || "";

  // landing ("/")
  if (pathname === "/") {
    if (isAuthed && mustComplete) {
      // OAuth ilk girişte önce register prefill
      if (oauthNew) {
        const u = new URL("/register", req.url);
        u.searchParams.set("oauth", "1");
        if (oauthName)  u.searchParams.set("name",  oauthName);
        if (oauthEmail) u.searchParams.set("email", oauthEmail);
        return NextResponse.redirect(u);
      }
    }
    if (isAuthed && !mustComplete) {
      url.pathname = "/feed";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next(); // anonim -> landing
  }

  // Guarded alanlar
  if (APP_GUARDED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (!isAuthed) {
      const next = encodeURIComponent(pathname + (url.search || ""));
      url.pathname = "/";
      url.search = `?next=${next}`;
      return NextResponse.redirect(url);
    }

    // Profil eksikse:
    if (mustComplete) {
      // OAuth “ilk giriş” ise -> register prefill'e izin
      if (oauthNew && pathname !== "/register") {
        const u = new URL("/register", req.url);
        u.searchParams.set("oauth", "1");
        if (oauthName)  u.searchParams.set("name",  oauthName);
        if (oauthEmail) u.searchParams.set("email", oauthEmail);
        return NextResponse.redirect(u);
      }

      // Değilse doğrudan onboarding'e
      if (pathname !== "/onboarding") {
        url.pathname = "/onboarding";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|images|api).*)"],
};
