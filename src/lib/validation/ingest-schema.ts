import { z } from "zod";

/**
 * Validates the nested ingest payload shape locked by CONTEXT.md D-01:
 *   { deviceId, timestamp, vitals: { heartRate, spo2, temperature, activityScore } }
 *
 * `timestamp` is Unix epoch milliseconds as an integer (D-02), not an ISO string.
 */
export const IngestSchema = z.object({
  deviceId: z.string().min(1),
  timestamp: z.number().int(),
  vitals: z.object({
    heartRate: z.number(),
    spo2: z.number(),
    temperature: z.number(),
    activityScore: z.number(),
  }),
});

export type IngestPayload = z.infer<typeof IngestSchema>;

/**
 * Batch-sync payload shape (D-30): a single top-level `deviceId` (auth is
 * per-device, not per-reading) plus an array of per-item readings reusing
 * `IngestSchema`'s nested `vitals` shape, just without a repeated
 * `deviceId` per entry.
 *
 * `.min(1)` rejects an empty batch; `.max(500)` enforces D-32's cap — both
 * checked by Zod before any DB work is attempted.
 */
export const BatchItemSchema = IngestSchema.omit({ deviceId: true });

export const BatchIngestSchema = z.object({
  deviceId: z.string().min(1),
  readings: z.array(BatchItemSchema).min(1).max(500),
});

export type BatchIngestPayload = z.infer<typeof BatchIngestSchema>;
