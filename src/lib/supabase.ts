import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseConfig, getSupabaseUrl } from "./env";

let publicClient: SupabaseClient | null = null;

/** Read-only client (anon key, RLS enforced). Use for build/ISR data reads. */
export function getSupabaseClient(): SupabaseClient {
  if (!publicClient) {
    publicClient = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: { persistSession: false },
    });
  }
  return publicClient;
}

export function hasSupabaseConfig(): boolean {
  return getSupabaseConfig() !== null;
}
