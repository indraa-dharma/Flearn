import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * GET /api/calendar/auth
 * 
 * Initiates a dedicated Google OAuth flow for calendar access ONLY.
 * Does NOT use signIn() — preserves the existing user session.
 */
export async function GET(request: Request) {
  // User must be logged in first
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(new URL("/?callbackUrl=/settings", baseUrl));
  }

  // Generate CSRF state token and store in httpOnly cookie
  const state = crypto.randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("calendar_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  const baseUrl = process.env.NEXTAUTH_URL || new URL(request.url).origin;

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: `${baseUrl}/api/calendar/callback`,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
