import React from "react";
import Link from "next/link";
import {
  Plus,
  MoreHorizontal,
  FileText,
  Video,
  CheckCircle,
  Loader2,
  Upload,
  ArrowUpRight,
  Flame,
  Clock,
  Calendar,
  BarChart2,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReadinessRing } from "@/components/readiness-ring";
import { getDashboardData } from "@/lib/dashboard/service";
import { requireUser } from "@/lib/auth";
import { getFocusStreak, getTotalHoursThisWeek, getProductivityMetrics } from "@/lib/analytics/service";
import { format, differenceInMinutes, parseISO } from "date-fns";
import { TodayFocusItem } from "@/components/dashboard/today-focus-item";
import { getServerLanguage } from "@/lib/server-translations";

const urgencyBg: Record<string, string> = {
  danger: "bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-900/50",
  warning: "bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50",
  neutral: "bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700/50",
};

const urgencyColorMap: Record<string, "danger" | "warning" | "neutral"> = {
  danger: "danger",
  warning: "warning",
  neutral: "neutral",
};

const iconMap: Record<string, React.ReactNode> = {
  pdf: (
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50">
      <FileText className="h-4 w-4 text-red-500 dark:text-red-400" />
    </div>
  ),
  doc: (
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
      <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
    </div>
  ),
  video: (
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50">
      <Video className="h-4 w-4 text-purple-500 dark:text-purple-400" />
    </div>
  ),
};

const eventColorMap: Record<string, string> = {
  blue: "bg-blue-50 dark:bg-blue-950/40 border-l-2 border-l-blue-500 dark:border-l-blue-400 text-blue-900 dark:text-blue-200",
  gray: "bg-slate-50 dark:bg-slate-800/50 border-l-2 border-l-slate-400 dark:border-l-slate-500 text-slate-700 dark:text-slate-200",
  amber: "bg-amber-50 dark:bg-amber-950/40 border-l-2 border-l-amber-500 dark:border-l-amber-400 text-amber-900 dark:text-amber-200",
  rose: "bg-rose-50 dark:bg-rose-950/40 border-l-2 border-l-rose-500 dark:border-l-rose-400 text-rose-900 dark:text-rose-200",
  red: "bg-red-50 dark:bg-red-950/40 border-l-2 border-l-red-500 dark:border-l-red-400 text-red-900 dark:text-red-200",
};

