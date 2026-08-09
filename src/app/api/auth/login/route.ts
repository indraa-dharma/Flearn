import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Lightweight session bootstrap used by the login modal flow.
// Real authentication happens through NextAuth (/api/auth/*).
// This endpoint just reports the currently authenticated user from DB.
export async function POST() {
  try {
    const user = await requireUser();
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    return NextResponse.json({
      success: true,
      provider: "credentials",
      user: {
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        image: user.image || "",
        university: profile?.university || "",
        major: profile?.major || "",
        year: profile?.year || "",
        target: profile?.preferences ? (profile.preferences as any)?.target || "" : "",
        courses: profile?.preferences ? (profile.preferences as any)?.courses || [] : [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in first." },
      { status: 401 }
    );
  }
}
