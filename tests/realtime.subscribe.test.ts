import { describe, it, expect, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/ingest/route";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { deleteReadingByTimestamp } from "./helpers/cleanup";

const DEVICE_ID = "nb-001";
const VALID_KEY = process.env.DEVICE_API_KEY!;
const THROWAWAY_DEVICE_ID = "throwaway-realtime-test-device";
const THROWAWAY_API_KEY = "throwaway-key-not-used-for-auth";

const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Opens the postgres_changes subscription and resolves once Supabase
 * confirms SUBSCRIBED — firing the INSERT before this ack is a race that
 * silently drops the event, since the channel isn't listening yet.
 *
 * Filters by BOTH deviceId and timestamp, not deviceId alone: under
 * vitest's default file-level parallelism, ingest.route.test.ts and
 * ingest.auth.test.ts insert their own nb-001 rows concurrently with this
 * file's run, and a deviceId-only filter can be satisfied by one of THEIR
 * inserts instead of the row this test actually created — a false-positive
 * match that produced flaky failures under `npm test` (2/3 runs) despite
 * passing reliably in isolation.
 */
function openInsertSubscription(
  matchDeviceId: string,
  matchTimestamp: number
): Promise<{
  waitForRow: (timeoutMs: number) => Promise<Record<string, unknown> | null>;
  close: () => void;
}> {
  return new Promise((resolveSubscribed, rejectSubscribed) => {
    let resolveRow: ((row: Record<string, unknown> | null) => void) | null = null;

    const channel = anonClient
      .channel(`readings-test-${matchDeviceId}-${matchTimestamp}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "readings" },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          if (
            row.deviceId === matchDeviceId &&
            row.timestamp === matchTimestamp &&
            resolveRow
          ) {
            resolveRow(row);
            resolveRow = null;
          }
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          resolveSubscribed({
            waitForRow: (timeoutMs: number) =>
              new Promise((resolve) => {
                resolveRow = resolve;
                setTimeout(() => {
                  if (resolveRow) {
                    resolveRow(null);
                    resolveRow = null;
                  }
                }, timeoutMs);
              }),
            close: () => channel.unsubscribe(),
          });
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          rejectSubscribed(err ?? new Error(`Realtime subscribe failed: ${status}`));
        }
      });
  });
}

describe("Supabase Realtime — anon subscriber (READ-01, D-07, D-08, D-09)", () => {
  const insertedTimestamps: number[] = [];

  afterAll(async () => {
    while (insertedTimestamps.length) {
      const ts = insertedTimestamps.pop()!;
      await deleteReadingByTimestamp(ts);
    }
    await supabaseAdmin.from("devices").delete().eq("device_id", THROWAWAY_DEVICE_ID);
  });

  it(
    "delivers an nb-001 INSERT with correctly-cased camelCase keys",
    async () => {
      const timestamp = Date.now() + 500;
      insertedTimestamps.push(timestamp);

      const sub = await openInsertSubscription(DEVICE_ID, timestamp);
      const waitPromise = sub.waitForRow(10000);

      const res = await POST(
        new NextRequest("http://localhost/api/ingest", {
          method: "POST",
          headers: { "content-type": "application/json", "x-api-key": VALID_KEY },
          body: JSON.stringify({
            deviceId: DEVICE_ID,
            timestamp,
            vitals: { heartRate: 140, spo2: 96, temperature: 37.2, activityScore: 2 },
          }),
        })
      );
      expect(res.status).toBe(201);

      const row = await waitPromise;
      sub.close();
      expect(row).not.toBeNull();
      expect(row).toMatchObject({
        deviceId: DEVICE_ID,
        timestamp,
        heartRate: 140,
        spo2: 96,
        temperature: 37.2,
        activityScore: 2,
      });
      // Explicitly prove Pitfall 1 is mitigated — no lowercase-folded keys present.
      expect(Object.prototype.hasOwnProperty.call(row, "deviceid")).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(row, "heartrate")).toBe(false);
    },
    15000
  );

  it(
    "does NOT deliver an INSERT event for a different, non-nb-001 device (RLS boundary, T-1-02)",
    async () => {
      await supabaseAdmin
        .from("devices")
        .upsert({ device_id: THROWAWAY_DEVICE_ID, api_key: THROWAWAY_API_KEY });

      const timestamp = Date.now() + 501;
      insertedTimestamps.push(timestamp);

      const sub = await openInsertSubscription(THROWAWAY_DEVICE_ID, timestamp);
      const waitPromise = sub.waitForRow(5000);

      const { error } = await supabaseAdmin.from("readings").insert({
        deviceId: THROWAWAY_DEVICE_ID,
        timestamp,
        heartRate: 100,
        spo2: 99,
        temperature: 36.5,
        activityScore: 1,
      });
      expect(error).toBeNull();

      const row = await waitPromise;
      sub.close();
      expect(row).toBeNull();
    },
    10000
  );
});
