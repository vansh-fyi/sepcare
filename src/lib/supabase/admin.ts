import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — server-only.
 *
 * This module must NEVER be imported by any file carrying a "use client"
 * directive (directly or transitively). Doing so would leak
 * SUPABASE_SERVICE_ROLE_KEY into the client bundle.
 *
 * Only this module constructs a service-role client. It bypasses Row Level
 * Security entirely, so it is the sole place device-credential checks and
 * writes to `devices` / `readings` are allowed to happen.
 */
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
