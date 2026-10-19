"use client";

import * as React from "react";
import { TrendTimeScale, TREND_HOURS } from "./trend-time-scale";
import { ClinicalMetricGrid } from "./clinical-screen";
import { VITAL_DETAILS, VitalDetailCard } from "./vital-detail-card";
import type { ReadingEntry } from "@/lib/fixtures/readings";
import { getTrendWindow, type TrendRangeHours } from "@/lib/fixtures/trend-window";
import { getVitalMetric } from "@/lib/fixtures/vital-metrics";

export function StatsView({ entries }: { entries: ReadingEntry[] }) {
  const [range, setRange] = React.useState<TrendRangeHours>(4);
  const latest = entries.at(-1);
  // A fixture is a snapshot: anchor its window to its last original timestamp.
  const windowed = getTrendWindow(entries, range, latest?.timestamp ?? 0);
  return <div className="space-y-6">
    <TrendTimeScale value={String(range)} onValueChange={value => {
      if (TREND_HOURS.some(hours => String(hours) === value)) setRange(Number(value) as TrendRangeHours);
    }} />
    <ClinicalMetricGrid>
      {VITAL_DETAILS.map((detail, index) => {
        const metric = getVitalMetric(index, latest);
        if (metric.status === "unavailable") return <VitalDetailCard key={detail.title} {...detail} {...metric} />;
        const data = windowed.map(entry => {
          const row: Record<string, number | string> = { timestamp: entry.timestamp };
          const value = getVitalMetric(index, entry).value;
          // Missing computed ratios remain gaps; keep the reading's timestamp.
          if (value !== undefined) row.value = value;
          return row;
        });
        return <VitalDetailCard key={detail.title} {...detail} {...metric}
          value={metric.value === undefined ? "—" : index === 3 ? metric.value.toFixed(1) : metric.value}
          chart={{ data, xKey: "timestamp", timeAxis: true, series: [{
            key: "value", label: detail.title, color: metric.status === "unscored" ? "var(--color-text-muted)" : `var(--color-${metric.status})`, showDots: false,
          }] }} />;
      })}
    </ClinicalMetricGrid>
  </div>;
}
