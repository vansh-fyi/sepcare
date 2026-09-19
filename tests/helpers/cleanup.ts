import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Deletes a test-inserted reading by its exact timestamp, so repeated test
 * runs against the shared live Supabase project never accumulate residue.
 */
export async function deleteReadingByTimestamp(timestamp: number) {
  await supabaseAdmin.from("readings").delete().eq("timestamp", timestamp);
}

/**
 * Deletes every test-inserted reading for `deviceId` within
 * `[fromTimestamp, toTimestamp]` (inclusive), so batch-sync tests that
 * insert many timestamps at once can clean up with a single call instead
 * of looping over `deleteReadingByTimestamp`.
 */
export async function deleteReadingsInRange(
  deviceId: string,
  fromTimestamp: number,
  toTimestamp: number
) {
  await supabaseAdmin
    .from("readings")
    .delete()
    .eq("deviceId", deviceId)
    .gte("timestamp", fromTimestamp)
    .lte("timestamp", toTimestamp);
}
