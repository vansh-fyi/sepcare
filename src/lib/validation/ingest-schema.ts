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
