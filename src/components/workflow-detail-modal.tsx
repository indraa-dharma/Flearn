"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  X,
  BookOpen,
  Loader2,
  Sparkles,
  GraduationCap,
  HelpCircle,
  RotateCcw,
  Brain,
  Target,
  Coffee,
} from "lucide-react";

interface WorkflowDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  course: string;
  description?: string;
  topic?: string;
  type: "study" | "review" | "practice" | "break";
  duration: string;
  sourceIds?: string[];
  /** Pre-cached explanation text (avoids re-fetching) */
  cachedExplanation?: string | null;
  /** Called when explanation is fetched so parent can cache it */
  onExplanationLoaded?: (text: string) => void;
}

const typeConfig = {
  study: {
    gradient: "from-blue-500 to-indigo-600",
    label: "Sesi Belajar",
    icon: <BookOpen className="h-3 w-3" />,
  },
  review: {
    gradient: "from-amber-500 to-orange-600",
    label: "Review Materi",
    icon: <Brain className="h-3 w-3" />,
  },
  practice: {
    gradient: "from-green-500 to-emerald-600",
    label: "Latihan Soal",
    icon: <Target className="h-3 w-3" />,
  },
  break: {
    gradient: "from-slate-500 to-gray-600",
    label: "Istirahat",
    icon: <Coffee className="h-3 w-3" />, 
  },
};

export default function WorkflowDetailModal({
  isOpen,
  onClose,
  title,
  course,
  description,
  topic,
  type,
  duration,
  sourceIds,
  cachedExplanation,
  onExplanationLoaded,
}: WorkflowDetailModalProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cfg = typeConfig[type] || typeConfig.study;

  const fetchExplanation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, course, description, topic, sourceIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal generate penjelasan");
      setExplanation(data.explanation);
      onExplanationLoaded?.(data.explanation);
    } catch (e: any) {
      setError(e.message || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch explanation when modal opens (use cache if available)
  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    // If cached, use it immediately
    if (cachedExplanation) {
      setExplanation(cachedExplanation);
      setIsLoading(false);
      return;
    }

    setExplanation(null);
    setIsLoading(true);
    fetchExplanation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, title, cachedExplanation]);

  // Scroll to top when content loads
  useEffect(() => {
    if (explanation && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [explanation]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop — strong blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md rounded-2xl" />

      {/* Modal — fills container but constrained by padding */}
      <div className="relative w-[95%] max-w-none h-[95%] bg-card border border-border rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">
        {/* ── Header ── */}
        <div className={`relative px-8 pt-6 pb-5 bg-gradient-to-r ${cfg.gradient} text-white shrink-0`}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-sm"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {cfg.icon}
              {cfg.label}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
              {duration}
            </span>
          </div>

          <h2 className="text-xl font-bold leading-tight pr-10">{title}</h2>
          <p className="text-sm opacity-80 mt-1">{course}{topic ? ` · ${topic}` : ""}</p>
          {description && (
            <p className="text-xs opacity-70 mt-2 leading-relaxed">{description}</p>
          )}
        </div>

        {/* ── Content ── */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-8 py-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 animate-in fade-in duration-300">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky shadow-lg">
                  <Sparkles className="h-6 w-6 text-white animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">FLearn sedang menganalisis...</p>
                <p className="text-xs text-muted-foreground mt-1">Membuat penjelasan mendalam untuk <strong>{title}</strong></p>
              </div>
              <div className="flex gap-1 mt-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-6 rounded-full bg-primary/30 dark:bg-blue-400/30 animate-pulse"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 animate-in fade-in duration-300">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
                <HelpCircle className="h-6 w-6 text-red-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">Gagal membuat penjelasan</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">{error}</p>
              </div>
              <button
                onClick={fetchExplanation}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-blue-400 hover:underline underline-offset-2 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Coba Lagi
              </button>
            </div>
          )}

          {explanation && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* AI badge */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-sky shadow-sm">
                  <GraduationCap className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-[10px] font-bold text-primary dark:text-blue-400 uppercase tracking-wider">
                  Penjelasan dari FLearn AI
                </span>
              </div>

              {/* Rendered markdown content */}
              <div className="prose prose-sm dark:prose-invert max-w-none
                prose-headings:text-foreground prose-headings:font-bold
                prose-h2:text-base prose-h2:mt-6 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border
                prose-h3:text-sm prose-h3:mt-5 prose-h3:mb-2
                prose-h4:text-sm prose-h4:mt-4 prose-h4:mb-1.5
                prose-p:text-foreground/85 prose-p:leading-relaxed prose-p:text-sm
                prose-strong:text-foreground prose-strong:font-bold
                prose-em:text-primary/80 dark:prose-em:text-blue-400/80
                prose-li:text-foreground/85 prose-li:text-sm prose-li:marker:text-primary
                prose-code:bg-accent/60 prose-code:text-primary dark:prose-code:text-blue-400 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                prose-table:text-sm prose-th:bg-accent/60 prose-th:text-foreground prose-th:font-bold prose-th:px-4 prose-th:py-2.5 prose-th:text-left prose-th:border-b prose-th:border-border
                prose-td:px-4 prose-td:py-2 prose-td:text-foreground/80 prose-td:border-b prose-td:border-border/50
                prose-tr:hover:bg-accent/30 prose-tr:transition-colors
                prose-hr:border-border prose-hr:my-4
                prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:text-sm
                prose-a:text-primary dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {explanation}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
