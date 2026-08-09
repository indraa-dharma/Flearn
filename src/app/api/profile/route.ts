import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonSuccess, handleApiError } from "@/lib/api-response";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { university, major, year, preferences, name, email, target, courses } = body;

    // Normalize preferences: accept target/courses spread into preferences
    const normalizedPreferences =
      preferences !== undefined
        ? preferences
        : {
            ...(target !== undefined && { target }),
            ...(courses !== undefined && { courses }),
          };
    const prefsToStore =
      normalizedPreferences && typeof normalizedPreferences === "object" && Object.keys(normalizedPreferences).length > 0
        ? normalizedPreferences
        : undefined;

    // Upsert profile (create if not exists, update if exists)
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        ...(university !== undefined && { university }),
        ...(major !== undefined && { major }),
        ...(year !== undefined && { year }),
        ...(prefsToStore !== undefined && { preferences: prefsToStore }),
      },
      create: {
        userId: user.id,
        university: university || null,
        major: major || null,
        year: year || null,
        preferences: prefsToStore || null,
      },
    });

    // Also update user name/email if provided
    const userData: Record<string, string> = {};
    if (name !== undefined) userData.name = name;
    if (email !== undefined) userData.email = email;
    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: userData,
      });
    }

    return jsonSuccess({ profile, message: "Profile updated successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
