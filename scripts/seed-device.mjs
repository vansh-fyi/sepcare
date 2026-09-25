// One-time seed script for the single v1 device (D-06).
// Run with: node scripts/seed-device.mjs
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment
// (loaded from .env.local by Next.js at runtime, or export them manually
// before running this script directly).
import { randomBytes } from "node:crypto";
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

const DEVICE_ID = "nb-001";
const apiKey = randomBytes(32).toString("hex");

const { error } = await supabaseAdmin
  .from("devices")
  .insert({ device_id: DEVICE_ID, api_key: apiKey });

if (error) {
  console.error("Failed to seed device:", error.message);
  process.exit(1);
}

console.log(`Seeded device ${DEVICE_ID}.`);
console.log(`DEVICE_API_KEY=${apiKey}`);
