import React from "react";
import {
  GitBranch,
  Sparkles,
  Clock,
  Target,
  CheckCircle,
  Zap,
  ArrowRight,
  Bot,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getTodayWorkflow, getWorkflowInsights } from "@/lib/workflow/service";
import { WorkflowItemCard } from "@/components/workflow/workflow-item";
import { getServerLanguage } from "@/lib/server-translations";

export default async function WorkflowPage() {
  const user = await requireUser();
  const rawItems = await getTodayWorkflow(user.id);
  const insights = await getWorkflowInsights(rawItems);
  const { t } = await getServerLanguage();

  const items = rawItems.map((item) => ({
    id: item.id,
    time: item.scheduledStart && item.scheduledEnd
      ? `${item.scheduledStart.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} – ${item.scheduledEnd.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
      : "Belum dijadwalkan",
    duration: `${item.durationMinutes || 60} MENIT`,
    title: item.title,
    course: item.course || "General",
    topic: item.topic || "Study plan",
    type: item.type || "study",
    aiNote: item.reasoning,
    status: item.status,
  }));

  const isEmpty = items.length === 0;
  
  // Metrics calculation
  const totalMinutes = rawItems.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1).replace(".0", "");
  const totalSessions = rawItems.length;
  const completedSessions = rawItems.filter(item => item.status === "completed").length;

  return (
    <div className="anim-page space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-sky shadow-sm">
              <GitBranch className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t.workflow.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {t.workflow.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="blue" className="gap-1.5 px-3 py-1.5 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            AI Generated
          </Badge>
        </div>
      </div>

      {/* Empty state notice */}
      {isEmpty && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-4 flex items-start gap-3">
          <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
              {t.workflow.emptyState}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-0.5 leading-relaxed">
              {t.workflow.emptySub}
            </p>
          </div>
          <Link
            href="/chat"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-amber-600 dark:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 hover:bg-amber-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
          >
            {t.workflow.generateWorkflow} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — Workflow Timeline */}
        <div className="lg:col-span-2 space-y-3">
          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Belajar", value: `${totalHours} jam`, icon: <Clock className="h-4 w-4" />, color: "text-primary dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50" },
              { label: "Sesi Aktif", value: totalSessions.toString(), icon: <Target className="h-4 w-4" />, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50" },
              { label: "Selesai", value: `${completedSessions} / ${totalSessions}`, icon: <CheckCircle className="h-4 w-4" />, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-3 ${s.bg} flex flex-col gap-1`}>
                <span className={s.color}>{s.icon}</span>
                <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Workflow items */}
          <div className="space-y-3">
            {items.map((item, i) => (
              <WorkflowItemCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </div>

        {/* Right — Notifications + Actions */}
        <div className="space-y-4">
          {/* AI Regenerate */}
          <Card className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-accent/50 to-card border-b border-border px-4 pt-4">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary dark:text-blue-400" />
                Update Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.workflow.emptySub}
              </p>
              <Link
                href="/chat"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-primary to-sky text-white text-xs font-bold py-2.5 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t.chat.title}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          {/* Stats summary */}
          <Card className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-accent/50 to-card border-b border-border px-4 pt-4">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                Insight Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {[
                { label: "Waktu Produktif Puncak", value: insights.peakProductivityTime },
                { label: "Estimasi Selesai", value: insights.estimatedCompletionTime },
                { label: "Tingkat Kesiapan", value: insights.readinessLevel },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <span className="text-xs font-bold text-foreground">{s.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
