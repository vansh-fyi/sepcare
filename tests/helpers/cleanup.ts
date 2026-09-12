import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Deletes a test-inserted reading by its exact timestamp, so repeated test
 * runs against the shared live Supabase project never accumulate residue.
 */
export async function deleteReadingByTimestamp(timestamp: number) {
  await supabaseAdmin.from("readings").delete().eq("timestamp", timestamp);
}
