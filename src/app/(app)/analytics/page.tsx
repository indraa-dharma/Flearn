import React from "react";
import {
  TrendingUp,
  CheckCircle,
  Flame,
  Clock,
  Bot,
  BarChart2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireUser } from "@/lib/auth";
import {
  getWeeklyStudyHours,
  getTotalHoursThisWeek,
  getAllTimeTasksCompleted,
  getFocusStreak,
  getPeakProductivity,
  getSubjectDistribution,
  getAIWeeklySummary,
  getProductivityMetrics,
} from "@/lib/analytics/service";
import { getServerLanguage } from "@/lib/server-translations";

export default async function AnalyticsPage() {
  const user = await requireUser();
  const userId = user.id;
  const { t } = await getServerLanguage();

  // Fetch all data in parallel where possible
  const [
    weeklyData,
    totalHours,
    tasksCompleted,
    streak,
    peakProd,
    subjects,
    productivity,
  ] = await Promise.all([
    getWeeklyStudyHours(userId),
    getTotalHoursThisWeek(userId),
    getAllTimeTasksCompleted(userId),
    getFocusStreak(userId),
    getPeakProductivity(userId),
    getSubjectDistribution(userId),
    getProductivityMetrics(userId),
  ]);

  // AI Weekly Summary needs the other metrics as context
  const aiSummary = await getAIWeeklySummary(
    userId,
    totalHours,
    tasksCompleted,
    streak,
    peakProd,
  );

  // Calculate chart scale
  const maxHours = Math.max(...weeklyData.map((d) => d.hours), 1);
  const chartScale = Math.ceil(maxHours);
  const avgHours = weeklyData.length > 0
    ? Math.round((weeklyData.reduce((a, d) => a + d.hours, 0) / weeklyData.length) * 10) / 10
    : 0;

  return (
    <div className="anim-page space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t.analytics.title}</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
          {t.analytics.subtitle}
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: t.analytics.studyHours,
            value: `${totalHours}h`,
            icon: TrendingUp,
            color: "text-primary dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-950/30",
            border: "border-blue-200 dark:border-blue-900/50",
          },
          {
            label: t.analytics.tasksCompleted,
            value: `${tasksCompleted.completed}/${tasksCompleted.total}`,
            icon: CheckCircle,
            color: "text-success dark:text-green-400",
            bg: "bg-green-50 dark:bg-green-950/30",
            border: "border-green-200 dark:border-green-900/50",
          },
          {
            label: t.dashboard.streak,
            value: `${streak} ${t.dashboard.days}`,
            icon: Flame,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-950/30",
            border: "border-amber-200 dark:border-amber-900/50",
          },
          {
            label: "Peak Productivity",
            value: peakProd,
            icon: Clock,
            color: "text-sky dark:text-sky-400",
            bg: "bg-sky-50 dark:bg-sky-950/30",
            border: "border-sky-200 dark:border-sky-900/50",
          },
        ].map((m, i) => (
          <Card
            key={m.label}
            className="bg-card shadow-sm rounded-2xl border border-border card-hover overflow-hidden"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <CardContent className="p-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{m.label}</p>
                <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
              </div>
              <div className={`p-3 rounded-xl border ${m.bg} ${m.border} shadow-sm`}>
                <m.icon className={`h-5 w-5 ${m.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Area: 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Weekly Study Hours bar chart */}
        <Card className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden">
          <CardHeader className="bg-accent/40 border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-primary dark:text-blue-400" />
                <CardTitle className="text-sm font-bold text-foreground">{t.analytics.weeklyTrend}</CardTitle>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Max {chartScale}h scale</span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 bg-accent/30 dark:bg-slate-800/20 border border-border rounded-xl shadow-inner">
              {/* Average line */}
              {avgHours > 0 && (
                <div
                  className="absolute left-0 right-0 border-b border-dashed border-primary/30 dark:border-blue-400/30 pointer-events-none flex justify-end pr-2"
                  style={{ bottom: `${(avgHours / chartScale) * 100}%` }}
                >
                  <span className="text-[9px] font-bold text-primary dark:text-blue-400 bg-card px-1.5 py-0.5 rounded border border-border -translate-y-1/2 shadow-sm">
                    Avg: {avgHours}h
                  </span>
                </div>
              )}

              {weeklyData.map((d, i) => {
                const heightPercent = chartScale > 0 ? (d.hours / chartScale) * 100 : 0;
                return (
                  <div
                    key={d.day}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <span className="text-[11px] font-extrabold text-muted-foreground group-hover:text-foreground transition-colors">
                      {d.hours}h
                    </span>
                    <div className="w-full max-w-[36px] bg-accent border border-border rounded-t-xl h-full flex items-end overflow-hidden shadow-sm">
                      <div
                        className="w-full bg-gradient-to-t from-primary to-sky dark:from-blue-600 dark:to-sky-400 rounded-t-xl transition-all duration-500 group-hover:opacity-90"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-foreground mt-1">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Right: Subject Distribution horizontal bar chart */}
        <Card className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden">
          <CardHeader className="bg-accent/40 border-b border-border px-6 py-4">
            <CardTitle className="text-sm font-bold text-foreground">Subject Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {subjects.map((subj, i) => (
              <div key={subj.subject} className="space-y-1.5 group" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-foreground group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">{subj.subject}</span>
                  <span className="text-muted-foreground font-bold">{subj.percentage}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-accent border border-border overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-sky dark:from-blue-600 dark:to-sky-400 transition-all duration-500"
                    style={{ width: `${subj.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Metrics */}
        <Card className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden">
          <CardHeader className="bg-accent/40 border-b border-border px-6 py-4">
            <CardTitle className="text-sm font-bold text-foreground">Productivity Metrics</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Avg Focus Session</span>
              <p className="text-2xl font-extrabold text-foreground">{productivity.avgFocusSession}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Completion Rate</span>
              <p className="text-2xl font-extrabold text-success dark:text-green-400">{productivity.completionRate}</p>
            </div>
            <Separator className="col-span-2 border-border" />
            <div className="col-span-2 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Weekly Improvement</span>
              <p className="text-xl font-bold text-primary dark:text-blue-400">{productivity.improvementFromLastWeek}</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Weekly Summary */}
        <Card className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden">
          <CardHeader className="bg-accent/40 border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary dark:text-blue-400" />
              <CardTitle className="text-sm font-bold text-foreground">AI Weekly Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-5 text-slate-700 dark:text-slate-300 flex items-start gap-4 shadow-sm">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card border border-border shadow-sm">
                <Bot className="h-5 w-5 text-primary dark:text-blue-400" />
              </div>
              <div className="space-y-2 flex-1">
                <p className="text-xs font-extrabold uppercase tracking-wider text-primary dark:text-blue-400">
                  {aiSummary.title}
                </p>
                <p className="text-xs leading-relaxed italic">&ldquo;{aiSummary.summary}&rdquo;</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
