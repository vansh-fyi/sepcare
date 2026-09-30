import { z } from "zod";
import type { RiskBreakdown } from "@/lib/risk/compute";
import { ACTIVITY_DECLINE_RATIO, BASELINE_MIN_MS, HR_TEMP_RATIO_MAX, HR_TEMP_RATIO_MIN, MIN_DELTA_TEMP_C, TEMP_FEVER_C, TEMP_HYPOTHERMIA_C, TREND_WINDOW_MS } from "@/lib/risk/thresholds";
import { DEVICE_ID } from "./device";

export interface ReadingEntry {
  timestamp: number;
  vitals: { heartRate: number; spo2: number; temperature: number; activityScore: number };
  risk: { status: "green" | "amber" | "red"; breakdown: RiskBreakdown } | null;
}

export interface ReadingsEnvelope {
  deviceId: string;
  from: number;
  to: number;
  entries: ReadingEntry[];
}

/** Exactly the GET /api/readings keys; no UI-only fields in the transport shape. */
export const ReadingsEnvelopeSchema = z.strictObject({
  deviceId: z.string(),
  from: z.number(),
  to: z.number(),
  entries: z.array(z.strictObject({
    timestamp: z.number(),
    vitals: z.strictObject({ heartRate: z.number(), spo2: z.number(), temperature: z.number(), activityScore: z.number() }),
    risk: z.strictObject({
      status: z.enum(["green", "amber", "red"]),
      breakdown: z.strictObject({
        temperature: z.strictObject({ abnormal: z.boolean(), value: z.number() }),
        hrTempProportionality: z.strictObject({ abnormal: z.boolean(), ratio: z.number().nullable() }),
        activityTrend: z.strictObject({ trending: z.boolean(), delta: z.number().nullable() }),
      }),
    }).nullable(),
  })),
});

const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

/** Mirrors computeAndPersistRiskScore without importing its server/database runtime. */
function computeRisk(target: ReadingEntry, history: ReadingEntry[]): NonNullable<ReadingEntry["risk"]> {
  const prior = history.filter((row) => row.timestamp >= target.timestamp - TREND_WINDOW_MS && row.timestamp < target.timestamp);
  const established = target.timestamp - (prior[0]?.timestamp ?? target.timestamp) >= BASELINE_MIN_MS;
  const temperatureAbnormal = target.vitals.temperature >= TEMP_FEVER_C || target.vitals.temperature < TEMP_HYPOTHERMIA_C;
  let ratio: number | null = null;
  let hrTempAbnormal = false;
  let delta: number | null = null;
  let trending = false;
  if (established && prior.length > 0) {
    const deltaTemp = target.vitals.temperature - mean(prior.map((row) => row.vitals.temperature));
    const deltaHR = target.vitals.heartRate - mean(prior.map((row) => row.vitals.heartRate));
    if (Math.abs(deltaTemp) >= MIN_DELTA_TEMP_C) {
      ratio = deltaHR / deltaTemp;
      hrTempAbnormal = ratio < HR_TEMP_RATIO_MIN || ratio > HR_TEMP_RATIO_MAX;
    }
    const baselineActivity = mean(prior.map((row) => row.vitals.activityScore));
    if (baselineActivity > 0) {
      delta = target.vitals.activityScore - baselineActivity;
      trending = target.vitals.activityScore <= baselineActivity * ACTIVITY_DECLINE_RATIO;
    }
  }
  const count = Number(temperatureAbnormal) + Number(hrTempAbnormal) + Number(trending);
  return {
    status: count >= 3 ? "red" : count === 2 ? "amber" : "green",
    breakdown: {
      temperature: { abnormal: temperatureAbnormal, value: target.vitals.temperature },
      hrTempProportionality: { abnormal: hrTempAbnormal, ratio },
      activityTrend: { trending, delta },
    },
  };
}

/** Synthetic, deterministic vitals captured once at module load; not live monitoring. */
function createReadings(to: number): ReadingsEnvelope {
  const from = to - 24 * 60 * 60 * 1000;
  const entries: ReadingEntry[] = [];
  let index = 0;
  for (let timestamp = from; timestamp <= to; timestamp += (1 + index % 3) * 60_000) {
    const escalation = timestamp >= to - 90 * 60 * 1000;
    const wave = Math.sin(index * 0.37);
    const entry: ReadingEntry = {
      timestamp,
      vitals: {
        heartRate: Math.round((escalation ? 170 : 130) + wave * 6),
        spo2: 97 + index % 3,
        temperature: Number(((escalation ? TEMP_FEVER_C + 0.4 : 36.75) + wave * 0.15).toFixed(2)),
        activityScore: Math.round(75 + Math.cos(index * 0.23) * 10),
      },
      risk: null,
    };
    entry.risk = computeRisk(entry, entries);
    entries.push(entry);
    index += 1;
  }
  return { deviceId: DEVICE_ID, from, to, entries };
}

export const READINGS: ReadingsEnvelope = createReadings(Date.now());

export function getLatestEntry(): ReadingEntry | undefined {
  return READINGS.entries.at(-1);
}