export default async function DashboardPage() {
  const { t } = await getServerLanguage();
  const user = await requireUser();
  const data = await getDashboardData();
  const { todaysItems, weeklyEvents, recentDocs, totalDocs, freeTimeString, startOfWeek, endOfWeek } = data;

  const streak = await getFocusStreak(user.id);
  const totalHours = await getTotalHoursThisWeek(user.id);
  const metrics = await getProductivityMetrics(user.id);
  const completedSessions = todaysItems.filter(item => item.status === "completed").length;

  const todayFocus = todaysItems.map((item) => {
    let urgencyColor = "neutral";
    if (item.type === "practice" || item.title.toLowerCase().includes("quiz")) urgencyColor = "danger";
    else if (item.type === "review") urgencyColor = "warning";

    return {
      id: item.id,
      title: item.title,
      description: item.description || item.reasoning || item.course,
      urgency: item.durationMinutes + " mnt",
      urgencyColor,
      status: item.status,
    };
  });

  const weekRange = `${format(startOfWeek, "MMM d")} — ${format(endOfWeek, "MMM d")}`;
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    days.push({
      label: format(d, "E"), // MON, TUE...
      date: d.getDate(),
      isToday: d.getTime() === today.getTime(),
      fullDate: d,
    });
  }

  const weeklyScheduleEvents = weeklyEvents.map((e) => {
    // find day index (0-6) relative to startOfWeek
    const diff = e.startTime.getTime() - startOfWeek.getTime();
    const dayIndex = Math.floor(diff / (1000 * 60 * 60 * 24));
    let color = "blue";
    if (e.eventType === "study_block") color = "amber";
    if (e.title.toLowerCase().includes("exam") || e.title.toLowerCase().includes("kuis")) color = "red";
    
    return {
      id: e.id,
      title: e.title,
      location: e.location || (e.startTime ? format(e.startTime, "HH:mm") : ""),
      day: dayIndex >= 0 && dayIndex < 7 ? dayIndex : -1,
      color,
    };
  }).filter((e) => e.day >= 0);

  const recentSources = recentDocs.map((doc) => {
    let icon = "pdf";
    if (doc.type === "video/mp4" || doc.url?.includes("youtube")) icon = "video";
    else if (doc.type.includes("document") || doc.type.includes("word")) icon = "doc";
    
    return {
      id: doc.id,
      fileName: doc.originalName || doc.title || (doc.fileName ? doc.fileName.replace(/^[a-f0-9]{16}-/, "") : "Document"),
      category: doc.subject || doc.course || "General",
      categoryColor: "blue",
      uploaded: format(doc.createdAt, "MMM d"),
      status: doc.extractionStatus === "done" || doc.summaryStatus === "done" || doc.status === "processed" || doc.status === "ready" ? "Processed" : doc.extractionStatus === "processing" ? "Processing" : "Uploaded",
      icon,
    };
  });

  return (
    <div className="anim-page space-y-6">
      {/* Welcome Banner + Study Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Statistics Hero Banner */}
        <div className="lg:col-span-3">
          <div className="hero-gradient relative overflow-hidden rounded-2xl p-7 text-white shadow-lg">
            <div className="glow-orb h-48 w-48 bg-sky right-0 top-0 -translate-y-1/4 translate-x-1/4" />
            <div className="glow-orb h-32 w-32 bg-blue-300 bottom-0 left-1/3" />
            <div className="absolute right-10 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border border-white/20" />
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider mb-3">
                <BarChart2 className="h-3 w-3" />
                {t.dashboard.title}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: t.dashboard.streak, value: `${streak} ${t.dashboard.days}`, icon: <Flame className="h-4 w-4" /> },
                  { label: t.dashboard.thisWeek, value: `${completedSessions} ${t.dashboard.items}`, icon: <BookOpen className="h-4 w-4" /> },
                  { label: t.dashboard.focusHours, value: `${totalHours} ${t.dashboard.hours}`, icon: <Clock className="h-4 w-4" /> },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-white/60">{s.icon}<span className="text-[11px] font-semibold uppercase tracking-wider">{s.label}</span></div>
                    <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-3">
                <Link
                  href="/analytics"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-primary shadow-sm hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] duration-150"
                >
                  {t.app.nav.statistics}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Study Readiness */}
        <div className="card-success rounded-2xl border p-6 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all duration-200">
          <ReadinessRing
            percentage={parseInt(metrics.completionRate) || 0}
            size={110}
          />
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">{t.dashboard.readiness}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t.dashboard.completedTasks}</p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-success dark:text-green-400 bg-green-50 dark:bg-green-950/40 rounded-full px-3 py-1 border border-green-200 dark:border-green-900/50">
            <Flame className="h-3 w-3" /> {streak}-day streak
          </div>
        </div>
      </div>

      {/* Google Calendar Connect Banner */}
      <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 p-4 flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800/50">
          <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-900 dark:text-amber-200">{t.calendar.syncGoogle}</p>
          <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-0.5">{t.calendar.subtitle}</p>
        </div>
        <Link
          href="/calendar"
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-amber-600 dark:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 hover:bg-amber-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 shadow-sm"
        >
          {t.calendar.syncGoogle} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Quick stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t.dashboard.todayFocus, value: todaysItems.length.toString(), accent: "text-danger dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-900/50" },
          { label: t.dashboard.recentDocs, value: totalDocs.toString(), accent: "text-primary dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-900/50" },
          { label: t.dashboard.freeTime, value: freeTimeString, accent: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-900/50" },
          { label: t.dashboard.readiness, value: metrics.completionRate, accent: "text-success dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-900/50" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl p-4 border ${stat.bg} ${stat.border} flex flex-col gap-1 card-hover shadow-sm`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
            <span className={`text-2xl font-bold ${stat.accent}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Today's Focus + Weekly Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Focus */}
        <Card className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-gradient-to-r from-accent/50 to-card border-b border-border px-6 pt-5">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-primary dark:bg-blue-500" />
              <CardTitle className="text-base font-bold text-foreground">{t.dashboard.todayFocus}</CardTitle>
            </div>
            <Link
              href="/workflow"
              className="flex items-center gap-1 text-xs font-semibold text-primary dark:text-blue-400 hover:underline transition-colors"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {todayFocus.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">{t.dashboard.emptyFocus}</div>
            ) : todayFocus.map((task, i) => (
              <TodayFocusItem 
                key={task.id} 
                task={task} 
                index={i} 
                urgencyBg={urgencyBg} 
                urgencyColorMap={urgencyColorMap}
                initialStatus={task.status}
              />
            ))}
            <button className="w-full rounded-xl border-2 border-dashed border-border py-2.5 text-sm text-muted-foreground hover:border-primary/50 dark:hover:border-blue-400/50 hover:text-primary dark:hover:text-blue-400 hover:bg-accent/50 transition-all duration-200 cursor-pointer group">
              <Plus className="inline h-3.5 w-3.5 mr-1 group-hover:rotate-90 transition-transform duration-200" />
              {t.calendar.addEvent}
            </button>
          </CardContent>
        </Card>

        {/* Weekly Schedule */}
        <Card className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-gradient-to-r from-accent/50 to-card border-b border-border px-6 pt-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 rounded-full bg-sky dark:bg-sky-400" />
                <CardTitle className="text-base font-bold text-foreground">{t.dashboard.thisWeek}</CardTitle>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 pl-3">{weekRange}</p>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {days.map((day) => (
                <div key={day.label} className="text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{day.label}</p>
                  <div className={`mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    day.isToday
                      ? "bg-primary dark:bg-blue-600 text-white shadow-sm"
                      : "text-foreground hover:bg-accent cursor-pointer"
                  }`}>
                    {day.date}
                  </div>
                </div>
              ))}
            </div>
            <Separator className="mb-3 border-border" />
            {/* Events grid */}
            <div className="grid grid-cols-7 gap-1 min-h-[140px]">
              {days.map((day, dayIndex) => {
                const dayEvents = weeklyScheduleEvents.filter((e) => e.day === dayIndex);
                return (
                  <div key={day.label} className="space-y-1">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`group rounded-lg p-1.5 text-[9px] cursor-pointer transition-all hover:scale-[1.02] hover:shadow-sm ${
                          eventColorMap[event.color] || eventColorMap.blue
                        }`}
                      >
                        <p className="font-bold leading-tight truncate">{event.title}</p>
                        {event.location && (
                          <p className="opacity-60 mt-0.5 truncate">{event.location}</p>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sources */}
      <Card className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3 bg-gradient-to-r from-accent/50 to-card border-b border-border px-6 pt-5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-purple-400 dark:bg-purple-500" />
            <CardTitle className="text-base font-bold text-foreground">{t.dashboard.recentDocs}</CardTitle>
          </div>
          <Link href="/workspace">
            <Button size="sm" className="h-8 gap-1.5 text-xs rounded-lg bg-primary dark:bg-blue-600 hover:bg-primary-dark shadow-sm text-white">
              <Upload className="h-3 w-3" />
              {t.dashboard.uploadNew}
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table header — hidden on small screens */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border bg-accent/30">
            <div className="col-span-5">File</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Uploaded</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1" />
          </div>
          {recentSources.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">{t.dashboard.emptyDocs}</div>
          ) : recentSources.map((source, i) => (
            <Link
              key={source.id}
              href={`/workspace/${source.id}`}
              className="row-hover sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center block px-4 sm:px-6 py-3.5 border-b border-border last:border-0"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="col-span-5 flex items-center gap-3">
                {iconMap[source.icon]}
                <span className="text-sm font-medium text-foreground truncate">{source.fileName}</span>
              </div>
              <div className="col-span-2 hidden sm:block">
                <Badge variant={source.categoryColor === "blue" ? "blue" : "purple"} className="badge-pop text-[11px]">
                  {source.category}
                </Badge>
              </div>
              <div className="col-span-2 hidden sm:flex text-xs text-muted-foreground items-center gap-1">
                <Clock className="h-3 w-3" /> {source.uploaded}
              </div>
              <div className="col-span-2 hidden sm:block">
                {source.status === "Processed" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success dark:text-green-400">
                    <CheckCircle className="h-3.5 w-3.5" /> Processed
                  </span>
                ) : source.status === "Processing" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <CheckCircle className="h-3.5 w-3.5" /> Uploaded
                  </span>
                )}
              </div>
              <div className="col-span-1 flex justify-end">
                <button className="icon-btn p-1.5 rounded-lg text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
