import { ClinicalMetricGrid } from "./clinical-screen";
import { VITAL_DETAILS, VitalDetailCard } from "./vital-detail-card";
import { RiskTimeline } from "./risk-timeline";
import type { ReadingEntry } from "@/lib/fixtures/readings";
import { mapRiskStatus } from "@/lib/fixtures/risk-status";
import { getRiskHistory } from "@/lib/fixtures/risk-history";
import { getVitalMetric } from "@/lib/fixtures/vital-metrics";

/** Identical data and composition for caregiver and parent detail routes. */
export function VitalsView({ entries }: { entries: ReadingEntry[] }) {
  const latest = entries.at(-1);
  return <div className="space-y-6">
    {!latest?.risk && <p className="text-sm text-text-muted">{latest ? "Risk status not yet calculated." : "No readings yet"}</p>}
    <ClinicalMetricGrid>
      {VITAL_DETAILS.map((detail, index) => {
        const metric = getVitalMetric(index, latest);
        return <VitalDetailCard key={detail.title} {...detail} {...metric}
          value={metric.status === "unavailable" ? undefined : metric.value === undefined ? "—" : index === 3 ? metric.value.toFixed(1) : metric.value} />;
      })}
    </ClinicalMetricGrid>
    <section aria-label="Risk history" className="space-y-3">
      <h2 className="font-heading text-xl font-bold">Risk history</h2>
      <RiskTimeline entries={getRiskHistory(entries).map(entry => ({
        timestamp: entry.timestamp,
        status: entry.risk ? mapRiskStatus(entry.risk.status) : "unscored",
      }))} />
    </section>
  </div>;
}
