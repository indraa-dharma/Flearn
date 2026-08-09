import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    const cookieStore = await cookies();

    if (action === "connect") {
      cookieStore.set("google_calendar_connected", "true", { path: "/" });
      return NextResponse.json({
        success: true,
        connected: true,
        email: "alex.chen@gmail.com",
        message: "Google Calendar connected successfully",
      });
    } else if (action === "disconnect") {
      cookieStore.delete("google_calendar_connected");
      return NextResponse.json({
        success: true,
        connected: false,
        message: "Google Calendar disconnected",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
