import { afterEach, describe, expect, it } from "vitest";
import {
  getRevalidateSecret,
  getServiceRoleKey,
  getSiteUrl,
  getSupabaseConfig,
  getSupabaseUrl,
} from "@/lib/env";

const MANAGED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "REVALIDATE_SECRET",
  "NEXT_PUBLIC_SITE_URL",
] as const;

const original = Object.fromEntries(MANAGED.map((name) => [name, process.env[name]]));

afterEach(() => {
  for (const name of MANAGED) {
    if (original[name] === undefined) delete process.env[name];
    else process.env[name] = original[name];
  }
});

describe("env", () => {
  it("throws with the variable name when a required value is missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    expect(() => getSupabaseUrl()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("returns null config when Supabase is not configured", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(getSupabaseConfig()).toBeNull();
  });

  it("returns config when both public values exist", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    expect(getSupabaseConfig()).toEqual({
      url: "https://example.supabase.co",
      anonKey: "anon-key",
    });
  });

  it("keeps server-only secrets required", () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => getServiceRoleKey()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it("falls back to localhost for the site URL", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getSiteUrl()).toBe("http://localhost:3000");

    process.env.NEXT_PUBLIC_SITE_URL = "https://portfolio.example.com";
    expect(getSiteUrl()).toBe("https://portfolio.example.com");
  });

  it("does not treat blank values as configured", () => {
    process.env.REVALIDATE_SECRET = "   ";

    expect(getRevalidateSecret()).toBeNull();

    process.env.REVALIDATE_SECRET = "s3cret";
    expect(getRevalidateSecret()).toBe("s3cret");
  });
});
