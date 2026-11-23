import type { NextConfig } from "next";

/**
 * Media is served from Supabase Storage, so next/image needs that host allow-listed.
 * A malformed value must not break the build (R5: missing config falls back to
 * content/*.json), so anything that is not a usable http(s) URL is ignored.
 * Read here rather than via src/lib/env.ts because config runs before the app.
 */
function supabaseImageHost(): { protocol: "http" | "https"; hostname: string } | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;

  try {
    const url = new URL(raw);
    const protocol = url.protocol === "http:" ? "http" : url.protocol === "https:" ? "https" : null;

    return protocol ? { protocol, hostname: url.hostname } : null;
  } catch {
    return null;
  }
}

const imageHost = supabaseImageHost();

/** Public Storage objects live at this path on any Supabase project. */
const STORAGE_PATH = "/storage/v1/object/public/**";

/**
 * Security headers live here, not only in the proxy: an `add_header` in the
 * proxy's `location` block cancels the server-level block, which is why the
 * 2026-11-23 audit saw none of them live (docker/npm.conf used to hold them).
 * `connect-src` stays 'self': Supabase is queried server-side only, so the
 * browser never needs it. Dev keeps a websocket origin for HMR.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.supabase.co",
  "media-src 'self' https://*.supabase.co",
  "font-src 'self' data:",
  process.env.NODE_ENV === "production" ? "connect-src 'self'" : "connect-src 'self' ws: wss:",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    remotePatterns: imageHost
      ? [{ ...imageHost, pathname: STORAGE_PATH }]
      : // No URL at build time (a missing build arg). Accept Supabase Storage so
        // an ISR page rendered with the runtime env is not left with broken
        // covers; with the URL set, the exact host is pinned instead.
        [{ protocol: "https", hostname: "*.supabase.co", pathname: STORAGE_PATH }],
  },
};

export default nextConfig;
