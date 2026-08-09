"use client";

import React, { useRef, useEffect } from "react";
import { format, isToday } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color?: string;
  googleEventId?: string;
  [key: string]: any;
}

interface WeekViewProps {
  weekDays: Date[];
  events: CalendarEvent[];
}

const HOUR_HEIGHT = 56; // px per hour row
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const colorClasses: Record<string, string> = {
  blue: "bg-blue-500/20 dark:bg-blue-500/30 border-l-blue-500 text-blue-900 dark:text-blue-200",
  rose: "bg-rose-500/20 dark:bg-rose-500/30 border-l-rose-500 text-rose-900 dark:text-rose-200",
  amber: "bg-amber-500/20 dark:bg-amber-500/30 border-l-amber-500 text-amber-900 dark:text-amber-200",
  emerald: "bg-emerald-500/20 dark:bg-emerald-500/30 border-l-emerald-500 text-emerald-900 dark:text-emerald-200",
  purple: "bg-purple-500/20 dark:bg-purple-500/30 border-l-purple-500 text-purple-900 dark:text-purple-200",
};

export default function WeekView({ weekDays, events }: WeekViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to ~7 AM on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, []);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden relative h-full">
      {/* Day header row (sticky) */}
      <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-border bg-card sticky top-0 z-30">
        <div className="border-r border-border" /> {/* gutter for time labels */}
        {weekDays.map((day, i) => {
          const today = isToday(day);
          return (
            <div
              key={i}
              className={`flex flex-col items-center py-2 border-r border-border last:border-r-0 ${
                today ? "bg-primary/5 dark:bg-blue-950/30" : ""
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {format(day, "EEE")}
              </span>
              <span
                className={`text-sm font-bold mt-0.5 ${
                  today
                    ? "bg-primary dark:bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full"
                    : "text-foreground"
                }`}
              >
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-[56px_repeat(7,1fr)] relative" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
        {/* Time labels column */}
          <div className="border-r border-border relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute w-full text-right pr-2 text-[10px] font-semibold text-muted-foreground"
                style={{ top: `${h * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px`, lineHeight: "1" }}
              >
                {h === 0 ? "" : `${h.toString().padStart(2, "0")}:00`}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIdx) => {
            const dayEvents = events.filter((e) => {
              if (!e.startTime) return false;
              const eventDate = new Date(e.startTime);
              return (
                eventDate.getFullYear() === day.getFullYear() &&
                eventDate.getMonth() === day.getMonth() &&
                eventDate.getDate() === day.getDate()
              );
            });
            const today = isToday(day);

            return (
              <div
                key={dayIdx}
                className={`relative border-r border-border last:border-r-0 ${
                  today ? "bg-primary/[0.02] dark:bg-blue-950/10" : ""
                }`}
              >
                {/* Horizontal hour lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-border/50"
                    style={{ top: `${h * HOUR_HEIGHT}px` }}
                  />
                ))}

                {/* Current time indicator */}
                {today && (
                  <div
                    className="absolute left-0 right-0 z-20 flex items-center"
                    style={{
                      top: `${(new Date().getHours() + new Date().getMinutes() / 60) * HOUR_HEIGHT}px`,
                    }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1 shrink-0" />
                    <div className="flex-1 h-[2px] bg-red-500" />
                  </div>
                )}

                {/* Events */}
                {dayEvents.map((evt) => {
                  const start = new Date(evt.startTime);
                  const end = new Date(evt.endTime);
                  const startHour = start.getHours() + start.getMinutes() / 60;
                  const durationHours = Math.max(
                    (end.getTime() - start.getTime()) / (1000 * 60 * 60),
                    0.5
                  );
                  const topPx = startHour * HOUR_HEIGHT;
                  const heightPx = Math.max(durationHours * HOUR_HEIGHT - 2, 20);

                  const colorKey = evt.color || "blue";
                  const cls = colorClasses[colorKey] || colorClasses.blue;

                  return (
                    <div
                      key={evt.id}
                      className={`absolute left-0.5 right-0.5 rounded-lg border-l-[3px] px-2 py-1 overflow-hidden cursor-pointer transition-all hover:shadow-md hover:brightness-95 z-10 ${cls}`}
                      style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                      title={`${evt.title}\n${format(start, "HH:mm")} – ${format(end, "HH:mm")}`}
                    >
                      <p className="text-[11px] font-bold leading-tight truncate">{evt.title}</p>
                      {heightPx > 30 && (
                        <p className="text-[10px] opacity-70 mt-0.5 font-medium">
                          {format(start, "HH:mm")} – {format(end, "HH:mm")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
  );
}
