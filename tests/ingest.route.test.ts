import { describe, it, expect, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/ingest/route";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { deleteReadingByTimestamp } from "./helpers/cleanup";

const DEVICE_ID = "nb-001";
const VALID_KEY = process.env.DEVICE_API_KEY!;

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/ingest", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/ingest — valid submissions and storage integrity", () => {
  const insertedTimestamps: number[] = [];

  afterEach(async () => {
    while (insertedTimestamps.length) {
      const ts = insertedTimestamps.pop()!;
      await deleteReadingByTimestamp(ts);
    }
  });

  it("returns 201 and persists all fields exactly on a valid POST (ING-01, STOR-01)", async () => {
    const timestamp = Date.now() + 1;
    insertedTimestamps.push(timestamp);

    const payload = {
      deviceId: DEVICE_ID,
      timestamp,
      vitals: { heartRate: 132.5, spo2: 98, temperature: 36.9, activityScore: 3 },
    };

    const res = await POST(makeRequest(payload, { "x-api-key": VALID_KEY }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toEqual({ status: "ok" });

    const { data, error } = await supabaseAdmin
      .from("readings")
      .select("deviceId, timestamp, heartRate, spo2, temperature, activityScore")
      .eq("timestamp", timestamp)
      .maybeSingle();

    expect(error).toBeNull();
    expect(data).toEqual({
      deviceId: DEVICE_ID,
      timestamp,
      heartRate: 132.5,
      spo2: 98,
      temperature: 36.9,
      activityScore: 3,
    });

    // RISK-03: a risk_scores row is automatically created for the inserted
    // reading, with no manual trigger.
    const { data: reading } = await supabaseAdmin
      .from("readings")
      .select("id")
      .eq("timestamp", timestamp)
      .maybeSingle();

    const { data: riskScore, error: riskScoreError } = await supabaseAdmin
      .from("risk_scores")
      .select("status, breakdown")
      .eq("reading_id", reading!.id)
      .maybeSingle();

    expect(riskScoreError).toBeNull();
    expect(riskScore).not.toBeNull();
  });

  it("returns 400 for a valid key but a body missing vitals.heartRate, naming the missing field (D-11)", async () => {
    const timestamp = Date.now() + 2;
    const payload = {
      deviceId: DEVICE_ID,
      timestamp,
      vitals: { spo2: 98, temperature: 36.9, activityScore: 3 },
    };

    const res = await POST(makeRequest(payload, { "x-api-key": VALID_KEY }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid payload");
    expect(Array.isArray(json.details)).toBe(true);
    const paths = json.details.map((d: { path: unknown[] }) => d.path.join("."));
    expect(paths.some((p: string) => p.includes("heartRate"))).toBe(true);

    const { data } = await supabaseAdmin
      .from("readings")
      .select("timestamp")
      .eq("timestamp", timestamp)
      .maybeSingle();
    expect(data).toBeNull();
  });

  it("returns 400 (not 500) for a non-JSON body with a valid key (Pitfall 4, D-11)", async () => {
    const res = await POST(
      makeRequest("this is not json", { "x-api-key": VALID_KEY })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid payload");
  });
});
