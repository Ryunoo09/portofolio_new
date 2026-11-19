/**
 * Single entry point for environment variables.
 * Reading process.env anywhere else under src/ is blocked by ESLint.
 * Variables are read lazily so builds and pages still work without Supabase (R5 fallback).
 */

function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

function require(name: string): string {
  const value = read(name);
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export function getSupabaseUrl(): string {
  return require("NEXT_PUBLIC_SUPABASE_URL");
}

/**
 * Project URL without requiring the anon key: public Storage objects need only
 * the host, and `next/image` needs it at build time. Null when unset.
 */
export function getSupabaseUrlOrNull(): string | null {
  return read("NEXT_PUBLIC_SUPABASE_URL") ?? null;
}

export function getSupabaseAnonKey(): string {
  return require("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

/** Null when Supabase is not configured, so callers can fall back to content/*.json. */
export function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const url = read("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = read("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return url && anonKey ? { url, anonKey } : null;
}

export function getServiceRoleKey(): string {
  return require("SUPABASE_SERVICE_ROLE_KEY");
}

export function getRevalidateSecret(): string {
  return require("REVALIDATE_SECRET");
}

export function getSiteUrl(): string {
  return read("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000";
}
