import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.user.count();
    return NextResponse.json({ ok: true, count });
  } catch (error: any) {
    return NextResponse.json({ 
      ok: false,
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
    }, { status: 500 });
  }
}
