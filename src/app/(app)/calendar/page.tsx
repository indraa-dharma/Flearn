"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  startOfWeek,
  addDays,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths,
  format,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import WeekView from "@/components/calendar/week-view";
import MonthView from "@/components/calendar/month-view";

// ─── Types ────────────────────────────────────────────────────
interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color?: string;
  googleEventId?: string;
  syncStatus?: string;
  [key: string]: any;
}

// ─── Component ────────────────────────────────────────────────
export default function CalendarPage() {
  const { isCalendarConnected, connectGoogleCalendar, disconnectGoogleCalendar } = useAuth();
  const { t } = useLanguage();

  // State
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"week" | "month">("week");
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [needsReconnect, setNeedsReconnect] = useState(false);

  // Ref to track fetching state
  const isFetchingRef = useRef(false);

  // ── Fetch events from backend (which auto-syncs with Google) ──
  const fetchEvents = useCallback(async (showLoader = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (showLoader) setIsLoading(true);
    try {
      const res = await fetch("/api/calendar/events");
      if (res.ok) {
        const data = await res.json();
        if (data.needsReconnect) {
          setNeedsReconnect(true);
        } else {
          setNeedsReconnect(false);
        }
        const eventsArray = data.rawEvents || data.events || [];
        if (data.success) {
          setEvents(
            eventsArray.map((e: any) => ({
              ...e,
              color: e.color || "blue",
            }))
          );
        }
      }
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // ── Initial fetch ──────────────────────────────────────────
  useEffect(() => {
    fetchEvents(true);
  }, [fetchEvents]);

  // ── Real-time: re-fetch on window focus ────────────────────
  useEffect(() => {
    const onFocus = () => fetchEvents(false);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchEvents]);

  // ── Real-time: polling every 30s ───────────────────────────
  useEffect(() => {
    const id = setInterval(() => fetchEvents(false), 30_000);
    return () => clearInterval(id);
  }, [fetchEvents]);

  // ── Navigation ─────────────────────────────────────────────
  const goToday = () => setAnchorDate(new Date());
  const goPrev = () =>
    setAnchorDate((d) => (view === "week" ? subWeeks(d, 1) : subMonths(d, 1)));
  const goNext = () =>
    setAnchorDate((d) => (view === "week" ? addWeeks(d, 1) : addMonths(d, 1)));

  // ── Derived data ───────────────────────────────────────────
  const weekStart = startOfWeek(anchorDate, { weekStartsOn: 0 }); // Sunday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const headerLabel =
    view === "week"
      ? `${format(weekStart, "MMMM d")} – ${format(addDays(weekStart, 6), "d, yyyy")}`
      : format(anchorDate, "MMMM yyyy");

  // ── Compute live stats from real events ────────────────────
  const now = new Date();
  const weekEvents = events.filter((e) => {
    if (!e.startTime) return false;
    const d = new Date(e.startTime);
    return d >= weekStart && d <= addDays(weekStart, 7);
  });
  const totalThisWeek = weekEvents.length;

  const upcomingCount = events.filter((e) => {
    if (!e.startTime) return false;
    return new Date(e.startTime) > now;
  }).length;

  const totalHours = weekEvents.reduce((sum, e) => {
    if (!e.startTime || !e.endTime) return sum;
    return sum + (new Date(e.endTime).getTime() - new Date(e.startTime).getTime()) / (1000 * 60 * 60);
  }, 0);

  const stats = [
    { label: t.calendar.thisWeek, value: `${totalThisWeek} Event`, icon: "calendar" as const, color: "blue" as const },
    { label: t.calendar.upcoming, value: `${upcomingCount} Event`, icon: "clock" as const, color: "gray" as const },
    { label: t.calendar.totalHours, value: `${totalHours.toFixed(1)}h`, icon: "clock" as const, color: "primary" as const },
    { label: t.calendar.synced, value: needsReconnect ? t.calendar.needsReconnect : isCalendarConnected ? t.calendar.connected : t.calendar.notConnected, icon: "calendar" as const, color: (needsReconnect ? "danger" : isCalendarConnected ? "success" : "warning") as string },
  ];

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="anim-page flex flex-col h-[calc(100vh-120px)] gap-4 overflow-hidden">
      {/* Top Warning Banner if Google token is expired */}
      {needsReconnect && (
        <div className="flex items-center justify-between gap-3 bg-amber-500/15 border border-amber-500/40 rounded-xl px-4 py-2.5 text-amber-900 dark:text-amber-200 text-xs shrink-0 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="font-semibold">
              {t.calendar.reconnectWarning}
            </span>
          </div>
          <button
            onClick={connectGoogleCalendar}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            {t.calendar.reconnectButton}
          </button>
        </div>
      )}

      {/* Top Row: 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {stats.map((stat, i) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            iconName={stat.icon}
            color={stat.color}
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>

      {/* Calendar card (fills remaining space) */}
      <Card className="flex flex-col flex-1 min-h-0 bg-card shadow-sm rounded-2xl border border-border overflow-hidden">
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3 shrink-0 bg-accent/40">
          <div className="flex items-center gap-3">
            {/* Today button */}
            <button
              onClick={goToday}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              {t.calendar.today}
            </button>

            {/* Prev / Next */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={goPrev}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent border border-border bg-card shadow-sm transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goNext}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent border border-border bg-card shadow-sm transition-all cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Date label */}
            <h2 className="text-sm font-bold text-foreground">{headerLabel}</h2>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-0.5">
            <button
              onClick={() => setView("week")}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                view === "week"
                  ? "bg-primary dark:bg-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {t.calendar.week}
            </button>
            <button
              onClick={() => setView("month")}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                view === "month"
                  ? "bg-primary dark:bg-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {t.calendar.month}
            </button>
          </div>
        </div>

        {/* Calendar body */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-blue-400" />
            </div>
          ) : view === "week" ? (
            <WeekView weekDays={weekDays} events={events} />
          ) : (
            <MonthView currentMonth={anchorDate} events={events} />
          )}
        </div>
      </Card>
    </div>
  );
}
