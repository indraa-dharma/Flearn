"use client";

import React from "react";
import { GraduationCap, RefreshCw, AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  const isDbError =
    /prisma|database|connection|ECONN|tls|ssl/i.test(error?.message || "");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-lg p-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary dark:text-blue-400" />
            <h1 className="text-lg font-bold text-foreground">FLearn AI</h1>
          </div>
          <h2 className="text-base font-bold text-foreground">Terjadi kesalahan</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isDbError
              ? "Tidak bisa terhubung ke database. Pastikan koneksi internet aktif dan Supabase sedang online, lalu coba lagi."
              : "Terjadi error tak terduga saat memuat halaman. Biasanya bisa diatasi dengan reload."}
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <pre className="text-left text-[10px] font-mono text-muted-foreground bg-accent/50 border border-border rounded-xl p-3 overflow-x-auto max-h-32">
            {error?.message || "Unknown error"}
          </pre>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={reset}
            className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-primary to-sky text-white text-sm font-bold shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" /> Coba lagi
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-accent transition-all cursor-pointer"
          >
            Ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}
