import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-response";

// ── Token Management ──────────────────────────────────────────
async function getGoogleAccount(userId: string) {
  const account = await prisma.account.findFirst({ where: { userId, provider: "google" } });
  if (!account?.access_token) throw new ApiError("Google Calendar not connected", 403);
  return account;
}

async function getValidAccessToken(userId: string): Promise<{ accessToken: string; accountId: string }> {
  const account = await getGoogleAccount(userId);

  // Check if token is expired (with 5 min buffer)
  const expiresAt = account.expires_at ? account.expires_at * 1000 : 0;
  const isExpired = Date.now() > expiresAt - 5 * 60 * 1000;

  if (!isExpired && account.access_token) {
    return { accessToken: account.access_token, accountId: account.id };
  }

  // Token expired — refresh it
  if (!account.refresh_token) {
    throw new ApiError("Google token expired and no refresh token available. Please reconnect Google.", 403);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new ApiError("Google OAuth credentials not configured", 500);
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Token refresh failed", data);
    throw new ApiError("Failed to refresh Google token. Please reconnect Google.", 403);
  }

  // Update token in DB
  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: data.access_token,
      expires_at: Math.floor(Date.now() / 1000 + (data.expires_in || 3600)),
      ...(data.refresh_token ? { refresh_token: data.refresh_token } : {}),
    },
  });

  return { accessToken: data.access_token, accountId: account.id };
}

// ── Format for UI ─────────────────────────────────────────────
export function formatCalendarEventForUi(evt: any, index = 0) {
  const colors = ["blue", "rose", "emerald", "amber", "purple"];
  const start = new Date(evt.startTime); const end = new Date(evt.endTime);
  const day = (start.getDay() + 6) % 7;
  const time = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return { id: evt.id, googleEventId: evt.googleEventId, title: evt.title, time, day, color: colors[index % colors.length], category: evt.eventType === "study_block" ? "Study" : "Classes", isConflict: false, isSuggestion: evt.source === "ai", startTime: evt.startTime, endTime: evt.endTime, syncStatus: evt.syncStatus };
}

// ── Sync Google Events ────────────────────────────────────────
export async function syncGoogleEvents(userId: string, start?: Date, end?: Date) {
  console.log("[SYNC] Starting syncGoogleEvents for user:", userId);
  const { accessToken } = await getValidAccessToken(userId);
  
  const timeMin = (start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).toISOString();
  const timeMax = (end || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)).toISOString();
  console.log("[SYNC] Time range:", timeMin, "to", timeMax);
  
  let pageToken: string | undefined = undefined;
  const saved = [];
  const syncedGoogleIds: string[] = [];

  do {
    let url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&maxResults=250&singleEvents=true&orderBy=startTime`;
    if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;
    
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const data = await res.json();
    
    if (!res.ok) {
      console.error("[SYNC] Google API error:", JSON.stringify(data.error || data));
      throw new ApiError(data?.error?.message || "Failed to fetch Google Calendar events", res.status, data);
    }
    
    for (const item of data.items || []) {
      if (!item.id) continue;
      
      if (item.status === "cancelled") {
        await prisma.calendarEvent.deleteMany({ where: { userId, googleEventId: item.id } });
        continue;
      }
      
      const s = item.start?.dateTime || item.start?.date;
      const e = item.end?.dateTime || item.end?.date || s;
      
      const evt = await prisma.calendarEvent.upsert({ 
        where: { userId_googleEventId: { userId, googleEventId: item.id } }, 
        create: { userId, googleEventId: item.id, title: item.summary || "Untitled Event", description: item.description, location: item.location, startTime: new Date(s), endTime: new Date(e), timezone: item.start?.timeZone, source: "google", eventType: "calendar", syncStatus: "synced", lastSyncedAt: new Date(), metadata: item }, 
        update: { title: item.summary || "Untitled Event", description: item.description, location: item.location, startTime: new Date(s), endTime: new Date(e), timezone: item.start?.timeZone, syncStatus: "synced", lastSyncedAt: new Date(), metadata: item } 
      });
      saved.push(evt);
      syncedGoogleIds.push(item.id);
    }
    
    pageToken = data.nextPageToken;
  } while (pageToken);

  // Hard-delete cleanup: Delete any event from DB that should be in this range, came from Google, but wasn't in the API response
  await prisma.calendarEvent.deleteMany({
    where: {
      userId,
      googleEventId: { not: null, notIn: syncedGoogleIds },
      startTime: { gte: new Date(timeMin) },
      endTime: { lte: new Date(timeMax) }
    }
  });

  console.log("[SYNC] Saved/Updated", saved.length, "events, completed hard-delete cleanup.");
  return saved;
}

// ── List Events ───────────────────────────────────────────────
export async function listCalendarEvents(userId: string, start?: Date, end?: Date) {
  let syncError: string | null = null;
  try { 
    await syncGoogleEvents(userId, start, end); 
  } catch (e: any) { 
    syncError = e?.message || "Google sync failed";
    console.warn("[LIST] Google sync failed:", syncError);
  }
  const dbEvents = await prisma.calendarEvent.findMany({ where: { userId, ...(start || end ? { startTime: { ...(start ? { gte: start } : {}), ...(end ? { lte: end } : {}) } } : {}) }, orderBy: { startTime: "asc" } });
  console.log("[LIST] Returning", dbEvents.length, "events from DB, syncError:", syncError);
  return { events: dbEvents, syncError };
}

// ── Create Event ──────────────────────────────────────────────
export async function createGoogleCalendarEvent(userId: string, input: { title: string; description?: string; startTime: string; endTime: string; eventType?: string }) {
  const { accessToken } = await getValidAccessToken(userId);
  const body = { 
    summary: input.title, 
    description: input.description || "Created by Flearn", 
    start: { dateTime: new Date(input.startTime).toISOString() }, 
    end: { dateTime: new Date(input.endTime).toISOString() },
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes: 10 }]
    }
  };
  console.log("[CALENDAR] createGoogleCalendarEvent Payload:", JSON.stringify(body));
  const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new ApiError(data?.error?.message || "Failed to create Google Calendar event", res.status, data);
  return prisma.calendarEvent.create({ data: { userId, googleEventId: data.id, title: input.title, description: input.description, startTime: new Date(input.startTime), endTime: new Date(input.endTime), source: "app", eventType: input.eventType || "study_block", syncStatus: "synced", lastSyncedAt: new Date(), metadata: data } });
}
