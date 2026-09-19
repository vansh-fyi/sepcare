import { afterEach, describe, expect, it, vi } from "vitest";
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

function validParams(overrides: Record<string, string> = {}) {
  return {
    deviceId: DEVICE_ID,
    from: String(FIXTURE_START),
    to: String(FIXTURE_END),
    ...overrides,
  };
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

describe("GET /api/readings — public range contract", () => {
  it.each([
    { params: { from: String(FIXTURE_START), to: String(FIXTURE_END) }, error: "deviceId is required", field: "deviceId", reason: "missing" },
    { params: validParams({ from: "" }), error: "from must be a whole epoch-millisecond integer", field: "from", reason: "not-a-whole-decimal" },
    { params: validParams({ to: "" }), error: "to must be a whole epoch-millisecond integer", field: "to", reason: "not-a-whole-decimal" },
    { params: validParams({ from: "text" }), error: "from must be a whole epoch-millisecond integer", field: "from", reason: "not-a-whole-decimal" },
    { params: validParams({ to: "1.5" }), error: "to must be a whole epoch-millisecond integer", field: "to", reason: "not-a-whole-decimal" },
    { params: validParams({ from: "9007199254740992" }), error: "from must be a safe epoch-millisecond integer", field: "from", reason: "not-a-safe-integer" },
    { params: validParams({ from: String(FIXTURE_END), to: String(FIXTURE_START) }), error: "from must be earlier than to", field: "range", reason: "not-chronological" },
    { params: validParams({ to: String(FIXTURE_START + 15 * DAY_MS + 1) }), error: "range must not exceed 15 days", field: "range", reason: "exceeds-15-days" },
  ])("rejects $field validation failures", async ({ params, error, field, reason }) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    try {
      const response = await GET(makeRequest(params));
      expect(response.status).toBe(400);
      expect(response.headers.get("cache-control")).toBe("no-store");
      await expect(response.json()).resolves.toEqual({ error });
      expect(warn).toHaveBeenCalledWith("Invalid reading-history query", { field, reason });
    } finally {
      warn.mockRestore();
    }
  });

  it("hides unsupported devices with the fixed D-39 response", async () => {
    const response = await GET(makeRequest(validParams({ deviceId: "other-device" })));
    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ error: "Device not found" });
  });

  it("returns a no-store empty envelope for a valid range with no history", async () => {
    const response = await GET(
      makeRequest({
        deviceId: DEVICE_ID,
        from: "2100000000000",
        to: "2100000000001",
      })
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      deviceId: DEVICE_ID,
      from: 2100000000000,
      to: 2100000000001,
      entries: [],
    });
  });

  it("keeps database failure details server-side", async () => {
    const databaseFailure = new Error("distinctive database failure");
    const chain = {
      select: vi.fn(), eq: vi.fn(), gte: vi.fn(), lte: vi.fn(), order: vi.fn(), range: vi.fn(),
    };
    chain.select.mockReturnValue(chain);
    chain.eq.mockReturnValue(chain);
    chain.gte.mockReturnValue(chain);
    chain.lte.mockReturnValue(chain);
    chain.order.mockReturnValue(chain);
    chain.range.mockResolvedValue({ data: null, error: databaseFailure });
    const from = vi.spyOn(supabaseAdmin, "from").mockReturnValue(chain as never);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    try {
      const response = await GET(makeRequest(validParams()));
      expect(response.status).toBe(500);
      expect(response.headers.get("cache-control")).toBe("no-store");
      const body = await response.json();
      expect(body).toEqual({ error: "Unable to load reading history" });
      expect(JSON.stringify(body)).not.toContain(databaseFailure.message);
      expect(error).toHaveBeenCalled();
    } finally {
      from.mockRestore();
      error.mockRestore();
    }
  });

  it("fetches a second page after the first 1,000 rows", async () => {
    const firstPage = Array.from({ length: 1000 }, (_, index) => ({
      timestamp: FIXTURE_START + index,
      heartRate: 120,
      spo2: 98,
      temperature: 36.8,
      activityScore: 3,
      risk_scores: null,
    }));
    const secondPage = [{ ...firstPage[0], timestamp: FIXTURE_START + 1000 }];
    const ranges: Array<[number, number]> = [];
    const chain = {
      select: vi.fn(), eq: vi.fn(), gte: vi.fn(), lte: vi.fn(), order: vi.fn(), range: vi.fn(),
    };
    chain.select.mockReturnValue(chain);
    chain.eq.mockReturnValue(chain);
    chain.gte.mockReturnValue(chain);
    chain.lte.mockReturnValue(chain);
    chain.order.mockReturnValue(chain);
    chain.range.mockImplementation((from: number, to: number) => {
      ranges.push([from, to]);
      return Promise.resolve({ data: from === 0 ? firstPage : secondPage, error: null });
    });
    const from = vi.spyOn(supabaseAdmin, "from").mockReturnValue(chain as never);

    try {
      const response = await GET(makeRequest(validParams()));
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(ranges).toEqual([[0, 999], [1000, 1999]]);
      expect(body.entries).toHaveLength(1001);
      expect(body.entries.map((entry: { timestamp: number }) => entry.timestamp)).toEqual([
        ...firstPage.map((row) => row.timestamp),
        secondPage[0].timestamp,
      ]);
    } finally {
      from.mockRestore();
    }
  });
});
