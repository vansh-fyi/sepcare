import type { ReadingEntry } from "./readings";

/** Shared transport-to-display mapping for the three supported signals. */
export function getVitalMetric(index: number, entry?: ReadingEntry): {
  status: "safe" | "critical" | "unscored" | "unavailable";
  value?: number;
  unit?: string;
  description: string;
} {
  const breakdown = entry?.risk?.breakdown;
  switch (index) {
    case 0:
      return {
        status: !breakdown ? "unscored" : breakdown.temperature.abnormal ? "critical" : "safe",
        value: entry?.vitals.temperature,
        unit: "°C",
        description: !entry ? "No readings yet" : breakdown?.temperature.abnormal
          ? "Temperature outside the expected range." : "Latest temperature reading.",
      };
    case 3:
      return {
        status: breakdown?.hrTempProportionality.ratio == null ? "unscored" : breakdown.hrTempProportionality.abnormal ? "critical" : "safe",
        value: breakdown?.hrTempProportionality.ratio ?? undefined,
        unit: "bpm/°C",
        description: breakdown?.hrTempProportionality.ratio == null
          ? "Not enough temperature change or baseline history to calculate a ratio."
          : breakdown.hrTempProportionality.abnormal
            ? "Heart-rate response outside the expected ratio." : "Heart-rate response within the expected ratio.",
      };
    case 5:
      return {
        status: !breakdown ? "unscored" : breakdown.activityTrend.trending ? "critical" : "safe",
        value: entry?.vitals.activityScore,
        description: !entry ? "No readings yet" : breakdown?.activityTrend.trending
          ? "Activity is declining compared with baseline." : "Latest activity reading.",
      };
    default:
      return { status: "unavailable", description: "Not yet available — awaiting device support." };
  }
}
