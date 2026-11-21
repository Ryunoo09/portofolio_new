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
