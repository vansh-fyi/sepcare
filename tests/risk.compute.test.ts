import { describe, it, expect, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/ingest/route";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { computeAndPersistRiskScore } from "@/lib/risk/compute";
import { TREND_WINDOW_MS } from "@/lib/risk/thresholds";
import { deleteReadingByTimestamp } from "./helpers/cleanup";

const DEVICE_ID = "nb-001";
const VALID_KEY = process.env.DEVICE_API_KEY!;
const DAY_MS = 24 * 60 * 60 * 1000;

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/ingest", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

type InsertedReadingRow = {
  id: number;
  deviceId: string;
  timestamp: number;
  heartRate: number;
  temperature: number;
  activityScore: number;
};

/**
 * Inserts a synthetic reading directly via supabaseAdmin (not through the
 * route), for full control over historical spacing when building test
 * histories.
 */
async function insertReading(row: {
  timestamp: number;
  heartRate: number;
  temperature: number;
  activityScore: number;
  deviceId?: string;
}): Promise<InsertedReadingRow> {
  const { data, error } = await supabaseAdmin
    .from("readings")
    .insert({
      deviceId: row.deviceId ?? DEVICE_ID,
      timestamp: row.timestamp,
      heartRate: row.heartRate,
      spo2: 98,
      temperature: row.temperature,
      activityScore: row.activityScore,
    })
    .select("id, deviceId, timestamp, heartRate, temperature, activityScore")
    .single();

  if (error || !data) {
    throw error ?? new Error("insertReading: no data returned");
  }
  return data as InsertedReadingRow;
}

describe("computeAndPersistRiskScore — core behaviors (Task 1)", () => {
  const insertedTimestamps: number[] = [];

  afterEach(async () => {
    while (insertedTimestamps.length) {
      const ts = insertedTimestamps.pop()!;
      await deleteReadingByTimestamp(ts); // cascades to risk_scores via ON DELETE CASCADE
    }
  });

  it("persists green with all 3 breakdown sub-objects non-abnormal for a fresh device history + normal reading", async () => {
    const timestamp = Date.now() + 100 * DAY_MS;
    insertedTimestamps.push(timestamp);

    const target = await insertReading({
      timestamp,
      heartRate: 130,
      temperature: 36.9,
      activityScore: 5,
    });

    const result = await computeAndPersistRiskScore(target);

    expect(result.status).toBe("green");
    expect(result.breakdown.temperature.abnormal).toBe(false);
    expect(result.breakdown.hrTempProportionality.abnormal).toBe(false);
    expect(result.breakdown.activityTrend.trending).toBe(false);

    const { data, error } = await supabaseAdmin
      .from("risk_scores")
      .select("status, breakdown")
      .eq("reading_id", target.id)
      .maybeSingle();

    expect(error).toBeNull();
    expect(data?.status).toBe("green");
  });

  it("keeps status green for a single fever reading (temp 38.5) with no other abnormal signal — count=1, D-12", async () => {
    const timestamp = Date.now() + 101 * DAY_MS;
    insertedTimestamps.push(timestamp);

    const target = await insertReading({
      timestamp,
      heartRate: 130,
      temperature: 38.5,
      activityScore: 5,
    });

    const result = await computeAndPersistRiskScore(target);

    expect(result.status).toBe("green");
    expect(result.breakdown.temperature.abnormal).toBe(true);
    expect(result.breakdown.hrTempProportionality.abnormal).toBe(false);
    expect(result.breakdown.activityTrend.trending).toBe(false);
  });

  it("scores a POST /api/ingest reading automatically — a risk_scores row exists immediately after the response returns (RISK-03)", async () => {
    const timestamp = Date.now() + 102 * DAY_MS;
    insertedTimestamps.push(timestamp);

    const payload = {
      deviceId: DEVICE_ID,
      timestamp,
      vitals: { heartRate: 132, spo2: 98, temperature: 36.8, activityScore: 4 },
    };

    const res = await POST(makeRequest(payload, { "x-api-key": VALID_KEY }));
    expect(res.status).toBe(201);

    const { data: reading } = await supabaseAdmin
      .from("readings")
      .select("id")
      .eq("timestamp", timestamp)
      .maybeSingle();

    expect(reading).not.toBeNull();

    const { data: riskScore, error } = await supabaseAdmin
      .from("risk_scores")
      .select("status, breakdown")
      .eq("reading_id", reading!.id)
      .maybeSingle();

    expect(error).toBeNull();
    expect(riskScore).not.toBeNull();
    expect(riskScore?.status).toBe("green");
  });
});

describe("computeAndPersistRiskScore — temperature boundary (D-13 asymmetric >=/< , Task 2)", () => {
  const insertedTimestamps: number[] = [];

  afterEach(async () => {
    while (insertedTimestamps.length) {
      const ts = insertedTimestamps.pop()!;
      await deleteReadingByTimestamp(ts);
    }
  });

  it.each([
    { temp: 38.0, expected: true, dayOffset: 200, label: "38.0 (fever threshold, inclusive) -> abnormal" },
    { temp: 37.99, expected: false, dayOffset: 201, label: "37.99 -> not abnormal" },
    { temp: 35.5, expected: false, dayOffset: 202, label: "35.5 (hypothermia threshold, exclusive) -> NOT abnormal" },
    { temp: 35.49, expected: true, dayOffset: 203, label: "35.49 -> abnormal" },
  ])("$label", async ({ temp, expected, dayOffset }) => {
    const timestamp = Date.now() + dayOffset * DAY_MS;
    insertedTimestamps.push(timestamp);

    const target = await insertReading({
      timestamp,
      heartRate: 130,
      temperature: temp,
      activityScore: 5,
    });

    const result = await computeAndPersistRiskScore(target);
    expect(result.breakdown.temperature.abnormal).toBe(expected);
  });
});

describe("computeAndPersistRiskScore — HR/temp proportionality boundary (Liebermeister band [6,14], Task 2)", () => {
  const insertedTimestamps: number[] = [];

  afterEach(async () => {
    while (insertedTimestamps.length) {
      const ts = insertedTimestamps.pop()!;
      await deleteReadingByTimestamp(ts);
    }
  });

  it.each([
    { deltaHR: 3.0, expected: false, dayOffset: 204, label: "ratio 6 (inclusive lower bound) -> not abnormal" },
    { deltaHR: 7.0, expected: false, dayOffset: 205, label: "ratio 14 (inclusive upper bound) -> not abnormal" },
    { deltaHR: 2.995, expected: true, dayOffset: 206, label: "ratio 5.99 -> abnormal" },
    { deltaHR: 7.005, expected: true, dayOffset: 207, label: "ratio 14.01 -> abnormal" },
  ])("$label", async ({ deltaHR, expected, dayOffset }) => {
    const baselineTimestamp = Date.now() + dayOffset * DAY_MS;
    const targetTimestamp = baselineTimestamp + 2 * 60 * 60 * 1000; // 2h later, baseline established (>1h)
    insertedTimestamps.push(baselineTimestamp, targetTimestamp);

    await insertReading({
      timestamp: baselineTimestamp,
      heartRate: 120,
      temperature: 36.0,
      activityScore: 5,
    });

    // deltaTemp fixed at 0.5 (not fever/hypothermia), deltaHR varied per case.
    const target = await insertReading({
      timestamp: targetTimestamp,
      heartRate: 120 + deltaHR,
      temperature: 36.5,
      activityScore: 5,
    });

    const result = await computeAndPersistRiskScore(target);
    expect(result.breakdown.hrTempProportionality.abnormal).toBe(expected);
  });
});

describe("computeAndPersistRiskScore — breadth gate + fever-vs-sepsis demo traces (D-12, Task 2)", () => {
  const insertedTimestamps: number[] = [];

  afterEach(async () => {
    while (insertedTimestamps.length) {
      const ts = insertedTimestamps.pop()!;
      await deleteReadingByTimestamp(ts);
    }
  });

  async function buildScenario(dayOffset: number, opts: {
    baselineHR: number;
    baselineTemp: number;
    baselineActivity: number;
    targetHR: number;
    targetTemp: number;
    targetActivity: number;
  }) {
    const baselineTimestamp = Date.now() + dayOffset * DAY_MS;
    const targetTimestamp = baselineTimestamp + 2 * 60 * 60 * 1000; // 2h later
    insertedTimestamps.push(baselineTimestamp, targetTimestamp);

    await insertReading({
      timestamp: baselineTimestamp,
      heartRate: opts.baselineHR,
      temperature: opts.baselineTemp,
      activityScore: opts.baselineActivity,
    });

    const target = await insertReading({
      timestamp: targetTimestamp,
      heartRate: opts.targetHR,
      temperature: opts.targetTemp,
      activityScore: opts.targetActivity,
    });

    return target;
  }

  it("'common fever' trace: isolated fever, in-band HR ratio, stable activity -> green (count=1)", async () => {
    const target = await buildScenario(208, {
      baselineHR: 120,
      baselineTemp: 36.5,
      baselineActivity: 5,
      targetHR: 136, // deltaHR=16, deltaTemp=2.0 -> ratio=8 (in [6,14])
      targetTemp: 38.5, // fever, abnormal
      targetActivity: 5, // stable, not trending
    });

    const result = await computeAndPersistRiskScore(target);
    expect(result.breakdown.temperature.abnormal).toBe(true);
    expect(result.breakdown.hrTempProportionality.abnormal).toBe(false);
    expect(result.breakdown.activityTrend.trending).toBe(false);
    expect(result.status).toBe("green");
  });

  it("'sepsis-shaped' trace: fever + proportionality break + declining activity, all within the 12h window -> red (count=3)", async () => {
    const target = await buildScenario(209, {
      baselineHR: 120,
      baselineTemp: 36.5,
      baselineActivity: 10,
      targetHR: 170, // deltaHR=50, deltaTemp=2.5 -> ratio=20 (out of band)
      targetTemp: 39.0, // fever, abnormal
      targetActivity: 5, // <= 10*0.7=7 -> declining, abnormal
    });

    const result = await computeAndPersistRiskScore(target);
    expect(result.breakdown.temperature.abnormal).toBe(true);
    expect(result.breakdown.hrTempProportionality.abnormal).toBe(true);
    expect(result.breakdown.activityTrend.trending).toBe(true);
    expect(result.status).toBe("red");
  });

  it("exactly 2 co-occurring abnormal features (temp + HR-ratio) -> amber", async () => {
    const target = await buildScenario(210, {
      baselineHR: 120,
      baselineTemp: 36.5,
      baselineActivity: 5,
      targetHR: 180, // deltaHR=60, deltaTemp=2.5 -> ratio=24 (out of band)
      targetTemp: 39.0, // fever, abnormal
      targetActivity: 5, // stable, not trending
    });

    const result = await computeAndPersistRiskScore(target);
    expect(result.status).toBe("amber");
  });

  it("0 abnormal features with an established baseline -> green", async () => {
    const target = await buildScenario(211, {
      baselineHR: 120,
      baselineTemp: 36.5,
      baselineActivity: 5,
      targetHR: 122, // deltaHR=2, deltaTemp=0.3 -> ratio~6.67 (in band)
      targetTemp: 36.8, // not fever/hypothermia
      targetActivity: 5, // stable
    });

    const result = await computeAndPersistRiskScore(target);
    expect(result.breakdown.temperature.abnormal).toBe(false);
    expect(result.breakdown.hrTempProportionality.abnormal).toBe(false);
    expect(result.breakdown.activityTrend.trending).toBe(false);
    expect(result.status).toBe("green");
  });

  it("exactly 1 abnormal feature (isolated HR-ratio break) with an established baseline -> green", async () => {
    const target = await buildScenario(212, {
      baselineHR: 120,
      baselineTemp: 36.5,
      baselineActivity: 5,
      targetHR: 122, // deltaHR=2, deltaTemp=0.1 -> ratio=20 (out of band)
      targetTemp: 36.6, // not fever/hypothermia
      targetActivity: 5, // stable
    });

    const result = await computeAndPersistRiskScore(target);
    expect(result.breakdown.temperature.abnormal).toBe(false);
    expect(result.breakdown.hrTempProportionality.abnormal).toBe(true);
    expect(result.breakdown.activityTrend.trending).toBe(false);
    expect(result.status).toBe("green");
  });
});

describe("computeAndPersistRiskScore — structural prohibitions P1/P2 (Task 2)", () => {
  const insertedTimestamps: number[] = [];

  afterEach(async () => {
    while (insertedTimestamps.length) {
      const ts = insertedTimestamps.pop()!;
      await deleteReadingByTimestamp(ts);
    }
  });

  it("P1: a reading inserted with a timestamp AFTER the target is never included in the target's computed window", async () => {
    const baselineTimestamp = Date.now() + 213 * DAY_MS;
    const targetTimestamp = baselineTimestamp + 2 * 60 * 60 * 1000;
    const futureTimestamp = targetTimestamp + 60 * 1000; // 1 minute after target
    insertedTimestamps.push(baselineTimestamp, targetTimestamp, futureTimestamp);

    await insertReading({
      timestamp: baselineTimestamp,
      heartRate: 120,
      temperature: 36.5,
      activityScore: 5,
    });

    const target = await insertReading({
      timestamp: targetTimestamp,
      heartRate: 128, // deltaHR=8, deltaTemp=1.0 -> ratio=8 (in-band [6,14])
      temperature: 37.5, // not fever/hypothermia
      activityScore: 5,
    });

    // Extreme future reading — if this were wrongly included in the window,
    // it would flip every feature abnormal.
    await insertReading({
      timestamp: futureTimestamp,
      heartRate: 300,
      temperature: 45,
      activityScore: 0,
    });

    // Direct window-read assertion (not just the final status): replicate
    // compute.ts's exact window filter and confirm the future row is absent.
    const { data: windowRows, error } = await supabaseAdmin
      .from("readings")
      .select("id, timestamp")
      .eq("deviceId", DEVICE_ID)
      .lte("timestamp", target.timestamp)
      .gte("timestamp", target.timestamp - TREND_WINDOW_MS)
      .order("timestamp", { ascending: true });

    expect(error).toBeNull();
    expect(windowRows?.some((row) => row.timestamp > target.timestamp)).toBe(false);

    const result = await computeAndPersistRiskScore(target);
    expect(result.status).toBe("green");
    expect(result.breakdown.temperature.abnormal).toBe(false);
    expect(result.breakdown.hrTempProportionality.abnormal).toBe(false);
    expect(result.breakdown.activityTrend.trending).toBe(false);
  });

  it("P2: an extreme single-feature reading (temperature 40.0) alone still resolves green — severity never bypasses the count gate", async () => {
    const timestamp = Date.now() + 214 * DAY_MS;
    insertedTimestamps.push(timestamp);

    const target = await insertReading({
      timestamp,
      heartRate: 130,
      temperature: 40.0,
      activityScore: 5,
    });

    const result = await computeAndPersistRiskScore(target);
    expect(result.breakdown.temperature.abnormal).toBe(true);
    expect(result.status).toBe("green");
  });
});

describe("computeAndPersistRiskScore — 12h window adjacency (D-26 inclusive >=, Task 2)", () => {
  const insertedTimestamps: number[] = [];

  afterEach(async () => {
    while (insertedTimestamps.length) {
      const ts = insertedTimestamps.pop()!;
      await deleteReadingByTimestamp(ts);
    }
  });

  it("a prior reading exactly TREND_WINDOW_MS old IS included; one millisecond older is excluded", async () => {
    const targetTimestamp = Date.now() + 215 * DAY_MS;
    const boundaryTimestamp = targetTimestamp - TREND_WINDOW_MS; // exactly 12h before
    const justOutsideTimestamp = boundaryTimestamp - 1; // 12h + 1ms before
    insertedTimestamps.push(targetTimestamp, boundaryTimestamp, justOutsideTimestamp);

    const boundaryRow = await insertReading({
      timestamp: boundaryTimestamp,
      heartRate: 120,
      temperature: 36.5,
      activityScore: 5,
    });
    const outsideRow = await insertReading({
      timestamp: justOutsideTimestamp,
      heartRate: 999,
      temperature: 20,
      activityScore: 999,
    });

    const target = await insertReading({
      timestamp: targetTimestamp,
      heartRate: 122,
      temperature: 36.6,
      activityScore: 5,
    });

    const { data: windowRows, error } = await supabaseAdmin
      .from("readings")
      .select("id, timestamp")
      .eq("deviceId", DEVICE_ID)
      .lte("timestamp", target.timestamp)
      .gte("timestamp", target.timestamp - TREND_WINDOW_MS)
      .order("timestamp", { ascending: true });

    expect(error).toBeNull();
    const windowIds = windowRows?.map((row) => row.id) ?? [];
    expect(windowIds).toContain(boundaryRow.id);
    expect(windowIds).not.toContain(outsideRow.id);
  });

  it("readings sharing an identical timestamp are ordered deterministically by id, and the target excludes only itself from its own baseline (not an earlier same-timestamp row)", async () => {
    const baselineTimestamp = Date.now() + 216 * DAY_MS;
    const sharedTimestamp = baselineTimestamp + 2 * 60 * 60 * 1000; // 2h later, establishes baseline
    insertedTimestamps.push(baselineTimestamp, sharedTimestamp);

    const olderRow = await insertReading({
      timestamp: baselineTimestamp,
      heartRate: 100,
      temperature: 36.0,
      activityScore: 5,
    });

    // Two rows at the exact same timestamp, inserted in sequence so the
    // identity column guarantees priorRow.id < target.id.
    const priorRow = await insertReading({
      timestamp: sharedTimestamp,
      heartRate: 100,
      temperature: 36.0,
      activityScore: 5,
    });
    const target = await insertReading({
      timestamp: sharedTimestamp,
      heartRate: 200,
      temperature: 36.2,
      activityScore: 5,
    });

    expect(priorRow.id).toBeLessThan(target.id);

    const { data: windowRows, error } = await supabaseAdmin
      .from("readings")
      .select("id, timestamp")
      .eq("deviceId", DEVICE_ID)
      .lte("timestamp", target.timestamp)
      .gte("timestamp", target.timestamp - TREND_WINDOW_MS)
      .order("timestamp", { ascending: true })
      .order("id", { ascending: true });

    expect(error).toBeNull();
    // Stable, deterministic order: olderRow first (earlier timestamp), then
    // priorRow before target (same timestamp, tie-broken by id).
    expect(windowRows?.map((row) => row.id)).toEqual([
      olderRow.id,
      priorRow.id,
      target.id,
    ]);

    // If the target reading were wrongly included in its own "prior" set
    // (tie-break bug), baselineHR would be mean(100,100,200)=133.33 and
    // ratio=(200-133.33)/0.2≈333.3. Correctly excluding the target itself
    // (only priorRow's earlier id counts as prior) gives baselineHR=100,
    // ratio=(200-100)/0.2=500 — the two behaviors are numerically distinct.
    const result = await computeAndPersistRiskScore(target);
    expect(result.breakdown.hrTempProportionality.ratio).toBeCloseTo(500, 5);
  });
});

describe("risk_scores queryable by time range through readings (STOR-02, Plan 02-03 Task 2)", () => {
  const insertedTimestamps: number[] = [];

  afterEach(async () => {
    while (insertedTimestamps.length) {
      const ts = insertedTimestamps.pop()!;
      await deleteReadingByTimestamp(ts); // cascades to risk_scores via ON DELETE CASCADE
    }
  });

  it("a PostgREST embedded-join range query filtered by readings.timestamp returns exactly the in-range readings, each carrying its own non-null nested risk_scores, in ascending timestamp order", async () => {
    const baseTimestamp = Date.now() + 217 * DAY_MS;
    const spacingMs = 2 * 60 * 60 * 1000; // ~2h apart
    const timestamps = [0, 1, 2, 3].map((offset) => baseTimestamp + offset * spacingMs);
    insertedTimestamps.push(...timestamps);

    // 4 readings, each immediately scored so every one has a linked
    // risk_scores row — a realistic multi-reading history to query over.
    for (const [index, timestamp] of timestamps.entries()) {
      const reading = await insertReading({
        timestamp,
        heartRate: 120 + index,
        temperature: 36.5 + index * 0.1,
        activityScore: 5,
      });
      await computeAndPersistRiskScore(reading);
    }

    // Bounded window covering exactly the 2nd and 3rd readings.
    const { data: rangeRows, error } = await supabaseAdmin
      .from("readings")
      .select("timestamp, risk_scores(status, breakdown)")
      .eq("deviceId", DEVICE_ID)
      .gte("timestamp", timestamps[1])
      .lte("timestamp", timestamps[2])
      .order("timestamp", { ascending: true });

    expect(error).toBeNull();
    expect(rangeRows).toHaveLength(2);
    expect(rangeRows?.[0]?.timestamp).toBe(timestamps[1]);
    expect(rangeRows?.[1]?.timestamp).toBe(timestamps[2]);

    for (const row of rangeRows ?? []) {
      const nested = row.risk_scores as unknown as { status: string; breakdown: unknown } | null;
      expect(nested).not.toBeNull();
      expect(typeof nested?.status).toBe("string");
    }
  });
});
