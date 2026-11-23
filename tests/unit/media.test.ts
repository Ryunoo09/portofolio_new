import { afterEach, describe, expect, it, vi } from "vitest";
import { mediaUrl } from "@/lib/media";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("mediaUrl", () => {
  it("builds a public Supabase storage URL when configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");

    expect(mediaUrl("covers/one.webp")).toBe(
      "https://example.supabase.co/storage/v1/object/public/media/covers/one.webp",
    );
  });

  it("needs only the project URL, and tolerates a trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co/");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    expect(mediaUrl("covers/one.webp")).toBe(
      "https://example.supabase.co/storage/v1/object/public/media/covers/one.webp",
    );
  });

  it("drops traversal segments so a stored path cannot leave the bucket", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");

    expect(mediaUrl("../../../rest/v1/projects")).toBe(
      "https://example.supabase.co/storage/v1/object/public/media/rest/v1/projects",
    );
  });

  it("serves from public/ when Supabase is not configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");

    expect(mediaUrl("/covers/one.webp")).toBe("/covers/one.webp");
  });
});
