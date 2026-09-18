import { describe, it, expect, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/ingest/route";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { computeAndPersistRiskScore } from "@/lib/risk/compute";
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
