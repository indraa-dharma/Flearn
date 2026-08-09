// ─── Chat Session Storage (localStorage) ─────────────────────
// Persists chat state so navigating away doesn't lose progress.
// Each session is independent: its own messages, sources, and workflow.

export interface StoredSource {
  id: string;
  name: string;
  type: "pdf" | "doc" | "video" | "other";
  size: string;
  status: "processing" | "ready";
}

export interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

export interface ChatSession {
  id: string;
  label: string;
  createdAt: string;
  messages: StoredMessage[];
  sources: StoredSource[];
  workflowGenerated: boolean;
  studyPlan: any | null;
  /** Cached AI explanations keyed by workflow block ID */
  explanationCache: Record<string, string>;
}

const STORAGE_KEY = "flearn-chat-sessions";
const ACTIVE_KEY = "flearn-active-session";

// ── Helpers ───────────────────────────────────────────────────
function readSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSessions(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

// ── Public API ────────────────────────────────────────────────

/** Get all saved sessions (newest first). */
export function getAllSessions(): ChatSession[] {
  return readSessions().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Get the ID of the currently active session (or null). */
export function getActiveSessionId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

/** Set the active session ID. */
export function setActiveSessionId(id: string) {
  localStorage.setItem(ACTIVE_KEY, id);
}

/** Load a specific session by ID. Returns null if not found. */
export function loadSession(id: string): ChatSession | null {
  return readSessions().find((s) => s.id === id) ?? null;
}

/** Load the active session, or create a fresh one if none exists. */
export function loadOrCreateActiveSession(): ChatSession {
  const activeId = getActiveSessionId();
  if (activeId) {
    const found = loadSession(activeId);
    if (found) return found;
  }
  // No active session — create a new one
  return createNewSession();
}

/** Create a brand-new empty session object (ephemeral — not saved to storage until first message). */
export function createNewSession(): ChatSession {
  const session: ChatSession = {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: "",
    createdAt: new Date().toISOString(),
    messages: [],
    sources: [],
    workflowGenerated: false,
    studyPlan: null,
    explanationCache: {},
  };

  setActiveSessionId(session.id);
  return session;
}

/** Persist the current session state (messages, sources, workflow, etc.). */
export function saveSession(session: ChatSession) {
  const sessions = readSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
  }
  writeSessions(sessions);
}

/** Delete a session by ID. */
export function deleteSession(id: string) {
  const sessions = readSessions().filter((s) => s.id !== id);
  writeSessions(sessions);
  if (getActiveSessionId() === id) {
    localStorage.removeItem(ACTIVE_KEY);
  }
}
