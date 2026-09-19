import { describe, it, expect, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as BATCH_POST } from "@/app/api/ingest/batch/route";
import { POST as SINGLE_POST } from "@/app/api/ingest/route";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { deleteReadingsInRange } from "./helpers/cleanup";

const DEVICE_ID = "nb-001";
const VALID_KEY = process.env.DEVICE_API_KEY!;

const HOUR_MS = 60 * 60 * 1000;
const MIN_MS = 60 * 1000;

function makeBatchRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/ingest/batch", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function makeSingleRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/ingest", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function getReadingId(deviceId: string, timestamp: number): Promise<number> {
  const { data } = await supabaseAdmin
    .from("readings")
    .select("id")
    .eq("deviceId", deviceId)
    .eq("timestamp", timestamp)
    .maybeSingle();
  return data!.id;
}

describe("POST /api/ingest/batch", () => {
  const ranges: Array<[number, number]> = [];

  afterEach(async () => {
    while (ranges.length) {
      const [from, to] = ranges.pop()!;
      await deleteReadingsInRange(DEVICE_ID, from, to);
    }
  });

  it("stores each reading under its own submitted timestamp, never the server's request-time now (ING-03)", async () => {
    const base = Date.now() - 500 * HOUR_MS;
    const timestamps = [base, base + 5 * MIN_MS, base + 10 * MIN_MS];
    ranges.push([base - MIN_MS, base + 15 * MIN_MS]);

    // Shuffled (non-chronological) array order.
    const shuffled = [timestamps[2], timestamps[0], timestamps[1]];

    const payload = {
      deviceId: DEVICE_ID,
      readings: shuffled.map((timestamp, i) => ({
        timestamp,
        vitals: { heartRate: 130 + i, spo2: 98, temperature: 36.8, activityScore: 3 },
      })),
    };

    const res = await BATCH_POST(makeBatchRequest(payload, { "x-api-key": VALID_KEY }));
    expect(res.status).toBe(201);

    for (const timestamp of timestamps) {
      const { data, error } = await supabaseAdmin
        .from("readings")
        .select("timestamp")
        .eq("deviceId", DEVICE_ID)
        .eq("timestamp", timestamp)
        .maybeSingle();
      expect(error).toBeNull();
      expect(data?.timestamp).toBe(timestamp);
    }

    // Never stored near Date.now() — sanity check against request time.
    const { data: nearNow } = await supabaseAdmin
      .from("readings")
      .select("id")
      .eq("deviceId", DEVICE_ID)
      .gte("timestamp", Date.now() - MIN_MS)
      .lte("timestamp", Date.now() + MIN_MS);
    expect(nearNow ?? []).toEqual([]);
  });

  it("backfill-rescores an already-scored existing reading whose 12h window overlaps a batch of older readings (D-27/D-28)", async () => {
    const base = Date.now() - 600 * HOUR_MS;
    const targetTs = base;
    const old1 = targetTs - 2 * HOUR_MS;
    const old2 = targetTs - 1.5 * HOUR_MS;
    ranges.push([targetTs - 3 * HOUR_MS, targetTs + HOUR_MS]);

    // A live reading at targetTs, normal-range, no prior history nearby —
    // baseline not established, so it scores green initially.
    const livePayload = {
      deviceId: DEVICE_ID,
      timestamp: targetTs,
      vitals: { heartRate: 140, spo2: 98, temperature: 36.9, activityScore: 3 },
    };
    const liveRes = await SINGLE_POST(
      makeSingleRequest(livePayload, { "x-api-key": VALID_KEY })
    );
    expect(liveRes.status).toBe(201);

    const targetId = await getReadingId(DEVICE_ID, targetTs);
    const { data: beforeScore } = await supabaseAdmin
      .from("risk_scores")
      .select("status")
      .eq("reading_id", targetId)
      .maybeSingle();
    expect(beforeScore?.status).toBe("green");

    // A batch of 2 older readings deliberately shaped (low HR, high
    // activity, near-normal temp) so the backfilled baseline measurably
    // changes the target's recomputed status.
    const batchPayload = {
      deviceId: DEVICE_ID,
      readings: [
        {
          timestamp: old1,
          vitals: { heartRate: 80, spo2: 98, temperature: 36.0, activityScore: 20 },
        },
        {
          timestamp: old2,
          vitals: { heartRate: 80, spo2: 98, temperature: 36.0, activityScore: 20 },
        },
      ],
    };
    const batchRes = await BATCH_POST(
      makeBatchRequest(batchPayload, { "x-api-key": VALID_KEY })
    );
    expect(batchRes.status).toBe(201);

    const { data: afterScore } = await supabaseAdmin
      .from("risk_scores")
      .select("status, breakdown")
      .eq("reading_id", targetId)
      .maybeSingle();

    expect(afterScore?.status).toBe("amber");
    const breakdown = afterScore?.breakdown as {
      hrTempProportionality: { abnormal: boolean };
      activityTrend: { trending: boolean };
    };
    expect(breakdown.hrTempProportionality.abnormal).toBe(true);
    expect(breakdown.activityTrend.trending).toBe(true);
  });

  it("produces risk_scores rows with the same column set as the single-reading route (Roadmap success criterion #4)", async () => {
    const base = Date.now() - 700 * HOUR_MS;
    const singleTs = base - 2 * HOUR_MS;
    const batchTs1 = base;
    const batchTs2 = base + 5 * MIN_MS;
    ranges.push([singleTs - MIN_MS, batchTs2 + MIN_MS]);

    const singlePayload = {
      deviceId: DEVICE_ID,
      timestamp: singleTs,
      vitals: { heartRate: 132, spo2: 98, temperature: 36.9, activityScore: 3 },
    };
    const singleRes = await SINGLE_POST(
      makeSingleRequest(singlePayload, { "x-api-key": VALID_KEY })
    );
    expect(singleRes.status).toBe(201);
    const singleId = await getReadingId(DEVICE_ID, singleTs);
    const { data: singleScore } = await supabaseAdmin
      .from("risk_scores")
      .select("*")
      .eq("reading_id", singleId)
      .maybeSingle();

    const batchPayload = {
      deviceId: DEVICE_ID,
      readings: [
        {
          timestamp: batchTs1,
          vitals: { heartRate: 131, spo2: 98, temperature: 36.8, activityScore: 3 },
        },
        {
          timestamp: batchTs2,
          vitals: { heartRate: 131, spo2: 98, temperature: 36.8, activityScore: 3 },
        },
      ],
    };
    const batchRes = await BATCH_POST(
      makeBatchRequest(batchPayload, { "x-api-key": VALID_KEY })
    );
    expect(batchRes.status).toBe(201);
    const batchId = await getReadingId(DEVICE_ID, batchTs1);
    const { data: batchScore } = await supabaseAdmin
      .from("risk_scores")
      .select("*")
      .eq("reading_id", batchId)
      .maybeSingle();

    expect(singleScore).not.toBeNull();
    expect(batchScore).not.toBeNull();
    expect(Object.keys(batchScore!).sort()).toEqual(
      Object.keys(singleScore!).sort()
    );
    expect(Object.keys(batchScore!).sort()).toEqual(
      ["reading_id", "deviceId", "status", "breakdown", "created_at"].sort()
    );
  });
});
