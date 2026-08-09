import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await fs.mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueSuffix = crypto.randomBytes(4).toString("hex");
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const newFileName = `${uniqueSuffix}-${safeFileName}`;
    const filePath = path.join(uploadDir, newFileName);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/avatars/${newFileName}`;

    // Update the User in Prisma database using server-side session
    await prisma.user.update({
      where: { id: user.id },
      data: { image: publicUrl },
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload avatar" },
      { status: 500 }
    );
  }
}

// Remove avatar — clears the image in DB using server-side session
export async function DELETE() {
  try {
    const user = await requireUser();
    await prisma.user.update({
      where: { id: user.id },
      data: { image: null },
    });
    return NextResponse.json({ success: true, url: "" });
  } catch (error: any) {
    console.error("Avatar remove error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove avatar" },
      { status: 500 }
    );
  }
}
