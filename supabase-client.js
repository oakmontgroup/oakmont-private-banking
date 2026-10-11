const SUPABASE_URL = https://ppgfxdxwsbetdnqwkajd.supabase.co
const SUPABASE_PUBLISHABLE_KEY = sb_publishable_rYMwJeR07pvLc68CbFMk9A_dZe9ERqs
if (
  SUPABASE_URL.includes("PASTE_") ||
  SUPABASE_PUBLISHABLE_KEY.includes("PASTE_")
) {
  throw new Error(
    "Please configure the Supabase project URL and publishable key."
  );
}

const oakmontSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
