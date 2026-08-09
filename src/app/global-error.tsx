"use client";

import React from "react";

// Catches errors that happen in the root layout itself (above the normal
// error boundary). Must render its own <html> and <body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0f172a", color: "#e2e8f0" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div style={{ maxWidth: "420px", width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: "16px", padding: "2rem", textAlign: "center" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>FLearn AI</h1>
            <p style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "1.5rem" }}>
              Terjadi kesalahan fatal saat memuat aplikasi. Coba reload halaman.
            </p>
            {process.env.NODE_ENV === "development" && (
              <pre style={{ textAlign: "left", fontSize: "11px", background: "#0f172a", padding: "0.75rem", borderRadius: "8px", overflow: "auto", maxHeight: "120px", margin: "0 0 1rem" }}>
                {error?.message || "Unknown error"}
              </pre>
            )}
            <button
              onClick={reset}
              style={{
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "0.625rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Coba lagi
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
