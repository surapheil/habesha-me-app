import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your project values.");
}

// Two clients with separate sessions, so the field app and the admin dashboard can be signed in independently.
const options = (storageKey) => ({
  auth: { storageKey, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});
export const fieldClient = createClient(url, key, options("habesha-field-session"));
export const adminClient = createClient(url, key, options("habesha-admin-session"));