import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServiceRoleKey, getSupabaseAnonKey, getSupabaseConfig, getSupabaseUrl } from "./env";

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

/**
 * Service-role client. Server/scripts only — bypasses RLS.
 * Never import this from client components or route it into the browser bundle.
 */
export function getSupabaseAdmin(): SupabaseClient {
  return createClient(getSupabaseUrl(), getServiceRoleKey(), {
    auth: { persistSession: false },
  });
}
