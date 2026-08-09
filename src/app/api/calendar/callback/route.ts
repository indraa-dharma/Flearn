import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * GET /api/calendar/callback
 *
 * Handles the OAuth callback from Google after the user approves calendar access.
 * Exchanges the authorization code for tokens and stores them in the Account table
 * linked to the currently logged-in user — WITHOUT altering their session.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const baseUrl = process.env.NEXTAUTH_URL || url.origin;

  // ── Google returned an error (user denied access, etc.) ───
  if (error) {
    return NextResponse.redirect(
      new URL("/settings?calendar=denied", baseUrl)
    );
  }

  // ── Verify CSRF state token ───────────────────────────────
  const cookieStore = await cookies();
  const savedState = cookieStore.get("calendar_oauth_state")?.value;
  cookieStore.delete("calendar_oauth_state");

  if (!state || state !== savedState) {
    return NextResponse.redirect(
      new URL("/settings?calendar=invalid_state", baseUrl)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/settings?calendar=no_code", baseUrl)
    );
  }

  // ── Verify user is still logged in ────────────────────────
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.redirect(
      new URL("/?callbackUrl=/settings", baseUrl)
    );
  }

  const userId = (session.user as any).id as string | undefined;
  const userEmail = session.user.email;

  if (!userId && !userEmail) {
    return NextResponse.redirect(
      new URL("/settings?calendar=no_user", baseUrl)
    );
  }

  // ── Exchange authorization code for tokens ────────────────
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: `${baseUrl}/api/calendar/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    console.error("[Calendar] Token exchange failed:", errText);
    return NextResponse.redirect(
      new URL("/settings?calendar=token_error", baseUrl)
    );
  }

  const tokens = await tokenRes.json();

  // ── Get Google user info (for providerAccountId) ──────────
  const userInfoRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${tokens.access_token}` } }
  );

  if (!userInfoRes.ok) {
    console.error("[Calendar] Failed to fetch Google userinfo");
    return NextResponse.redirect(
      new URL("/settings?calendar=userinfo_error", baseUrl)
    );
  }

  const userInfo = await userInfoRes.json();
  const providerAccountId = userInfo.id || userInfo.sub;

  // ── Find the currently logged-in user in DB ───────────────
  const user = await prisma.user.findFirst({
    where: userId ? { id: userId } : { email: userEmail! },
  });

  if (!user) {
    return NextResponse.redirect(
      new URL("/settings?calendar=user_not_found", baseUrl)
    );
  }

  // ── Upsert Google account with calendar tokens ────────────
  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId: providerAccountId,
      },
    },
    create: {
      userId: user.id,
      type: "oauth",
      provider: "google",
      providerAccountId: providerAccountId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_in
        ? Math.floor(Date.now() / 1000) + tokens.expires_in
        : undefined,
      token_type: tokens.token_type,
      scope: tokens.scope,
      id_token: tokens.id_token,
    },
    update: {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? undefined,
      expires_at: tokens.expires_in
        ? Math.floor(Date.now() / 1000) + tokens.expires_in
        : undefined,
      token_type: tokens.token_type,
      scope: tokens.scope,
      id_token: tokens.id_token,
    },
  });

  // ── Success → redirect back to settings ───────────────────
  return NextResponse.redirect(
    new URL("/settings?calendar=connected", baseUrl)
  );
}
