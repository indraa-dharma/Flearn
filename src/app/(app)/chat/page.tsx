"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  Bot,
  Send,
  Sparkles,
  Upload,
  FileText,
  Video,
  File,
  X,
  Plus,
  ChevronRight,
  ChevronDown,
  Calendar,
  Brain,
  BookOpen,
  Loader2,
  CheckCircle,
  Zap,
  Clock,
  Target,
  LayoutTemplate,
  MessageSquarePlus,
  History,
  Trash2,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import WorkflowDetailModal from "@/components/workflow-detail-modal";
import {
  loadOrCreateActiveSession,
  saveSession,
  createNewSession,
  getAllSessions,
  setActiveSessionId,
  loadSession,
  deleteSession,
  type ChatSession,
  type StoredSource,
  type StoredMessage,
} from "@/lib/chat-storage";
import { useNotifications } from "@/lib/notification-context";
import { useLanguage } from "@/lib/language-context";

// ─── Types ───────────────────────────────────────────────────
interface Source {
  id: string;
  name: string;
  type: "pdf" | "doc" | "video" | "other";
  size: string;
  status: "processing" | "ready";
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

interface WorkflowBlock {
  id: string;
  time: string;
  title: string;
  course: string;
  duration: string;
  type: "study" | "review" | "practice" | "break";
  note?: string;
  topic?: string;
  description?: string;
}

// ─── Icon helpers ─────────────────────────────────────────────
const sourceIconMap: Record<string, React.ReactNode> = {
  pdf: (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50">
      <FileText className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
    </div>
  ),
  doc: (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
      <File className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
    </div>
  ),
  video: (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50">
      <Video className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
    </div>
  ),
  other: (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <File className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
    </div>
  ),
};

const workflowTypeColor = {
  study: "bg-blue-50 dark:bg-blue-950/40 border-l-blue-500 text-blue-900 dark:text-blue-200",
  review: "bg-amber-50 dark:bg-amber-950/40 border-l-amber-500 text-amber-900 dark:text-amber-200",
  practice: "bg-green-50 dark:bg-green-950/40 border-l-green-500 text-green-900 dark:text-green-200",
  break: "bg-slate-50 dark:bg-slate-900/40 border-l-slate-400 text-slate-700 dark:text-slate-300",
};

const workflowTypeIcon = {
  study: <BookOpen className="h-3.5 w-3.5" />,
  review: <Brain className="h-3.5 w-3.5" />,
  practice: <Target className="h-3.5 w-3.5" />,
  break: <Coffee className="h-3.5 w-3.5" />,
};

// ─── Map study plan item from API to UI block ──────────────────
function formatTimeRange(start?: string | Date, end?: string | Date): string {
  if (!start) return "Belum dijadwalkan";
  const s = new Date(start);
  const fmt = (d: Date) => d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return end ? `${fmt(s)}–${fmt(new Date(end))}` : fmt(s);
}

interface StudyPlanData {
  id: string;
  title: string;
  summary?: string;
  nextAction?: string;
  items: Array<{
    id: string;
    title: string;
    description?: string;
    course?: string;
    topic?: string;
    type: string;
    durationMinutes: number;
    reasoning?: string;
    scheduledStart?: string | null;
    scheduledEnd?: string | null;
  }>;
  rawAiOutput?: {
    calendar_events_to_create?: Array<{ title: string; description?: string; start_time: string; end_time: string }>;
    recommended_time_blocks?: Array<{ title: string; start_time: string; end_time: string; reason?: string }>;
  };
}

function planItemToBlock(item: StudyPlanData["items"][number]): WorkflowBlock {
  const type = (["study", "review", "practice", "break"].includes(item.type) ? item.type : "study") as WorkflowBlock["type"];
  return {
    id: item.id,
    time: formatTimeRange(item.scheduledStart ?? undefined, item.scheduledEnd ?? undefined),
    title: item.title,
    course: item.course || item.topic || "Umum",
    duration: `${item.durationMinutes || 60} MENIT`,
    type,
    note: item.reasoning || item.description,
    topic: item.topic,
    description: item.description,
  };
}

// ─── Main Component ───────────────────────────────────────────
export default function WorkspacePage() {
  const router = useRouter();
  const [sources, setSources] = useState<Source[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [workflowGenerated, setWorkflowGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlanData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [sessionLabel, setSessionLabel] = useState<string>("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [explanationCache, setExplanationCache] = useState<Record<string, string>>({});
  const { addNotification } = useNotifications();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Modal state for workflow detail ────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBlock, setModalBlock] = useState<WorkflowBlock | null>(null);

  // ── History dropdown state ─────────────────────────────────
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessionList, setSessionList] = useState<ChatSession[]>([]);
  const historyRef = useRef<HTMLDivElement>(null);

  // ── Mobile panel tabs (NotebookLM-style) ───────────────────
  const [mobileTab, setMobileTab] = useState<"sources" | "chat" | "workflow">("chat");
  const mobileTabs = [
    { key: "sources" as const, label: t.chat.sources, icon: <FileText className="h-3.5 w-3.5" /> },
    { key: "chat" as const, label: t.chat.title, icon: <Bot className="h-3.5 w-3.5" /> },
    { key: "workflow" as const, label: "Workflow", icon: <LayoutTemplate className="h-3.5 w-3.5" /> },
  ];

  // ── Close history dropdown on outside click ────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setHistoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Load session from localStorage on mount ────────────────
  useEffect(() => {
    const session = loadOrCreateActiveSession();
    setSessionId(session.id);
    setSessionLabel(session.label || "");
    setMessages(session.messages as Message[]);
    setSources(session.sources as Source[]);
    setWorkflowGenerated(session.workflowGenerated);
    setStudyPlan(session.studyPlan);
    setExplanationCache(session.explanationCache || {});
    setIsHydrated(true);
  }, []);

  // ── Persist session whenever state changes ─────────────────
  // Only persist if the session already has messages (ephemeral until first msg)
  const persistSession = useCallback(() => {
    if (!sessionId || !isHydrated || messages.length === 0) return;
    const session: ChatSession = {
      id: sessionId,
      label: sessionLabel || (messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? "…" : "")),
      createdAt: new Date().toISOString(),
      messages: messages as StoredMessage[],
      sources: sources as StoredSource[],
      workflowGenerated,
      studyPlan,
      explanationCache,
    };
    saveSession(session);
    setSessionList(getAllSessions());
  }, [sessionId, sessionLabel, messages, sources, workflowGenerated, studyPlan, explanationCache, isHydrated]);

  useEffect(() => {
    persistSession();
  }, [persistSession]);

  // ── Auto-resize textarea (start at 1 row, grow as needed) ──
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const newHeight = Math.max(36, Math.min(ta.scrollHeight, 120));
    ta.style.height = `${newHeight}px`;
  }, [input]);

  // ── File handling ──────────────────────────────────────────
  const getFileType = (name: string): Source["type"] => {
    if (name.endsWith(".pdf")) return "pdf";
    if (name.endsWith(".doc") || name.endsWith(".docx")) return "doc";
    if (name.endsWith(".mp4") || name.endsWith(".mov")) return "video";
    return "other";
  };

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      const tempId = `s-${Date.now()}-${f.name}`;
      const tempSource: Source = { id: tempId, name: f.name, type: getFileType(f.name), size: `${(f.size / 1024).toFixed(0)} KB`, status: "processing" };
      setSources((prev) => [...prev, tempSource]);
      try {
        const form = new FormData();
        form.append("file", f);
        const res = await fetch("/api/documents", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        setSources((prev) => prev.map((s) => s.id === tempId ? { ...s, id: data.source.id, status: "ready" } : s));
        addNotification(`"${f.name}" berhasil diupload`, "Dokumen siap dianalisis oleh AI.", "upload");
      } catch (error) {
        console.error(error);
        setSources((prev) => prev.map((s) => s.id === tempId ? { ...s, status: "ready" } : s));
      }
    }
  };

  const removeSource = (id: string) => setSources((p) => p.filter((s) => s.id !== id));

  // ── Drag & drop ────────────────────────────────────────────
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  // ── New Chat (ephemeral — not saved to history until first message) ──
  const handleNewChat = () => {
    persistSession(); // save current session first
    // Generate an ephemeral session ID but do NOT persist to storage yet
    const ephemeralId = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setSessionId(ephemeralId);
    setSessionLabel("");
    setMessages([]);
    setSources([]);
    setWorkflowGenerated(false);
    setStudyPlan(null);
    setExplanationCache({});
    setSyncResult(null);
    setInput("");
    setHistoryOpen(false);
  };

  // ── Switch to a different session ──────────────────────────
  const switchToSession = (id: string) => {
    persistSession(); // save current first
    const session = loadSession(id);
    if (session) {
      setActiveSessionId(id);
      loadSessionIntoState(session);
    }
    setHistoryOpen(false);
  };

  // ── Delete a session from history ──────────────────────────
  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Get the session's sources before deleting
    const sessionToDelete = loadSession(id);
    const sourceIds = sessionToDelete?.sources
      ?.filter(s => s.status === "ready" && !s.id.startsWith("s-"))
      ?.map(s => s.id) || [];
    
    // Delete documents from DB
    if (sourceIds.length > 0) {
      try {
        await fetch("/api/documents/batch-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: sourceIds }),
        });
      } catch (err) {
        console.error("Failed to delete documents:", err);
      }
    }
    
    deleteSession(id);
    // If deleting the current session, reset to ephemeral blank
    if (id === sessionId) {
      handleNewChat();
    }
    // Refresh list & invalidate Next.js cache so Dashboard updates
    setSessionList(getAllSessions());
    router.refresh();
  };

  // ── Load a session object into component state ─────────────
  const loadSessionIntoState = (session: ChatSession) => {
    setSessionId(session.id);
    setSessionLabel(session.label || "");
    setMessages(session.messages as Message[]);
    setSources(session.sources as Source[]);
    setWorkflowGenerated(session.workflowGenerated);
    setStudyPlan(session.studyPlan);
    setExplanationCache(session.explanationCache || {});
    setSyncResult(null);
    setInput("");
  };

  // ── Get valid source IDs for API calls ─────────────────────
  const getValidSourceIds = () =>
    sources.filter((s) => s.status === "ready" && !s.id.startsWith("s-")).map((s) => s.id);

  // ── Messaging ──────────────────────────────────────────────
  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content) return;

    const isFirstMessage = messages.length === 0;
    
    const userMsg: Message = { id: `m-${Date.now()}`, role: "user", content, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "36px";
    setIsGenerating(true);

    if (isFirstMessage) {
      setSessionLabel("✨ Merangkum judul...");
      const sourceIds = getValidSourceIds();
      fetch("/api/chat/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, sourceIds }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.data?.title) {
            setSessionLabel(data.data.title);
          } else {
            setSessionLabel(content.slice(0, 30) + (content.length > 30 ? "..." : ""));
          }
        })
        .catch((err) => {
          console.error(err);
          setSessionLabel(content.slice(0, 30) + (content.length > 30 ? "..." : ""));
        });
    }

    const isWorkflowRequest = content.toLowerCase().includes("jadwal") || content.toLowerCase().includes("schedule") || content.toLowerCase().includes("workflow");
    try {
      if (isWorkflowRequest) {
        // Explicitly pass only the source IDs from THIS session
        const sourceIds = getValidSourceIds();
        const res = await fetch("/api/study-plans/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentIds: sourceIds, // explicit — empty = no docs
            preferences: { language: "id-en", prompt: content },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal generate workflow");
        const plan = (data.studyPlan || data.plan) as StudyPlanData;
        setStudyPlan(plan);
        setWorkflowGenerated(true);
        setSyncResult(null);
        setExplanationCache({}); // reset cache for new workflow
        const stepCount = plan?.items?.length ?? 0;
        setMessages((prev) => [...prev, { id: `m-${Date.now() + 1}`, role: "assistant", content: `Done — FLearn AI sudah membuat workflow **"${plan?.title || "Study Plan"}"** dengan ${stepCount} sesi belajar.\n\nLihat panel **Study Workflow** di kanan untuk detail. Klik salah satu sesi untuk melihat penjelasan mendalam tentang materinya.`, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) }]);
        addNotification(`Workflow "${plan?.title || "Study Plan"}" dibuat`, `${stepCount} sesi belajar berhasil di-generate.`, "ai");
      } else {
        // ── General chat with AI ──
        const sourceIds = getValidSourceIds();
        const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content, history, sourceIds }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal mendapatkan respons AI");
        setMessages((prev) => [...prev, {
          id: `m-${Date.now() + 1}`,
          role: "assistant",
          content: data.reply,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        }]);
      }
    } catch (error: any) {
      setMessages((prev) => [...prev, { id: `m-${Date.now() + 2}`, role: "assistant", content: `Maaf, terjadi kesalahan: ${error.message}. Pastikan sudah login dan koneksi stabil.`, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) }]);
    } finally {
      setIsGenerating(false);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Open workflow detail modal ─────────────────────────────
  const openWorkflowDetail = (block: WorkflowBlock) => {
    setModalBlock(block);
    setModalOpen(true);
  };

  // ── Cache explanation from modal ───────────────────────────
  const handleExplanationLoaded = (blockId: string, text: string) => {
    setExplanationCache((prev) => ({ ...prev, [blockId]: text }));
  };



  // ── Sync workflow to Google Calendar ──────────────────────
  const syncToGoogleCalendar = async () => {
    if (!studyPlan) return;
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const eventsToCreate = studyPlan.rawAiOutput?.calendar_events_to_create ||
        (studyPlan.rawAiOutput?.recommended_time_blocks?.map((b) => ({ title: b.title, description: b.reason, start_time: b.start_time, end_time: b.end_time })) ?? []) ||
        (studyPlan.items.map((it) => ({ title: it.title, description: it.description, start_time: it.scheduledStart!, end_time: it.scheduledEnd! })).filter((e) => e.start_time));

      if (eventsToCreate.length === 0) {
        setSyncResult("Tidak ada time block terjadwal untuk disinkronkan.");
        return;
      }

      let ok = 0;
      let fail = 0;
      for (const evt of eventsToCreate) {
        try {
          const res = await fetch("/api/calendar/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: evt.title, description: evt.description, startTime: evt.start_time, endTime: evt.end_time, eventType: "study_block" }),
          });
          if (res.ok) ok++; else fail++;
        } catch { fail++; }
      }

      if (fail === 0) {
        setSyncResult(`✓ ${ok} event berhasil dibuat di Google Calendar.`);
        addNotification("Sinkronisasi Berhasil", `${ok} event berhasil ditambahkan ke kalendermu.`, "calendar");
      } else {
        setSyncResult(`${ok} event berhasil, ${fail} gagal. Pastikan Google Calendar sudah terhubung di menu Settings.`);
      }
    } catch (e: any) {
      setSyncResult(`Gagal sync: ${e?.message || e}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="anim-page relative flex flex-col lg:flex-row -m-4 sm:-m-6 lg:-m-8 h-[calc(100vh-var(--topbar-height))] gap-0 overflow-hidden bg-card">
      {/* ════════════════ MOBILE TAB BAR (NotebookLM-style) ════════════════ */}
      <div className="flex lg:hidden border-b border-border bg-card shrink-0">
        {mobileTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMobileTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[12px] font-bold transition-colors cursor-pointer ${
              mobileTab === tab.key
                ? "text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400 bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════ LEFT: Sources Panel ════════════════ */}
      <aside className={`flex w-full lg:w-64 shrink-0 flex-col border-r border-border bg-accent/20 dark:bg-slate-900/30 ${mobileTab === "sources" ? "flex lg:flex" : "hidden lg:flex"}`}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <div>
            <h2 className="text-sm font-bold text-foreground">Sumber</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">{sources.length} dokumen</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white shadow-sm hover:bg-primary/90 hover:scale-110 active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          className={`mx-3 mt-3 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition-all duration-200 cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-accent/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-5 w-5 text-muted-foreground" />
          <p className="text-[11px] font-semibold text-muted-foreground leading-snug">
            Upload PDF, Docs, Video
          </p>
          <p className="text-[10px] text-muted-foreground/60">atau seret ke sini</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.mp4,.mov,.txt"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />

        {/* Source list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
          {sources.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-[11px] text-muted-foreground/60 leading-snug">
                Belum ada sumber. Upload materi kuliah kamu untuk mulai.
              </p>
            </div>
          ) : (
            sources.map((src) => (
              <div
                key={src.id}
                className="group flex items-center gap-2.5 rounded-xl border border-border bg-card p-2.5 hover:border-primary/30 hover:shadow-sm transition-all duration-200 animate-in fade-in slide-in-from-left-2 duration-300"
              >
                {sourceIconMap[src.type]}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-foreground truncate">{src.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{src.size}</span>
                    {src.status === "processing" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                        <Loader2 className="h-2.5 w-2.5 animate-spin" /> Memproses…
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400">
                        <CheckCircle className="h-2.5 w-2.5" /> Siap
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeSource(src.id)}
                  className="opacity-0 group-hover:opacity-100 flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-red-500 transition-all duration-150 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Calendar status */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 rounded-xl bg-accent/50 border border-border px-3 py-2.5">
            <Calendar className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-foreground">Google Calendar</p>
              <p className="text-[10px] text-muted-foreground">Hubungkan di menu Calendar</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </div>
        </div>
      </aside>

      {/* ════════════════ MIDDLE: Chat Panel ════════════════ */}
      <div className={`flex flex-1 flex-col min-w-0 ${mobileTab === "chat" ? "flex lg:flex" : "hidden lg:flex"}`}>
        {/* Chat header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-foreground">{t.chat.title}</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              AI berbasis dokumen & kalendermu
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* History dropdown */}
            <div className="relative" ref={historyRef}>
              <button
                onClick={() => {
                  setSessionList(getAllSessions());
                  setHistoryOpen(!historyOpen);
                }}
                title="Riwayat chat"
                className="flex h-8 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-[11px] font-bold text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-accent/50 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
              >
                <History className="h-3.5 w-3.5" />
                Riwayat
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${historyOpen ? "rotate-180" : ""}`} />
              </button>

              {historyOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-72 max-h-80 overflow-y-auto rounded-xl border border-border bg-card shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 border-b border-border">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">Riwayat Percakapan</p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    {sessionList.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground text-center py-4">Belum ada riwayat</p>
                    ) : (
                      sessionList.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => switchToSession(s.id)}
                          className={`w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-all duration-150 cursor-pointer group ${
                            s.id === sessionId
                              ? "bg-primary/10 border border-primary/30 text-foreground"
                              : "hover:bg-accent/60 text-foreground/80"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold truncate">{s.label}</p>
                            <p className="text-[9px] text-muted-foreground mt-0.5">
                              {s.messages.length} pesan · {new Date(s.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          {s.id !== sessionId && (
                            <button
                              onClick={(e) => handleDeleteSession(s.id, e)}
                              className="opacity-0 group-hover:opacity-100 flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-red-500 transition-all duration-150 shrink-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleNewChat}
              title="Mulai sesi chat baru"
              className="flex h-8 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-[11px] font-bold text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-accent/50 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              Chat Baru
            </button>
            <Badge variant="blue" className="text-[10px] font-bold py-1 px-2.5 gap-1">
              <Sparkles className="h-3 w-3" /> FLearn AI
            </Badge>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-background/40 dark:bg-slate-900/20 lg:pb-4 pb-16">
          {/* Welcome state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-5 py-8 animate-in fade-in duration-500">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky shadow-lg">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-foreground">{t.chat.greeting}</h3>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
                  Upload dokumen di panel kiri, lalu tanya saya apa saja tentang materimu atau minta jadwal belajar.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {t.chat.suggestions.map((chip: string) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="text-[11px] font-semibold bg-card hover:bg-accent border border-border text-foreground rounded-full px-3.5 py-1.5 shadow-sm transition-all duration-200 hover:scale-[1.03] hover:border-primary/40 active:scale-[0.97] cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? "items-end" : "items-start"}`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {!isUser && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-sky shadow-sm">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[85%] shadow-sm transition-shadow hover:shadow-md ${
                    isUser
                      ? "bg-primary dark:bg-blue-600 text-white rounded-br-none"
                      : "bg-card text-foreground border border-border rounded-bl-none"
                  }`}
                >
                  {isUser ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none
                      prose-p:text-foreground/90 prose-p:text-sm prose-p:leading-relaxed prose-p:my-1
                      prose-strong:text-foreground prose-strong:font-bold
                      prose-em:text-primary/80 dark:prose-em:text-blue-400/80
                      prose-li:text-foreground/90 prose-li:text-sm prose-li:marker:text-primary
                      prose-headings:text-foreground prose-headings:font-bold
                      prose-h3:text-sm prose-h3:mt-3 prose-h3:mb-1
                      prose-code:bg-accent/60 prose-code:text-primary dark:prose-code:text-blue-400 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
                      prose-table:text-xs prose-th:bg-accent/50 prose-th:px-3 prose-th:py-1.5 prose-th:text-left prose-th:font-bold prose-th:border-b prose-th:border-border
                      prose-td:px-3 prose-td:py-1.5 prose-td:border-b prose-td:border-border/50
                      prose-blockquote:border-l-primary prose-blockquote:text-sm
                      prose-a:text-primary dark:prose-a:text-blue-400
                    ">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">{msg.time}</span>
              </div>
            );
          })}

          {/* Loading indicator */}
          {isGenerating && (
            <div className="flex items-start gap-2 animate-in fade-in duration-200">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-sky shadow-sm">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl bg-card border border-border px-4 py-3 shadow-sm rounded-bl-none">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-blue-400 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar — single-line textarea that grows */}
        <div className="border-t border-border bg-card p-3 shrink-0 mb-0">
          <div className="flex items-center gap-2 bg-accent/40 border border-border rounded-2xl px-3 py-1.5 focus-within:border-primary/50 focus-within:bg-accent/60 transition-all duration-200 shadow-sm">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-card border border-transparent hover:border-border transition-all duration-150 cursor-pointer"
            >
              <Upload className="h-4 w-4" />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.chat.askAnything}
              rows={1}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none leading-none py-2"
              style={{ height: "32px", maxHeight: "120px" }}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() && !isGenerating}
              className="h-8 px-4 rounded-xl bg-primary dark:bg-blue-600 hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 gap-1.5 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shrink-0"
            >
              <Send className="h-3.5 w-3.5" /> Kirim
            </Button>
          </div>
        </div>
      </div>

      {/* ════════════════ RIGHT: Output Studio ════════════════ */}
      <aside className={`flex w-full lg:w-72 shrink-0 flex-col border-l border-border bg-accent/10 dark:bg-slate-900/20 ${mobileTab === "workflow" ? "flex lg:flex" : "hidden lg:flex"}`}>
        <div className="border-b border-border px-4 py-3.5">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 text-primary dark:text-blue-400" />
            <h2 className="text-sm font-bold text-foreground">Study Workflow</h2>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Output dari analisis AI</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {!workflowGenerated ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-sky/10 border border-border">
                <Zap className="h-6 w-6 text-primary/40 dark:text-blue-400/40" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground/60">Workflow belum dibuat</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1 leading-snug">
                  Upload dokumen & tanya AI untuk membuat jadwal belajar optimal
                </p>
              </div>
              <button
                onClick={() => sendMessage("Buatkan jadwal belajar minggu ini")}
                className="text-[11px] font-bold text-primary dark:text-blue-400 hover:underline underline-offset-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                Buat sekarang →
              </button>
            </div>
          ) : (
            <>
              {/* Summary strip */}
              <div className="rounded-xl bg-gradient-to-r from-primary/10 to-sky/10 border border-primary/20 dark:border-blue-800/40 p-3 mb-1">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary dark:text-blue-400" />
                  <span className="text-[11px] font-bold text-primary dark:text-blue-400 uppercase tracking-wider">AI Generated</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Total", value: `${Math.round(((studyPlan?.items || []).reduce((acc, it) => acc + (it.durationMinutes || 0), 0)) / 60 * 10) / 10} jam`, icon: <Clock className="h-3 w-3" /> },
                    { label: "Sesi", value: `${studyPlan?.items?.length ?? 0}`, icon: <Target className="h-3 w-3" /> },
                    { label: "Fokus", value: "AI", icon: <Zap className="h-3 w-3" /> },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="flex justify-center text-primary dark:text-blue-400 mb-0.5">{s.icon}</div>
                      <p className="text-xs font-bold text-foreground">{s.value}</p>
                      <p className="text-[9px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
                {studyPlan?.summary && (
                  <p className="text-[10px] text-muted-foreground mt-2 leading-snug border-t border-primary/10 pt-2">{studyPlan.summary}</p>
                )}
              </div>

              {/* Clickable hint */}
              <p className="text-[9px] text-center text-primary/60 dark:text-blue-400/60 font-semibold mb-1">
                ↓ Klik sesi untuk penjelasan mendalam ↓
              </p>

              {/* Workflow blocks — CLICKABLE (except breaks) */}
              {(studyPlan?.items || []).map((item, i) => {
                const block = planItemToBlock(item);
                const isCached = !!explanationCache[block.id];
                const isBreak = block.type === "break";

                const content = (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-current opacity-70">{workflowTypeIcon[block.type]}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">{block.duration}</span>
                      </div>
                      <span className="text-[9px] font-bold opacity-60">{block.time}</span>
                    </div>
                    <p className={`text-xs font-bold leading-tight transition-colors ${isBreak ? "text-foreground" : "text-foreground group-hover:text-primary dark:group-hover:text-blue-400"}`}>{block.title}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">{block.course}</p>
                    {block.note && (
                      <p className="text-[10px] opacity-60 mt-1.5 leading-snug border-t border-current/10 pt-1.5">{block.note}</p>
                    )}
                    {!isBreak && (
                      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {isCached ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-[9px] font-bold text-green-600 dark:text-green-400">Tersimpan · Lihat penjelasan →</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 text-primary dark:text-blue-400" />
                            <span className="text-[9px] font-bold text-primary dark:text-blue-400">Lihat penjelasan AI →</span>
                          </>
                        )}
                      </div>
                    )}
                  </>
                );

                if (isBreak) {
                  return (
                    <div
                      key={block.id}
                      className={`w-full text-left rounded-xl border-l-4 border border-border p-3 shadow-sm ${workflowTypeColor[block.type]} animate-in fade-in slide-in-from-right-2 duration-300 opacity-80`}
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      {content}
                    </div>
                  );
                }

                return (
                  <button
                    key={block.id}
                    onClick={() => openWorkflowDetail(block)}
                    className={`w-full text-left rounded-xl border-l-4 border border-border p-3 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] animate-in fade-in slide-in-from-right-2 duration-300 cursor-pointer group ${workflowTypeColor[block.type]}`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {content}
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Studio actions */}
        {workflowGenerated && (
          <div className="border-t border-border p-3 space-y-2 animate-in fade-in duration-300">
            <button
              onClick={syncToGoogleCalendar}
              disabled={isSyncing}
              className="w-full rounded-xl border border-primary/30 dark:border-blue-800/50 bg-primary/5 dark:bg-blue-950/30 text-xs font-bold text-primary dark:text-blue-400 py-2.5 hover:bg-primary/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyinkronkan…
                </>
              ) : (
                <>
                  <Calendar className="h-3.5 w-3.5" />
                  Kirim ke Google Calendar
                </>
              )}
            </button>
            {syncResult && (
              <p className="text-[10px] text-center text-muted-foreground leading-snug px-1">{syncResult}</p>
            )}

          </div>
        )}
      </aside>

      {/* ════════════════ MODAL: Workflow Detail ════════════════ */}
      {modalBlock && (
        <WorkflowDetailModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setModalBlock(null); }}
          title={modalBlock.title}
          course={modalBlock.course}
          description={modalBlock.description || modalBlock.note}
          topic={modalBlock.topic}
          type={modalBlock.type}
          duration={modalBlock.duration}
          sourceIds={getValidSourceIds()}
          cachedExplanation={explanationCache[modalBlock.id] || null}
          onExplanationLoaded={(text) => handleExplanationLoaded(modalBlock.id, text)}
        />
      )}
    </div>
  );
}
