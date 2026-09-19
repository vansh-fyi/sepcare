import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/readings/route";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { type RiskBreakdown } from "@/lib/risk/compute";
import { deleteReadingsInRange } from "./helpers/cleanup";

const DEVICE_ID = "nb-001";
const DAY_MS = 24 * 60 * 60 * 1000;
const FIXTURE_START = 2_200_000_000_000;
const FIXTURE_END = FIXTURE_START + 7 * DAY_MS;

const breakdown: RiskBreakdown = {
  temperature: { abnormal: false, value: 36.8 },
  hrTempProportionality: { abnormal: false, ratio: null },
  activityTrend: { trending: false, delta: null },
};

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost/api/readings");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
}

describe("GET /api/readings — chronological history", () => {
  afterEach(async () => {
    await deleteReadingsInRange(DEVICE_ID, FIXTURE_START, FIXTURE_END);
  });

  it("returns all eight daily readings across seven continuous days with persisted risks and an unscored gap (READ-02)", async () => {
    const readings = Array.from({ length: 8 }, (_, index) => ({
      deviceId: DEVICE_ID,
      timestamp: FIXTURE_START + index * DAY_MS,
      heartRate: 120 + index,
      spo2: 97 + (index % 2),
      temperature: 36.5 + index / 10,
      activityScore: index + 1,
    }));

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("readings")
      .insert(readings)
      .select("id, timestamp, heartRate, spo2, temperature, activityScore");

    expect(insertError).toBeNull();
    expect(inserted).toHaveLength(8);

    const { error: scoreError } = await supabaseAdmin.from("risk_scores").insert(
      inserted!.slice(0, 7).map((reading, index) => ({
        reading_id: reading.id,
        deviceId: DEVICE_ID,
        status: index % 2 === 0 ? "green" : "amber",
        breakdown,
      }))
    );
    expect(scoreError).toBeNull();

    const response = await GET(
      makeRequest({
        deviceId: DEVICE_ID,
        from: String(FIXTURE_START),
        to: String(FIXTURE_END),
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      deviceId: DEVICE_ID,
      from: FIXTURE_START,
      to: FIXTURE_END,
      entries: readings.map((reading, index) => ({
        timestamp: reading.timestamp,
        vitals: {
          heartRate: reading.heartRate,
          spo2: reading.spo2,
          temperature: reading.temperature,
          activityScore: reading.activityScore,
        },
        risk:
          index === 7
            ? null
            : {
                status: index % 2 === 0 ? "green" : "amber",
                breakdown,
              },
      })),
    });
  });
});
