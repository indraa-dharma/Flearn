"use client";

import React from "react";
import {
  CalendarClock,
  Plus,
  Zap,
  Bot,
  Clock,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { studyPlanItems } from "@/lib/mock-data";

const badgeVariantMap: Record<string, "danger" | "blue" | "purple"> = {
  Critical: "danger",
  Focus: "blue",
  Prep: "purple",
};

export default function StudyPlanPage() {
  return (
    <div className="anim-page space-y-6 pb-24">
      {/* Header */}
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Your plan for today</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
          Based on your deadlines, calendar, and document insights.
        </p>
      </div>

      {/* Main Area: 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Timeline of study plan items */}
        <div className="lg:col-span-8 relative pl-6 space-y-6">
          {/* Vertical timeline connector */}
          <div className="absolute left-[9px] top-4 bottom-4 w-0.5 bg-border -z-10" />

          {studyPlanItems.map((item, i) => (
            <div key={item.id} className="relative group" style={{ animationDelay: `${i * 80}ms` }}>
              {/* Timeline dot */}
              <div
                className={`absolute -left-[27px] top-5 h-4 w-4 rounded-full border-4 border-card transition-transform group-hover:scale-125 ${
                  item.active ? "bg-primary dark:bg-blue-500 shadow-sm" : "bg-muted-foreground/30"
                }`}
              />

              <Card className="bg-card shadow-sm rounded-2xl border border-border card-hover overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-sm font-bold text-primary dark:text-blue-400 flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> {item.time} ({item.duration})
                    </span>
                    <Badge variant={badgeVariantMap[item.badge] || "blue"} className="badge-pop text-[11px] w-fit font-bold">
                      {item.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-foreground leading-snug">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.course} • {item.topic}</p>
                  </div>

                  {item.aiNote && (
                    <div className="rounded-xl bg-accent/60 dark:bg-slate-800/50 border border-border p-4 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3 shadow-inner">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-card border border-border shadow-sm">
                        <Bot className="h-3.5 w-3.5 text-primary dark:text-blue-400" />
                      </div>
                      <p className="leading-relaxed flex-1">&ldquo;{item.aiNote}&rdquo;</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                    {item.primaryAction && (
                      <Button size="sm" className="h-9 px-4 rounded-xl bg-primary dark:bg-blue-600 hover:bg-primary-dark text-white shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
                        {item.primaryAction}
                      </Button>
                    )}
                    {item.actions?.map((act: string) => (
                      <Button key={act} size="sm" variant="outline" className="h-9 px-4 rounded-xl text-xs bg-card hover:bg-accent border-border text-foreground transition-all">
                        {act}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Plan Summary Card */}
          <Card className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden">
            <CardHeader className="bg-accent/50 border-b border-border px-6 py-4">
              <CardTitle className="text-sm font-bold text-foreground">Plan Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Total Study Time</span>
                <span className="text-foreground font-bold text-sm">3.5h</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Free Time Remaining</span>
                <span className="text-primary dark:text-blue-400 font-bold text-sm">5h 20m</span>
              </div>
              <Separator className="border-border" />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Study Readiness</span>
                  <span className="text-success dark:text-green-400 font-bold">88%</span>
                </div>
                <Progress value={88} className="h-1.5 bg-accent border border-border" />
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                  AI expects high efficiency today based on your current sleep data and task difficulty mix.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Most Urgent Card */}
          <Card className="bg-card shadow-sm rounded-2xl border border-border border-l-4 border-l-danger dark:border-l-red-500 overflow-hidden card-urgent">
            <CardContent className="p-5 space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-danger dark:text-red-400">
                Most Urgent
              </p>
              <h4 className="text-base font-bold text-foreground leading-snug">Cellular Metabolism Quiz</h4>
              <p className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
                <Clock className="h-3.5 w-3.5 text-danger dark:text-red-400" /> Due in 3 hours
              </p>
            </CardContent>
          </Card>

          {/* Recommended Next Card */}
          <Card className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden card-hover">
            <CardContent className="p-5 space-y-3">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                Recommended Next
              </p>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-primary dark:text-blue-400 shadow-sm">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground leading-snug">Metabolism Synthesis Practice</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Biology 101 • 45 mins</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Fixed Toolbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-3rem)] max-w-md bg-card/90 backdrop-blur-xl border border-border rounded-full p-2 flex items-center justify-between shadow-2xl transition-all">
        <Button variant="outline" className="h-10 px-5 rounded-full bg-card hover:bg-accent border-border text-foreground text-xs font-semibold gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" /> Add Task
        </Button>
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-primary dark:bg-blue-600 hover:bg-primary-dark text-white shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer">
          <Zap className="h-5 w-5" />
        </button>
        <Button variant="outline" className="h-10 px-5 rounded-full bg-card hover:bg-accent border-border text-foreground text-xs font-semibold gap-1.5 shadow-sm">
          <CalendarClock className="h-4 w-4" /> Optimize
        </Button>
      </div>
    </div>
  );
}
