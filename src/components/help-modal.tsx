"use client";

import React, { useEffect } from 'react';
import { Upload, Bot, Calendar, CheckCircle, X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-3xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Cara Kerja FLearn AI</h2>
            <p className="text-sm text-muted-foreground mt-1">Panduan singkat untuk memulai</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1 */}
            <div className="p-4 rounded-xl border border-border bg-background/50 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">1. Upload Materi</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Upload dokumen PDF, DOC, atau video ke Workspace AI
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl border border-border bg-background/50 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">2. Tanya AI</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tanya apa saja tentang materimu, AI akan menjawab berdasarkan dokumenmu
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl border border-border bg-background/50 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">3. Generate Jadwal</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Minta AI buatkan jadwal belajar otomatis berdasarkan materi
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl border border-border bg-background/50 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">4. Sinkronkan Kalender</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Kirim jadwal belajar langsung ke Google Calendar
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-border bg-muted/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Mulai Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
