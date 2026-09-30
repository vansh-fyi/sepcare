import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ACTIVITY_DECLINE_RATIO, BASELINE_MIN_MS, HR_TEMP_RATIO_MAX, HR_TEMP_RATIO_MIN, MIN_DELTA_TEMP_C, TEMP_FEVER_C, TEMP_HYPOTHERMIA_C, TREND_WINDOW_MS } from "@/lib/risk/thresholds";

const available = existsSync("src/lib/fixtures/readings.ts");

describe("prototype fixtures", () => {
  it("provides API-shaped readings with genuinely computed risk", async () => {
    expect(available, "fixture envelope must exist").toBe(true);
    const { READINGS, ReadingsEnvelopeSchema, getLatestEntry } = await import("@/lib/fixtures/readings");
    expect(ReadingsEnvelopeSchema.parse(READINGS)).toEqual(READINGS);
    expect(Object.keys(READINGS).sort()).toEqual(["deviceId", "entries", "from", "to"]);
    expect(READINGS.deviceId).toBe("nb-001");
    expect(READINGS.to - READINGS.from).toBe(24 * 60 * 60 * 1000);
    expect(getLatestEntry()).toEqual(READINGS.entries.at(-1));
    const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;
    for (const [index, entry] of READINGS.entries.entries()) {
      const prior = READINGS.entries.slice(0, index).filter((row) => row.timestamp >= entry.timestamp - TREND_WINDOW_MS);
      const ready = prior.length > 0 && entry.timestamp - prior[0].timestamp >= BASELINE_MIN_MS;
      const dt = ready ? entry.vitals.temperature - mean(prior.map((row) => row.vitals.temperature)) : 0;
      const ratio = ready && Math.abs(dt) >= MIN_DELTA_TEMP_C ? (entry.vitals.heartRate - mean(prior.map((row) => row.vitals.heartRate))) / dt : null;
      const activity = ready ? mean(prior.map((row) => row.vitals.activityScore)) : 0;
      const temperatureAbnormal = entry.vitals.temperature >= TEMP_FEVER_C || entry.vitals.temperature < TEMP_HYPOTHERMIA_C;
      const ratioAbnormal = ratio !== null && (ratio < HR_TEMP_RATIO_MIN || ratio > HR_TEMP_RATIO_MAX);
      const trending = ready && activity > 0 && entry.vitals.activityScore <= activity * ACTIVITY_DECLINE_RATIO;
      expect(entry.risk?.breakdown).toEqual({
        temperature: { abnormal: temperatureAbnormal, value: entry.vitals.temperature },
        hrTempProportionality: { abnormal: ratioAbnormal, ratio },
        activityTrend: { trending, delta: ready && activity > 0 ? entry.vitals.activityScore - activity : null },
      });
      const count = Number(temperatureAbnormal) + Number(ratioAbnormal) + Number(trending);
      expect(entry.risk?.status).toBe(count >= 3 ? "red" : count === 2 ? "amber" : "green");
      expect(entry.risk?.status).toBe(entry.timestamp >= READINGS.to - 90 * 60 * 1000 ? "amber" : "green");
      if (index) expect(entry.timestamp - READINGS.entries[index - 1].timestamp).toBeGreaterThanOrEqual(60_000);
      if (index) expect(entry.timestamp - READINGS.entries[index - 1].timestamp).toBeLessThanOrEqual(180_000);
    }
    expect(READINGS.entries.some((entry) => entry.risk?.status === "amber" && entry.risk.breakdown.temperature.abnormal && entry.risk.breakdown.hrTempProportionality.abnormal)).toBe(true);
  });

  it("maps backend risk to the three clinical states", async () => {
    expect(existsSync("src/lib/fixtures/risk-status.ts"), "status mapper must exist").toBe(true);
    const { mapRiskStatus } = await import("@/lib/fixtures/risk-status");
    expect(["green", "amber", "red"].map((status) => mapRiskStatus(status as "green" | "amber" | "red"))).toEqual(["safe", "caution", "critical"]);
  });
});
