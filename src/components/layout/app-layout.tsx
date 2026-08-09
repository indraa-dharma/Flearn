"use client";

import React, { useState, useEffect } from "react";
import { AppSidebar } from "./app-sidebar";
import { TopBar } from "./top-bar";
import { FloatingAI } from "../floating-ai";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Mobile drawer backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-150"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: static on lg+, off-canvas drawer on mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-out",
          "w-[var(--sidebar-width)] lg:translate-x-0",
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <AppSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main column */}
      <div className="flex flex-col min-h-screen lg:pl-[var(--sidebar-width)]">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <FloatingAI />
    </div>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}
