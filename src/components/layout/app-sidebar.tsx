"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  NotebookPen,
  BarChart2,
  Settings,
  Bot,
  GraduationCap,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoWithText } from "@/components/brand/logo";

import { useLanguage } from "@/lib/language-context";

const getNavItems = (t: any) => [
  { label: t.app.nav.dashboard, href: "/dashboard", icon: LayoutDashboard },
  { label: t.app.nav.workspace, href: "/chat", icon: NotebookPen },
  { label: t.app.nav.calendar, href: "/calendar", icon: Calendar },
  { label: t.app.nav.workflow, href: "/priorities", icon: GitBranch },
  { label: t.app.nav.statistics, href: "/analytics", icon: BarChart2 },
];

const getBottomItems = (t: any) => [
  { label: t.app.nav.settings, href: "/settings", icon: Settings },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  
  const navItems = getNavItems(t);
  const bottomItems = getBottomItems(t);

  const handleNav = () => onNavigate?.();

  return (
    <aside className="sidebar-surface flex h-full w-full flex-col">
      {/* Brand */}
      <Link href="/" onClick={handleNav}>
        <LogoWithText 
          size={32} 
          containerClassName="px-5 py-6"
        />
      </Link>

      {/* Divider with subtle gradient */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Main Navigation */}
      <nav className="sidebar-nav flex-1 space-y-0.5 px-3 pt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNav}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "nav-active bg-gradient-to-r from-primary-50 to-sky-light/30 text-primary shadow-sm border border-primary-100/60"
                  : "text-muted-foreground hover:bg-gradient-to-r hover:from-accent hover:to-primary-50/30 hover:text-foreground"
              )}
            >
              <div className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "bg-transparent text-muted-foreground group-hover:bg-white group-hover:text-primary group-hover:shadow-sm"
              )}>
                <Icon className="h-[15px] w-[15px]" />
              </div>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="space-y-1 px-3 pb-4">
        <div className="mx-1 mb-3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNav}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary-50 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg">
                <Icon className="h-[15px] w-[15px]" />
              </div>
              {item.label}
            </Link>
          );
        })}

        {/* AI Button — signature CTA */}
        <div className="pt-2">
          <Link href="/chat" onClick={handleNav} className="hero-gradient inline-flex items-center justify-center h-10 px-4 py-2 w-full gap-2 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-sm font-semibold cursor-pointer text-white">
            <Bot className="h-4 w-4" />
            Ask AI Assistant
          </Link>
        </div>
      </div>
    </aside>
  );
}
