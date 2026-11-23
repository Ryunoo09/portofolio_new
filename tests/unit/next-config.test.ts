import { afterEach, describe, expect, it, vi } from "vitest";

/** next.config reads env at import, so each case needs a fresh module. */
async function loadConfig() {
  vi.resetModules();
  return (await import("../../next.config")).default;
}

describe("next/image allow-list", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("pins the Supabase host read from the build env", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");

    const config = await loadConfig();

    expect(config.images?.remotePatterns).toEqual([
      { protocol: "https", hostname: "abc.supabase.co", pathname: "/storage/v1/object/public/**" },
    ]);
  });

  it("falls back to any Supabase host when the build arg is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");

    const config = await loadConfig();

    expect(config.images?.remotePatterns).toEqual([
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ]);
  });
});

describe("response security headers", () => {
  it("sends HSTS, CSP, and the browser hardening headers on every path", async () => {
    const config = await loadConfig();
    const groups = await config.headers!();
    const sent = Object.fromEntries(groups[0].headers.map((h) => [h.key, h.value]));

    expect(groups[0].source).toBe("/:path*");
    expect(sent["Strict-Transport-Security"]).toContain("max-age=31536000");
    expect(sent["X-Content-Type-Options"]).toBe("nosniff");
    expect(sent["X-Frame-Options"]).toBe("DENY");
    expect(sent["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(sent["Content-Security-Policy"]).toContain("object-src 'none'");
    expect(sent["Content-Security-Policy"]).toContain("connect-src 'self'");
    expect(sent["Content-Security-Policy"]).not.toContain("*.supabase.co; connect");
  });

  it("hides the framework version", async () => {
    const config = await loadConfig();

    expect(config.poweredByHeader).toBe(false);
  });
});
