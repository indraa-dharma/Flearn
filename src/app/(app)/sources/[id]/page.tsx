"use client";

import React, { use } from "react";
import {
  FileText,
  Bookmark,
  Lightbulb,
  Bot,
  Send,
  Sparkles,
  Layers,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { documentDetail, chatMessages } from "@/lib/mock-data";

export default function DocumentDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);

  return (
    <div className="anim-page space-y-6">
      {/* 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar (~200px equivalent) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Course context card */}
          <Card className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden card-hover">
            <CardContent className="p-5 flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-primary dark:text-blue-400 shadow-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground leading-tight">Biology 101</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Cell Division Study</p>
              </div>
            </CardContent>
          </Card>

          {/* Vertical Nav */}
          <div className="space-y-1 bg-accent/30 p-2 rounded-2xl border border-border shadow-inner">
            {[
              { label: "Overview", active: true },
              { label: "Annotate", active: false },
              { label: "Structure", active: false },
              { label: "Citations", active: false },
              { label: "Revision", active: false },
            ].map((nav) => (
              <button
                key={nav.label}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  nav.active
                    ? "bg-primary dark:bg-blue-600 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent hover:border-border"
                }`}
              >
                <span>{nav.label}</span>
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </button>
            ))}
          </div>

          {/* Document Details Section */}
          <Card className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden">
            <CardHeader className="bg-accent/40 border-b border-border px-5 py-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Document Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 text-red-500 dark:text-red-400 shadow-sm">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground truncate">cell_structure_complete.pdf</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Uploaded Oct 12 • 12 Pages</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/50">
                <Badge variant="blue" className="badge-pop text-[10px]">#Biology</Badge>
                <Badge variant="purple" className="badge-pop text-[10px]">#CellStructure</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Document Outline Section */}
          <Card className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden">
            <CardHeader className="bg-accent/40 border-b border-border px-5 py-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Document Outline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-1">
              {documentDetail.outline.map((item) => (
                <div
                  key={item.title}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    item.active
                      ? "bg-primary dark:bg-blue-600 text-white font-bold shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent font-medium"
                  }`}
                >
                  <span className="truncate pr-2">{item.title}</span>
                  <span className="text-[10px] opacity-75 shrink-0 font-bold">P. {item.page}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Center Main Content (flex-1 equivalent) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Title & Actions */}
          <div className="space-y-4 pb-2 border-b border-border">
            <div className="space-y-1">
              <Badge variant="blue" className="badge-pop text-[10px] font-extrabold uppercase tracking-widest">
                Subject: Biology
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {documentDetail.title}
              </h1>
            </div>

            {/* Action buttons row */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: "Summarize", primary: false },
                { label: "Generate Flashcards", primary: false },
                { label: "Explain Simply", primary: false },
                { label: "Extract Key Points", primary: false },
                { label: "Create Study Plan", primary: true },
              ].map((act) => (
                <Button
                  key={act.label}
                  variant={act.primary ? "default" : "outline"}
                  size="sm"
                  className={`h-9 px-4 rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] ${
                    act.primary
                      ? "bg-primary dark:bg-blue-600 hover:bg-primary-dark text-white shadow-md"
                      : "bg-card hover:bg-accent border-border text-foreground"
                  }`}
                >
                  {act.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Overview */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary dark:text-blue-400" /> Overview
            </h2>
            <Card className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden">
              <CardContent className="p-6 text-sm text-muted-foreground leading-relaxed">
                {documentDetail.overview}
              </CardContent>
            </Card>
          </div>

          {/* Key Concepts */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-warning dark:text-amber-500" /> Key Concepts
            </h2>
            <div className="space-y-3">
              {documentDetail.keyConcepts.map((conc, i) => (
                <Card
                  key={conc.title}
                  className="bg-card shadow-sm rounded-2xl border border-border border-l-4 border-l-primary dark:border-l-blue-500 card-hover overflow-hidden"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <CardContent className="p-5 space-y-1.5">
                    <h3 className="text-sm font-bold text-primary dark:text-blue-400">{conc.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{conc.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Important Terms */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-purple-500 dark:text-purple-400" /> Important Terms
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documentDetail.importantTerms.map((term, i) => (
                <Card
                  key={term.term}
                  className="bg-card shadow-sm rounded-2xl border border-border card-hover overflow-hidden"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <CardContent className="p-5 space-y-1">
                    <h4 className="text-sm font-bold text-primary dark:text-blue-400">{term.term}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{term.definition}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel (~280px equivalent): AI Assistant Chat */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden flex flex-col h-[calc(100vh-140px)] sticky top-24">
            {/* Header */}
            <CardHeader className="flex flex-row items-center justify-between bg-accent/50 border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <Bot className="h-5 w-5 text-primary dark:text-blue-400" />
                <CardTitle className="text-sm font-bold text-foreground">AI Assistant</CardTitle>
              </div>
              {/* Live green dot */}
              <span className="h-2 w-2 rounded-full bg-green-500 shadow-sm animate-pulse-ring" />
            </CardHeader>

            {/* Chat messages */}
            <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatMessages.map((msg, i) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div
                      className={`rounded-2xl p-4 text-xs leading-relaxed max-w-[90%] shadow-sm ${
                        isUser
                          ? "bg-primary dark:bg-blue-600 text-white rounded-br-none"
                          : "bg-accent/60 dark:bg-slate-800/60 text-foreground border border-border rounded-bl-none"
                      }`}
                    >
                      <p>{msg.content}</p>
                      {msg.citation && (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded bg-card/80 dark:bg-card text-[10px] font-bold text-primary dark:text-blue-400 border border-border shadow-sm">
                          {msg.citation}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground px-1">
                      {msg.time}
                    </span>
                  </div>
                );
              })}
            </CardContent>

            {/* Input at bottom */}
            <div className="p-3 border-t border-border bg-accent/30">
              <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1.5 shadow-inner">
                <input
                  type="text"
                  placeholder="Ask about this document…"
                  className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground pl-3 pr-2 py-2 focus:outline-none"
                />
                <Button size="sm" className="h-8 w-8 p-0 rounded-lg bg-primary dark:bg-blue-600 hover:bg-primary-dark text-white shadow-sm hover:scale-105 transition-all cursor-pointer">
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
