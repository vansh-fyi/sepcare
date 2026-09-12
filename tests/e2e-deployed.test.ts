import { describe, it, expect, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { deleteReadingByTimestamp } from "./helpers/cleanup";

const DEPLOYED_URL = process.env.DEPLOYED_URL;
const DEVICE_ID = "nb-001";
const DEVICE_API_KEY = process.env.DEVICE_API_KEY!;

const anonClient = DEPLOYED_URL
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  : null;

function openInsertSubscription(matchDeviceId: string) {
  return new Promise<{
    waitForRow: (timeoutMs: number) => Promise<Record<string, unknown> | null>;
    close: () => void;
  }>((resolveSubscribed, rejectSubscribed) => {
    let resolveRow: ((row: Record<string, unknown> | null) => void) | null = null;

    const channel = anonClient!
      .channel(`e2e-deployed-${matchDeviceId}-${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "readings" },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          if (row.deviceId === matchDeviceId && resolveRow) {
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

describe.skipIf(!DEPLOYED_URL)(
  "Deployed end-to-end smoke test (production Vercel URL)",
  () => {
    const insertedTimestamps: number[] = [];

    afterAll(async () => {
      while (insertedTimestamps.length) {
        const ts = insertedTimestamps.pop()!;
        await deleteReadingByTimestamp(ts);
      }
    });

    it(
      "a real HTTP POST to the deployed /api/ingest returns 201 and the reading is delivered via Realtime",
      async () => {
        const timestamp = Date.now() + 900;
        insertedTimestamps.push(timestamp);

        const sub = await openInsertSubscription(DEVICE_ID);
        const waitPromise = sub.waitForRow(10000);

        const res = await fetch(`${DEPLOYED_URL}/api/ingest`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": DEVICE_API_KEY,
          },
          body: JSON.stringify({
            deviceId: DEVICE_ID,
            timestamp,
            vitals: { heartRate: 128, spo2: 97, temperature: 37.1, activityScore: 2 },
          }),
        });
        expect(res.status).toBe(201);

        const row = await waitPromise;
        sub.close();
        expect(row).not.toBeNull();
        expect(row).toMatchObject({
          deviceId: DEVICE_ID,
          timestamp,
          heartRate: 128,
          spo2: 97,
          temperature: 37.1,
          activityScore: 2,
        });
      },
      15000
    );
  }
);
