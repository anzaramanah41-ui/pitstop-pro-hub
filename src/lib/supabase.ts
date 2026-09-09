import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

/** Lazily creates the project's Supabase client from Vite environment variables. */
export function supabase(): SupabaseClient {
  if (client) return client;
  const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  const anonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;
  if (!url || !anonKey)
    throw new Error(
      "Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.",
    );
  client = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

export type AppRole = "admin" | "pelanggan" | "owner";
export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: AppRole;
  id_bengkel?: string | null;
};

