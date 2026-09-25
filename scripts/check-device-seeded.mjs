// Verifies the single v1 device row exists. Run with:
//   node scripts/check-device-seeded.mjs
// Prints the device_id on success, or "missing" with a non-zero exit.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment."
  );
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data, error } = await supabaseAdmin
  .from("devices")
  .select("device_id")
  .eq("device_id", "nb-001")
  .maybeSingle();

if (error || !data) {
  console.log("missing");
  process.exit(1);
}

console.log(data.device_id);
