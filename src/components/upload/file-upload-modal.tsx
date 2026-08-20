"use client";

import React, { useState, useRef } from "react";
import { X, Upload, FileText, Loader2, CheckCircle2, AlertCircle, Laptop } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/lib/notification-context";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newSource: any) => void;
}

export function FileUploadModal({ isOpen, onClose, onUploadSuccess }: FileUploadModalProps) {
  const { addNotification } = useNotifications();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError("");
      setSuccess(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setError("");
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file from your laptop first.");
      return;
    }

    const lowerName = selectedFile.name.toLowerCase();
    if (!lowerName.endsWith(".pdf") && !lowerName.endsWith(".txt") && !lowerName.endsWith(".md")) {
      setError("Format belum didukung. Gunakan PDF, TXT, atau Markdown.");
      return;
    }
    if (selectedFile.size > 4 * 1024 * 1024) {
      setError("Ukuran file maksimal 4 MB.");
      return;
    }

    setIsUploading(true);
    setError("");
    setProgress(15);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Simulate step-by-step progress
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 300);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      const data = await res.json();
      if (res.ok) {
        if (data.success) {
          setProgress(100);
          setSuccess(true);
          addNotification("Upload Berhasil", `Dokumen ${selectedFile.name} berhasil diunggah.`, "upload");
          setTimeout(() => {
            onUploadSuccess(data.source);
            onClose();
            // Reset state
            setSelectedFile(null);
            setSuccess(false);
            setProgress(0);
          }, 1200);
        } else {
          setError(data.error || "Failed to upload file");
        }
      } else {
        setError(data.error || "Upload gagal. Silakan coba lagi.");
      }
    } catch (err) {
      setError("An unexpected error occurred while uploading.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-200 p-4">
      <Card className="w-full max-w-lg bg-card border-border shadow-2xl rounded-3xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-primary dark:text-blue-400 shadow-md mb-4">
            <Laptop className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-extrabold text-foreground tracking-tight">
            Upload Documents From Laptop
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Directly connect to your local files. Upload syllabi, lecture slides, or reading notes for AI parsing.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 py-4">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50 border border-green-200 dark:border-green-800 text-success dark:text-green-400 shadow-inner animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <p className="text-lg font-bold text-foreground">Upload Complete!</p>
              <p className="text-xs text-muted-foreground">AI has extracted key concepts and synced with priority engine.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="rounded-xl border border-danger/40 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-danger dark:text-red-400 font-semibold flex items-center gap-2 shadow-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.txt,.md"
                onChange={handleFileChange}
                className="hidden"
                id="laptop-direct-upload"
              />

              {/* Drag and drop area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                  selectedFile
                    ? "border-primary bg-primary-50/20 dark:bg-blue-950/20"
                    : "border-border bg-accent/40 hover:bg-accent/60"
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card border border-border text-primary dark:text-blue-400 mb-4 shadow-sm">
                  {selectedFile ? <FileText className="h-6 w-6 text-primary" /> : <Upload className="h-6 w-6" />}
                </div>
                {selectedFile ? (
                  <>
                    <p className="text-sm font-bold text-foreground truncate max-w-[280px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-foreground">Click to browse laptop files or drag & drop</p>
                    <p className="text-xs text-muted-foreground mt-1">Mendukung PDF, TXT, dan Markdown (maks. 4 MB)</p>
                  </>
                )}
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>Uploading & Parsing with AI…</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-accent rounded-full overflow-hidden border border-border">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-sky transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isUploading}
                  className="h-10 px-5 rounded-xl bg-card hover:bg-accent border-border text-foreground font-semibold shadow-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="h-10 px-6 rounded-xl bg-gradient-to-r from-primary to-sky hover:from-primary-dark hover:to-primary text-white font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] gap-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" /> Upload Document
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-8 py-4 bg-accent/30 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <span>🔒 Secured Local Laptop Connection</span>
          <span>Automatic AI Knowledge Base Sync</span>
        </CardFooter>
      </Card>
    </div>
  );
}
