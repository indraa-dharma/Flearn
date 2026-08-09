import { requireUser } from "@/lib/auth";
import { handleApiError, jsonSuccess } from "@/lib/api-response";
import { syncGoogleEvents } from "@/lib/calendar/service";

export async function POST(request: Request) { try { const user = await requireUser(); const { start, end } = await request.json().catch(() => ({})); const events = await syncGoogleEvents(user.id, start ? new Date(start) : undefined, end ? new Date(end) : undefined); return jsonSuccess({ synced: events.length, events }); } catch (e) { return handleApiError(e); } }
