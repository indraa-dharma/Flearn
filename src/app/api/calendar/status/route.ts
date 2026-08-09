import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const userEmail = session?.user?.email;

    if (!session || !userEmail) {
      return NextResponse.json({ connected: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { accounts: true }
    });

    const googleAccount = user?.accounts?.find(a => a.provider === "google");

    if (googleAccount) {
      const expiresAt = googleAccount.expires_at ? googleAccount.expires_at * 1000 : 0;
      const isExpired = expiresAt > 0 && Date.now() > expiresAt - 5 * 60 * 1000;
      const hasRefreshToken = Boolean(googleAccount.refresh_token);

      // If token is expired and there is no refresh token, it needs reconnection
      const isValid = !isExpired || hasRefreshToken;

      return NextResponse.json({
        connected: isValid,
        needsReconnect: !isValid,
        email: session.user?.email,
      });
    }

    return NextResponse.json({ connected: false });
  } catch (error) {
    console.error("Error checking calendar status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
