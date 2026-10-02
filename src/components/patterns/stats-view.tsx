"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { VITAL_DETAILS, VitalDetailCard } from "./vital-detail-card";
import type { ReadingEntry } from "@/lib/fixtures/readings";
import { getTrendWindow, type TrendRangeHours } from "@/lib/fixtures/trend-window";
import { getVitalMetric } from "@/lib/fixtures/vital-metrics";

export function StatsView({ entries }: { entries: ReadingEntry[] }) {
  const [range, setRange] = React.useState<TrendRangeHours>(1);
  const latest = entries.at(-1);
  // A fixture is a snapshot: anchor its window to its last original timestamp.
  const windowed = getTrendWindow(entries, range, latest?.timestamp ?? 0);
  return <div className="space-y-6">
    <ToggleGroup type="single" size="sm" fit="equal" aria-label="Trend time range"
      value={String(range)} onValueChange={value => {
        if (value === "1" || value === "6" || value === "24") setRange(Number(value) as TrendRangeHours);
      }}>
      {([1, 6, 24] as const).map(hours => <ToggleGroupItem key={hours} value={String(hours)}>{hours}H</ToggleGroupItem>)}
    </ToggleGroup>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
    </div>
  </div>;
}
