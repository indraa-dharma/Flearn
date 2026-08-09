import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

// ── Security Headers ────────────────────────────────────────
// Applied to ALL routes via the /:path* source pattern.
const securityHeaders = [
  // 1. Anti-Clickjacking: Prevents the site from being embedded in <iframe>
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // 2. Anti-MIME-Sniffing: Forces browser to trust the declared Content-Type
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // 3. HSTS: Forces HTTPS-only connections for 2 years (includeSubDomains)
  //    Only effective in production (browsers ignore it on localhost)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // 4. Referrer Policy: Controls how much URL info is sent to external sites
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // 5. Permissions Policy: Disables unused browser APIs (camera, mic, etc.)
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // 6. XSS Protection: Legacy fallback for older browsers
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Project root for Turbopack (silences "multiple lockfiles" warning)
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },

  // Hide "X-Powered-By: Next.js" header (reduces info leakage)
  poweredByHeader: false,

  // Inject security headers on every response
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
