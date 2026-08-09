import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireUser();
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    return NextResponse.json({
      isLoggedIn: true,
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
    return NextResponse.json({ isLoggedIn: false, user: null }, { status: 200 });
  }
}
