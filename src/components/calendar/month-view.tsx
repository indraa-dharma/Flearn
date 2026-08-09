"use client";

import React from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color?: string;
  [key: string]: any;
}

interface MonthViewProps {
  currentMonth: Date;
  events: CalendarEvent[];
}

const dotColors: Record<string, string> = {
  blue: "bg-blue-500 dark:bg-blue-400",
  rose: "bg-rose-500 dark:bg-rose-400",
  amber: "bg-amber-500 dark:bg-amber-400",
  emerald: "bg-emerald-500 dark:bg-emerald-400",
  purple: "bg-purple-500 dark:bg-purple-400",
};

export default function MonthView({ currentMonth, events }: MonthViewProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start like Google Calendar
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // Build rows of 7 days
  const rows: Date[][] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(cursor);
      cursor = addDays(cursor, 1);
    }
    rows.push(week);
  }

  const dayHeaders = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <div className="flex flex-col h-full">
      {/* Weeks grid — scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Day headers (sticky within scroll container) */}
        <div className="grid grid-cols-7 border-b border-border bg-card sticky top-0 z-10">
          {dayHeaders.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-r border-border last:border-r-0"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid" style={{ gridTemplateRows: `repeat(${rows.length}, minmax(110px, 1fr))` }}>
        {rows.map((week, ri) => (
          <div key={ri} className="grid grid-cols-7 border-b border-border last:border-b-0">
            {week.map((day, di) => {
              const inMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);
              const dayEvents = events.filter((e) =>
                e.startTime ? isSameDay(new Date(e.startTime), day) : false
              );

              return (
                <div
                  key={di}
                  className={`border-r border-border last:border-r-0 p-1.5 min-h-[80px] transition-colors ${
                    inMonth ? "bg-card" : "bg-accent/30 dark:bg-slate-900/20"
                  } ${today ? "bg-primary/[0.04] dark:bg-blue-950/20" : ""}`}
                >
                  {/* Date number */}
                  <div className="flex justify-center mb-1">
                    <span
                      className={`text-xs font-bold inline-flex items-center justify-center ${
                        today
                          ? "bg-primary dark:bg-blue-600 text-white w-6 h-6 rounded-full"
                          : inMonth
                          ? "text-foreground"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  {/* Events */}
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((evt) => {
                      const color = evt.color || "blue";
                      const dot = dotColors[color] || dotColors.blue;
                      return (
                        <div
                          key={evt.id}
                          className="flex items-center gap-1 px-1 py-0.5 rounded text-[10px] font-semibold text-foreground/80 hover:bg-accent/60 transition-colors cursor-pointer truncate"
                          title={`${evt.title} – ${format(new Date(evt.startTime), "HH:mm")}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                          <span className="truncate">
                            {format(new Date(evt.startTime), "H:mm")} {evt.title}
                          </span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <p className="text-[9px] font-bold text-primary dark:text-blue-400 px-1 cursor-pointer hover:underline">
                        +{dayEvents.length - 3} lainnya
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
