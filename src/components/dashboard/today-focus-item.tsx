"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { toggleTaskStatus } from "@/app/(app)/dashboard/actions";

interface TodayFocusItemProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    urgency: string;
    urgencyColor: string;
  };
  index: number;
  urgencyBg: Record<string, string>;
  urgencyColorMap: Record<string, "danger" | "warning" | "neutral">;
  initialStatus: string;
}

export function TodayFocusItem({ task, index, urgencyBg, urgencyColorMap, initialStatus }: TodayFocusItemProps) {
  const [isCompleted, setIsCompleted] = useState(initialStatus === "completed");

  const handleToggle = async () => {
    const newState = !isCompleted;
    setIsCompleted(newState);
    try {
      await toggleTaskStatus(task.id, newState);
    } catch (error) {
      console.error("Failed to toggle task", error);
      setIsCompleted(!newState); // revert on error
    }
  };

  return (
    <div
      onClick={handleToggle}
      className={`group flex items-start gap-3 rounded-xl p-3.5 card-hover cursor-pointer transition-all duration-300 ${
        isCompleted ? "opacity-60 bg-accent/30" : urgencyBg[task.urgencyColor]
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div 
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          isCompleted 
            ? "bg-primary border-primary dark:bg-blue-600 dark:border-blue-600" 
            : "border-border bg-card group-hover:border-primary dark:group-hover:border-blue-400"
        }`}
      >
        {isCompleted && <Check className="h-3.5 w-3.5 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-semibold transition-all ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}>
            {task.title}
          </p>
          {!isCompleted && (
            <Badge variant={urgencyColorMap[task.urgencyColor]} className="text-[10px] font-bold badge-pop">
              {task.urgency}
            </Badge>
          )}
        </div>
        <p className={`mt-0.5 text-xs line-clamp-1 transition-all ${isCompleted ? "text-muted-foreground/50 line-through" : "text-muted-foreground"}`}>
          {task.description}
        </p>
      </div>
    </div>
  );
}
