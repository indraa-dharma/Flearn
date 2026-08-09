import { requireUser } from "@/lib/auth";
import { handleApiError, jsonSuccess } from "@/lib/api-response";
import { createGoogleCalendarEvent, formatCalendarEventForUi, listCalendarEvents } from "@/lib/calendar/service";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const { events, syncError } = await listCalendarEvents(user.id, start ? new Date(start) : undefined, end ? new Date(end) : undefined);
    return jsonSuccess({
      rawEvents: events,
      events: events.map(formatCalendarEventForUi),
      syncError,
      needsReconnect: Boolean(syncError && syncError.includes("Google token expired")),
    });
  } catch (e) {
    console.error("[CALENDAR API] GET error:", e);
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    let startTime = body.startTime;
    let endTime = body.endTime;
    if (!startTime && typeof body.startHour === "number") {
      const d = new Date();
      d.setDate(d.getDate() + ((body.day ?? 0) - ((d.getDay() + 6) % 7)));
      d.setHours(body.startHour, 0, 0, 0);
      startTime = d.toISOString();
      endTime = new Date(d.getTime() + (body.duration || 1) * 60 * 60 * 1000).toISOString();
    }
    const event = await createGoogleCalendarEvent(user.id, {
      title: body.title,
      description: body.description,
      startTime,
      endTime,
      eventType: body.eventType,
    });
    const { events } = await listCalendarEvents(user.id);
    return jsonSuccess({ event, events: events.map(formatCalendarEventForUi) }, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
