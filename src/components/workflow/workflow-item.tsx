"use client";

import React, { useState } from "react";
import { Clock, BookOpen, Brain, Target, ChevronDown, ChevronUp, Bot, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toggleTaskStatus } from "@/app/(app)/dashboard/actions";

interface WorkflowItemProps {
  item: {
    id: string;
    time: string;
    duration: string;
    title: string;
    course: string;
    topic: string;
    type: string;
    aiNote: string | null;
    status: string;
  };
  index: number;
}

const typeConfig: Record<string, any> = {
  study: {
    color: "bg-blue-50 dark:bg-blue-950/40 border-l-blue-500 dark:border-l-blue-400",
    badge: "blue",
    icon: <BookOpen className="h-4 w-4" />,
    label: "Belajar",
  },
  review: {
    color: "bg-amber-50 dark:bg-amber-950/40 border-l-amber-500 dark:border-l-amber-400",
    badge: "warning",
    icon: <Brain className="h-4 w-4" />,
    label: "Review",
  },
  practice: {
    color: "bg-green-50 dark:bg-green-950/40 border-l-green-500 dark:border-l-green-400",
    badge: "neutral",
    icon: <Target className="h-4 w-4" />,
    label: "Latihan",
  },
  break: {
    color: "bg-slate-50 dark:bg-slate-800/50 border-l-slate-400",
    badge: "neutral",
    icon: <Clock className="h-4 w-4" />,
    label: "Istirahat",
  },
};

export function WorkflowItemCard({ item, index }: WorkflowItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(item.status === "completed");
  
  const config = typeConfig[item.type] || typeConfig.study;
  
  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent expand
    const newState = !isCompleted;
    setIsCompleted(newState);
    try {
      await toggleTaskStatus(item.id, newState);
    } catch (error) {
      console.error("Failed to toggle task", error);
      setIsCompleted(!newState);
    }
  };

  return (
    <div
      className={`group rounded-2xl border-l-4 border border-border shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
        isCompleted ? "opacity-60 bg-accent/30 border-l-primary" : config.color
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className="flex items-start gap-4 p-4 cursor-pointer hover:bg-accent/10 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Toggle / Icon */}
        <div 
          className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5 cursor-pointer"
          onClick={handleToggle}
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors border ${
            isCompleted 
              ? "bg-primary dark:bg-blue-600 text-white border-primary" 
              : "bg-card border-border text-muted-foreground hover:border-primary/50"
          }`}>
            {isCompleted ? <CheckCircle className="h-5 w-5" /> : config.icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant={config.badge} className="text-[10px] font-bold px-2 py-0.5">
              {config.label}
            </Badge>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {item.duration}
            </span>
          </div>
          <h3 className={`text-sm font-bold leading-tight transition-colors ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}>
            {item.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{item.course} · {item.topic}</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3" /> {item.time}
          </p>
        </div>

        {/* Expand toggle */}
        <button className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded AI note */}
      {expanded && item.aiNote && (
        <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-start gap-2.5 rounded-xl bg-card/60 border border-border px-3.5 py-3">
            <Bot className="h-4 w-4 text-primary dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">{item.aiNote}</p>
          </div>
        </div>
      )}
    </div>
  );
}
