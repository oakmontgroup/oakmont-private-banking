const SUPABASE_URL = "https://ppgfxdxwsbetdnqwkajd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_rYMwJeR07pvLc68CbFMk9A_dZe9ERqs";

if (!window.supabase) {
  throw new Error("Supabase library failed to load.");
}

if (
  SUPABASE_URL.includes("YOUR_") ||
  SUPABASE_PUBLISHABLE_KEY.includes("YOUR_")
) {
  throw new Error("Supabase configuration is incomplete.");
}

window.oakmontSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
