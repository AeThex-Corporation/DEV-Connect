import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!url) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL or VITE_SUPABASE_URL env var.",
    );
  }

  const serviceRole = process.env.SUPABASE_SERVICE_ROLE;
  const anonKey =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  const key = serviceRole || anonKey;
  if (!key) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_SERVICE_ROLE or VITE_SUPABASE_ANON_KEY env var.",
    );
  }

  if (!serviceRole) {
    // eslint-disable-next-line no-console
    console.warn(
      "Supabase service role key missing; initializing client with anon key (limited permissions).",
    );
  }

  client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}
