import { NextResponse, type NextRequest } from "next/server";

/**
 * First-pass gate for authenticated areas.
 *
 * CONSTRAINT: the real refresh token is an HttpOnly cookie scoped to the API
 * domain, which this middleware cannot see in cross-site deployments. We rely
 * on `boi_pora_auth` — a credential-free presence hint set by AuthProvider on
 * the frontend domain. It can be forged or stale, so this is UX only (skip a
 * flash of protected UI); the API and the client-side guards remain the real
 * enforcement layers. Fail open is intentional.
 */
const PROTECTED_PREFIXES = ["/library", "/profile", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (!isProtected) return NextResponse.next();

  const hasAuthHint = request.cookies.has("boi_pora_auth");
  if (!hasAuthHint) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/library/:path*", "/profile/:path*", "/admin/:path*"],
};
