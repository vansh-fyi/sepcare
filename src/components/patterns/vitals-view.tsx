import { StatusCard } from "./clinical-cards";
import { Badge } from "@/components/ui/badge";
import { VITAL_DETAILS, VitalDetailCard } from "./vital-detail-card";
import { RiskTimeline } from "./risk-timeline";
import type { ReadingEntry } from "@/lib/fixtures/readings";
import { mapRiskStatus, STATUS_LABEL } from "@/lib/fixtures/risk-status";
import { getRiskHistory } from "@/lib/fixtures/risk-history";
import { getVitalMetric } from "@/lib/fixtures/vital-metrics";

const STATUS_COPY = {
  safe: "No combined risk alert in the latest reading.",
  caution: "Multiple signals need attention. Check the readings below.",
  critical: "High suspicion. Seek urgent medical attention.",
};

/** Identical data and composition for caregiver and parent detail routes. */
export function VitalsView({ entries }: { entries: ReadingEntry[] }) {
  const latest = entries.at(-1);
  const overallStatus = mapRiskStatus(latest?.risk?.status ?? "green");
  return <div className="space-y-6">
    {latest?.risk ? <StatusCard status={overallStatus} title={STATUS_LABEL[overallStatus]} description={STATUS_COPY[overallStatus]}>
      <Badge status={overallStatus}>{STATUS_LABEL[overallStatus]}</Badge>
    </StatusCard> : <p className="text-sm text-text-muted">{latest ? "Risk status not yet calculated." : "No readings yet"}</p>}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {VITAL_DETAILS.map((detail, index) => {
        const metric = getVitalMetric(index, latest);
        return <VitalDetailCard key={detail.title} {...detail} {...metric}
          value={metric.status === "unavailable" ? undefined : metric.value === undefined ? "—" : index === 3 ? metric.value.toFixed(1) : metric.value} />;
      })}
    </div>
    <section aria-label="Risk history" className="space-y-3">
      <h2 className="font-heading text-xl font-bold">Risk history</h2>
      <RiskTimeline entries={getRiskHistory(entries).map(entry => ({
        timestamp: entry.timestamp,
        status: mapRiskStatus(entry.risk?.status ?? "green"),
      }))} />
    </section>
  </div>;
}
