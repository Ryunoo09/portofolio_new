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

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: imageHost
      ? [{ ...imageHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default nextConfig;
