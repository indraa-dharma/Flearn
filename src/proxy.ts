import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ── Routes that DON'T require authentication ────────────────
const publicPaths = [
  "/",              // Landing page
  "/onboarding",    // Onboarding flow
  "/auth",          // Auth callback pages
  "/api/auth",      // NextAuth API routes (login, callback, csrf, etc.)
];

// Static assets & internal Next.js paths — always skip middleware
const ignoredPrefixes = [
  "/_next",         // Next.js internals (chunks, HMR, etc.)
  "/favicon.ico",
  "/images",
  "/fonts",
];

function isPublicPath(pathname: string): boolean {
  // Check static/ignored prefixes first
  if (ignoredPrefixes.some((p) => pathname.startsWith(p))) return true;

  // Check public paths (exact match or prefix match)
  return publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware entirely for public and static paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // ── Validate JWT token (Edge-compatible, no DB call) ──────
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // No valid token → redirect to landing page
  if (!token) {
    const loginUrl = new URL("/", request.url);
    // Preserve the intended destination so we can redirect back after login
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token valid → allow through
  return NextResponse.next();
}

// ── Matcher: run middleware on all routes except static files ──
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (SEO files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
