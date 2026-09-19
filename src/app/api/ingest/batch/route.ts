import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { BatchIngestSchema } from "@/lib/validation/ingest-schema";
import { computeAndPersistRiskScore, fetchWindow } from "@/lib/risk/compute";
import { TREND_WINDOW_MS } from "@/lib/risk/thresholds";

/**
 * Defensive route-segment override (RESEARCH.md Pitfall 4) regardless of
 * the ambient Vercel Fluid Compute default — D-28's uncapped backfill
 * rescore should never be starved by an unconfirmed platform timeout.
 */
export const maxDuration = 60;

/**
 * POST /api/ingest/batch — buffered offline readings from an ESP32 device,
 * synced after connectivity returns (D-27 through D-37).
 *
 * Mirrors src/app/api/ingest/route.ts's auth-before-validate ordering
 * (D-05, D-10, D-31), extended with: all-or-nothing array validation
 * (D-35), ascending sort + JS-level pre-dedup (D-29, Pitfall 1), a single
 * bulk upsert-ignore-duplicates call (D-36), sequential scoring of
 * newly-inserted rows, and a backfill-rescore pass over every existing
 * reading whose 12h trend window overlaps the batch's new-data range
 * (D-27/D-28).
 */
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json(
      { error: "Invalid or missing API key" },
      { status: 401 }
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid payload", details: [{ message: "Body is not valid JSON" }] },
      { status: 400 }
    );
  }

  const bodyDeviceId =
    raw && typeof raw === "object" && "deviceId" in raw
      ? String((raw as Record<string, unknown>).deviceId ?? "")
      : "";

  const { data: device } = await supabaseAdmin
    .from("devices")
    .select("device_id")
    .eq("device_id", bodyDeviceId)
    .eq("api_key", apiKey)
    .maybeSingle();

  if (!device) {
    return NextResponse.json(
      { error: "Invalid or missing API key" },
      { status: 401 }
    );
  }

  const parsed = BatchIngestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.issues },
      { status: 400 }
    );
  }

  // D-29: sort ascending by timestamp before insert/score, mirroring how
  // these readings would have been scored had they arrived live.
  const sorted = [...parsed.data.readings].sort((a, b) => a.timestamp - b.timestamp);

  // Pitfall 1 mitigation: dedupe in-batch duplicate timestamps in JS
  // before the single bulk upsert call, sidestepping the disputed
  // ON CONFLICT DO NOTHING same-statement-duplicate ambiguity. Map.set
  // overwrite keeps the last occurrence's exact submitted values verbatim
  // — never averaging or blending two entries sharing a timestamp.
  const dedupMap = new Map<number, (typeof sorted)[number]>();
  for (const r of sorted) dedupMap.set(r.timestamp, r);

  const rowsToInsert = Array.from(dedupMap.values()).map((r) => ({
    deviceId: parsed.data.deviceId,
    timestamp: r.timestamp,
    heartRate: r.vitals.heartRate,
    spo2: r.vitals.spo2,
    temperature: r.vitals.temperature,
    activityScore: r.vitals.activityScore,
  }));

  // D-36: one bulk upsert call, not a loop of per-row inserts.
  const { data: insertedRows, error: upsertError } = await supabaseAdmin
    .from("readings")
    .upsert(rowsToInsert, { onConflict: "deviceId,timestamp", ignoreDuplicates: true })
    .select("id, deviceId, timestamp, heartRate, temperature, activityScore");

  if (upsertError) {
    return NextResponse.json(
      { error: "Failed to store batch" },
      { status: 500 }
    );
  }

  // Never trust upsert response row order as insertion order — re-sort.
  const newlyInserted = (insertedRows ?? []).sort((a, b) => a.timestamp - b.timestamp);

  // D-34/D-37: only newly-inserted rows are scored here — a duplicate-skip
  // retry gets no initial score in this loop (it never appears in
  // `newlyInserted`), but is picked up and idempotently re-scored by the
  // backfill pass below, since its timestamp always falls within the
  // batch's own [batchMin, batchMax] range.
  //
  // Track SUCCESSES here, not attempts — a row whose initial scoring
  // throws must still be picked up by the backfill pass below (its own
  // timestamp always falls inside [batchMin, batchMax + TREND_WINDOW_MS],
  // so it's always present in `affected`). Excluding it by attempt alone
  // would silently leave it with no risk_scores row and no retry path,
  // defeating the offline-resilience guarantee this endpoint exists for.
  const successfullyScoredIds = new Set<number>();
  for (const row of newlyInserted) {
    try {
      await computeAndPersistRiskScore(row);
      successfullyScoredIds.add(row.id);
    } catch (scoringError) {
      console.error("Risk scoring failed for reading", row.id, scoringError);
    }
  }

  // D-27/D-28: rescore every existing, already-scored reading whose 12h
  // trend window overlaps the batch's new-data range — computed from the
  // FULL validated batch, not just the newly-inserted subset.
  const batchMin = Math.min(...parsed.data.readings.map((r) => r.timestamp));
  const batchMax = Math.max(...parsed.data.readings.map((r) => r.timestamp));

  const affected = await fetchWindow(
    parsed.data.deviceId,
    batchMin,
    batchMax + TREND_WINDOW_MS
  );

  for (const row of affected) {
    if (successfullyScoredIds.has(row.id)) continue;
    try {
      // fetchWindow's WindowRow lacks deviceId — single-device batch makes
      // attaching the batch's own deviceId always correct.
      await computeAndPersistRiskScore({ ...row, deviceId: parsed.data.deviceId });
    } catch (err) {
      console.error("Backfill rescore failed for reading", row.id, err);
    }
  }

  // D-37: return 201 regardless of any scoring/backfill outcome — a
  // scoring exception never turns an otherwise-successful batch storage
  // into a failed HTTP response.
  return NextResponse.json({ status: "ok" }, { status: 201 });
}
