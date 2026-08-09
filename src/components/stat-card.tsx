import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  Calendar,
  AlertTriangle,
  Clock,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  book: BookOpen,
  calendar: Calendar,
  alert: AlertTriangle,
  clock: Clock,
};

const colorMap: Record<string, { bg: string; icon: string }> = {
  blue: { bg: "bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50", icon: "text-blue-600 dark:text-blue-400" },
  gray: { bg: "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50", icon: "text-slate-600 dark:text-slate-400" },
  danger: { bg: "bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50", icon: "text-red-600 dark:text-red-400" },
  primary: { bg: "bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50", icon: "text-blue-600 dark:text-blue-400" },
  success: { bg: "bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/50", icon: "text-green-600 dark:text-green-400" },
  warning: { bg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50", icon: "text-amber-600 dark:text-amber-400" },
};

interface StatCardProps {
  label: string;
  value: string;
  icon?: string;
  iconName?: string;
  color?: string;
  className?: string;
  trend?: string;
  trendValue?: string;
  style?: React.CSSProperties;
}

export function StatCard({
  label,
  value,
  icon,
  iconName,
  color = "blue",
  className,
  trend,
  trendValue,
  style,
}: StatCardProps) {
  const activeIconKey = icon || iconName || "clock";
  const Icon = iconMap[activeIconKey] || Clock;
  const colors = colorMap[color] || colorMap.blue;

  return (
    <Card className={cn("flex items-center gap-4 p-4 bg-card border-border shadow-sm card-hover", className)} style={style}>
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm",
          colors.bg
        )}
      >
        <Icon className={cn("h-5 w-5", colors.icon)} />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <p className="text-base font-bold text-foreground">{value}</p>
          {trendValue && (
            <span className={cn("text-[10px] font-bold", trend === "down" ? "text-danger dark:text-red-400" : "text-success dark:text-green-400")}>
              {trendValue}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
