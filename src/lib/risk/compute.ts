import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  TEMP_FEVER_C,
  TEMP_HYPOTHERMIA_C,
  HR_TEMP_RATIO_MIN,
  HR_TEMP_RATIO_MAX,
  MIN_DELTA_TEMP_C,
  ACTIVITY_DECLINE_RATIO,
  TREND_WINDOW_MS,
  BASELINE_MIN_MS,
} from "@/lib/risk/thresholds";

/**
 * D-25: standalone, importable risk-computation engine — not inlined in
 * the ingest route handler, so Phase 3's batch-sync path can call the
 * identical function on batch-inserted (possibly out-of-order) readings.
 *
 * This is a screening triage aid (per
 * context/implementation-plans/neonatal-sepsis-armband.md §10), never a
 * diagnostic clearance — a "green" or "amber" status here means "nothing
 * confirmed abnormal by this composite rule set yet," not "the infant is
 * definitely fine" (STOR-02).
 */

/** The reading a risk score is computed for. */
export interface TargetReading {
  id: number;
  deviceId: string;
  timestamp: number;
  heartRate: number;
  temperature: number;
  activityScore: number;
}

/**
 * Per-feature breakdown persisted alongside the final status (D-22) — raw
 * abnormal/trending booleans plus the driving values, for explainability.
 */
export interface RiskBreakdown {
  temperature: { abnormal: boolean; value: number };
  hrTempProportionality: { abnormal: boolean; ratio: number | null };
  activityTrend: { trending: boolean; delta: number | null };
}

export interface WindowRow {
  id: number;
  timestamp: number;
  heartRate: number;
  temperature: number;
  activityScore: number;
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * PostgREST (via `supabase/config.toml`'s `api.max_rows`) caps any single
 * response at 1000 rows regardless of how the query is shaped — a plain
 * unpaginated select silently truncates to the oldest 1000 in-window rows
 * once a device's 12h window exceeds that count, corrupting the personal
 * baseline with no error raised. Page through the full window with
 * `.range()` instead of trusting a single response to be complete.
 */
const WINDOW_PAGE_SIZE = 1000;

/**
 * Fetches every `readings` row for `deviceId` within
 * `[fromTimestamp, toTimestamp]`, paginating past PostgREST's `max_rows`
 * cap so a high-frequency device's rolling window is never silently
 * truncated (see WINDOW_PAGE_SIZE).
 */
export async function fetchWindow(
  deviceId: string,
  fromTimestamp: number,
  toTimestamp: number
): Promise<WindowRow[]> {
  const rows: WindowRow[] = [];
  let from = 0;

  for (;;) {
    const to = from + WINDOW_PAGE_SIZE - 1;
    const { data: page, error } = await supabaseAdmin
      .from("readings")
      .select("id, timestamp, heartRate, temperature, activityScore")
      .eq("deviceId", deviceId)
      .lte("timestamp", toTimestamp)
      .gte("timestamp", fromTimestamp)
      .order("timestamp", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to);

    if (error) throw error;

    const pageRows = (page ?? []) as WindowRow[];
    rows.push(...pageRows);

    if (pageRows.length < WINDOW_PAGE_SIZE) break;
    from += WINDOW_PAGE_SIZE;
  }

  return rows;
}

/**
 * Computes a Green/Amber/Red risk status for `target` from its device's
 * own rolling history and persists the result to `risk_scores`.
 *
 * D-26: the window is always relative to `target.timestamp`
 * (`timestamp <= target.timestamp AND timestamp >= target.timestamp - 12h`),
 * never "the N most-recently-inserted rows" — required for correctness
 * under Phase 3's future out-of-order batch inserts. This also means the
 * window never reads a row whose timestamp is after target.timestamp
 * (prohibition P1).
 *
 * D-12: status derives purely from the COUNT of abnormal/trending
 * features — 0 or 1 -> green, exactly 2 -> amber, all 3 -> red. The
 * magnitude/severity of any single abnormal feature never independently
 * escalates status (prohibition P2).
 */
export async function computeAndPersistRiskScore(
  target: TargetReading
): Promise<{ status: "green" | "amber" | "red"; breakdown: RiskBreakdown }> {
  const rows = await fetchWindow(
    target.deviceId,
    target.timestamp - TREND_WINDOW_MS,
    target.timestamp
  );

  // D-18: baseline is established once the window's earliest reading is
  // at least BASELINE_MIN_MS older than the target. When the window is
  // empty (a device's very first-ever reading), earliest falls back to
  // target.timestamp itself, so the gap is 0 and baselineEstablished is
  // false — no error, cold-start-safe.
  const earliest = rows[0]?.timestamp ?? target.timestamp;
  const baselineEstablished = target.timestamp - earliest >= BASELINE_MIN_MS;

  // Prior history excludes the target reading itself, even under
  // duplicate timestamps (tie-broken by strictly smaller id).
  const prior = rows.filter(
    (row) =>
      row.timestamp < target.timestamp ||
      (row.timestamp === target.timestamp && row.id < target.id)
  );

  // D-13: temperature abnormality is absolute — no baseline required,
  // active from reading #1. Asymmetric >=/< boundary.
  const temperatureAbnormal =
    target.temperature >= TEMP_FEVER_C || target.temperature < TEMP_HYPOTHERMIA_C;

  let hrTempRatio: number | null = null;
  let hrTempAbnormal = false;
  let activityDelta: number | null = null;
  let activityTrending = false;

  if (baselineEstablished && prior.length > 0) {
    const baselineHR = mean(prior.map((row) => row.heartRate));
    const baselineTemp = mean(prior.map((row) => row.temperature));
    const deltaTemp = target.temperature - baselineTemp;
    const deltaHR = target.heartRate - baselineHR;

    if (Math.abs(deltaTemp) >= MIN_DELTA_TEMP_C) {
      hrTempRatio = deltaHR / deltaTemp;
      hrTempAbnormal =
        hrTempRatio < HR_TEMP_RATIO_MIN || hrTempRatio > HR_TEMP_RATIO_MAX;
    }

    const baselineActivity = mean(prior.map((row) => row.activityScore));
    if (baselineActivity > 0) {
      activityDelta = target.activityScore - baselineActivity;
      activityTrending =
        target.activityScore <= baselineActivity * ACTIVITY_DECLINE_RATIO;
    }
  }

  const breakdown: RiskBreakdown = {
    temperature: { abnormal: temperatureAbnormal, value: target.temperature },
    hrTempProportionality: { abnormal: hrTempAbnormal, ratio: hrTempRatio },
    activityTrend: { trending: activityTrending, delta: activityDelta },
  };

  const abnormalCount =
    Number(temperatureAbnormal) + Number(hrTempAbnormal) + Number(activityTrending);

  const status: "green" | "amber" | "red" =
    abnormalCount >= 3 ? "red" : abnormalCount === 2 ? "amber" : "green";

  const { error: upsertError } = await supabaseAdmin.from("risk_scores").upsert({
    reading_id: target.id,
    deviceId: target.deviceId,
    status,
    breakdown,
  });

  if (upsertError) throw upsertError;

  return { status, breakdown };
}
