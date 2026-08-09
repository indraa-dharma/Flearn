"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function AuthCompletePage() {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const tab = window.open("/dashboard", "_blank", "noopener,noreferrer");
    setOpened(Boolean(tab));
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <section className="max-w-md w-full rounded-3xl border border-border bg-card p-8 text-center shadow-xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-success dark:bg-green-950/50 dark:text-green-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">Login berhasil</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Dashboard FLearn sedang dibuka di tab baru. Kalau browser memblokir pop-up, klik tombol di bawah.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-sky px-5 text-sm font-bold text-white shadow-md transition hover:scale-[1.02]"
          >
            Buka Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
            Kembali ke landing page
          </Link>
        </div>
        {!opened && (
          <p className="mt-4 text-[11px] text-amber-600 dark:text-amber-400">
            Pop-up mungkin diblokir browser. Gunakan tombol manual di atas.
          </p>
        )}
      </section>
    </main>
  );
}
