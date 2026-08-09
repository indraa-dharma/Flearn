"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Upload,
  Search,
  FileText,
  Video,
  MoreHorizontal,
  CheckCircle2,
  Loader2,
  Clock,
  Laptop,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileUploadModal } from "@/components/upload/file-upload-modal";

const iconMap: Record<string, React.ReactNode> = {
  pdf: (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 shadow-sm">
      <FileText className="h-5 w-5 text-red-500 dark:text-red-400" />
    </div>
  ),
  doc: (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 shadow-sm">
      <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
    </div>
  ),
  video: (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 shadow-sm">
      <Video className="h-5 w-5 text-purple-500 dark:text-purple-400" />
    </div>
  ),
};

export default function SourcesPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [sources, setSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    async function fetchSources() {
      try {
        const res = await fetch("/api/upload");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSources(data.sources);
          }
        }
      } catch (error) {
        console.error("Failed to fetch sources", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSources();
  }, []);

  const handleUploadSuccess = (newSource: any) => {
    setSources((prev) => [newSource, ...prev]);
  };

  const filteredSources = sources.filter((src) => {
    const matchesTab = activeTab === "All" || src.category === activeTab || src.subject === activeTab;
    const matchesSearch = src.title.toLowerCase().includes(search.toLowerCase()) || src.fileName.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="anim-page space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary dark:bg-blue-600 text-white shadow-md">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sources Library</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Your uploaded documents and lecture materials from laptop</p>
          </div>
        </div>
        <Button
          onClick={() => setIsUploadOpen(true)}
          className="h-10 gap-2 px-5 rounded-xl bg-gradient-to-r from-primary to-sky hover:from-primary-dark hover:to-primary text-white font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Laptop className="h-4 w-4" />
          Upload New Source
        </Button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-accent/40 border border-border p-3 rounded-2xl shadow-inner">
        {/* Search */}
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Search files or titles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-xl border border-border bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {["All", "STEM", "Humanities", "Social Science"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-primary dark:bg-blue-600 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent hover:border-border"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-blue-400" />
        </div>
      ) : (
        /* Grid of Document Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSources.map((src, i) => (
            <Card
              key={src.id}
              className="bg-card shadow-sm rounded-2xl border border-border card-hover overflow-hidden relative group"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 truncate">
                    {iconMap[src.type || "pdf"] || iconMap.pdf}
                    <div className="truncate">
                      <Link href={`/sources/${src.id}`} className="text-base font-bold text-foreground hover:text-primary dark:hover:text-blue-400 transition-colors line-clamp-1 group-hover:underline truncate">
                        {src.title}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{src.fileName}</p>
                    </div>
                  </div>
                  <button className="icon-btn p-1.5 rounded-lg text-muted-foreground hover:text-foreground shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                {/* Tags row */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="blue" className="badge-pop text-[10px] font-bold">
                    {src.subject || "General"}
                  </Badge>
                  {src.tags?.map((tag: string) => (
                    <Badge key={tag} variant="neutral" className="badge-pop text-[10px] font-semibold">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Bottom row */}
                <div className="flex items-center justify-between pt-3 border-t border-border/60 text-[11px] font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {src.pages} Pages • {src.uploadedDate || "Oct 12"}
                  </span>
                  {src.status === "Processed" ? (
                    <span className="inline-flex items-center gap-1 text-success dark:text-green-400 font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Processed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Syncing…
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Upload File From Laptop */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
