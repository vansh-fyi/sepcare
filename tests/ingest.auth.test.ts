import { describe, it, expect, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/ingest/route";
import { deleteReadingByTimestamp } from "./helpers/cleanup";

const DEVICE_ID = "nb-001";
const VALID_KEY = process.env.DEVICE_API_KEY!;

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/ingest", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const validPayload = (timestamp: number) => ({
  deviceId: DEVICE_ID,
  timestamp,
  vitals: { heartRate: 120, spo2: 97, temperature: 37.0, activityScore: 1 },
});

describe("POST /api/ingest — authentication (ING-02, DEV-01)", () => {
  const insertedTimestamps: number[] = [];

  afterEach(async () => {
    while (insertedTimestamps.length) {
      const ts = insertedTimestamps.pop()!;
      await deleteReadingByTimestamp(ts);
    }
  });

  it("returns 401 with the standard body when X-API-Key is missing", async () => {
    const timestamp = Date.now() + 100;
    const res = await POST(makeRequest(validPayload(timestamp)));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({ error: "Invalid or missing API key" });
  });

  it("returns the identical 401 body when X-API-Key is an empty string", async () => {
    const timestamp = Date.now() + 101;
    const res = await POST(
      makeRequest(validPayload(timestamp), { "x-api-key": "" })
    );
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({ error: "Invalid or missing API key" });
  });

  it("returns 401 when X-API-Key matches no devices row", async () => {
    const timestamp = Date.now() + 102;
    const res = await POST(
      makeRequest(validPayload(timestamp), {
        "x-api-key": "0000000000000000000000000000000000000000000000000000000000000000",
      })
    );
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({ error: "Invalid or missing API key" });
  });

  it("returns 401 (not 400) when the valid key's device_id does not match the body's deviceId — prohibits mismatched-device persistence", async () => {
    const timestamp = Date.now() + 103;
    const res = await POST(
      makeRequest(
        { ...validPayload(timestamp), deviceId: "some-other-device" },
        { "x-api-key": VALID_KEY }
      )
    );
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({ error: "Invalid or missing API key" });
  });

  it("valid key + valid matching deviceId succeeds (control case for the tests above)", async () => {
    const timestamp = Date.now() + 104;
    insertedTimestamps.push(timestamp);
    const res = await POST(
      makeRequest(validPayload(timestamp), { "x-api-key": VALID_KEY })
    );
    expect(res.status).toBe(201);
  });
});
