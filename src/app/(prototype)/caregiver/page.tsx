import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeOverview } from "@/components/patterns/home-overview";
import { READINGS, getLatestEntry } from "@/lib/fixtures/readings";
import { mapRiskStatus } from "@/lib/fixtures/risk-status";

export default function Home({}: PageProps<"/caregiver">) {
  const latest = getLatestEntry();
  if (!latest) return <p>No readings available.</p>;
  const status = latest.risk ? mapRiskStatus(latest.risk.status) : undefined;
  const recent = READINGS.entries.slice(-12);
  return <HomeOverview status={status}
    seeAll={<Button variant="tertiary" size="sm" asChild><Link href="/caregiver/vitals">See all</Link></Button>}
    vitals={{
      pulse: { value: latest.vitals.heartRate.toFixed(0), unit: "bpm", status, data: recent.map(entry => ({ value: entry.vitals.heartRate })) },
      temperature: { value: latest.vitals.temperature.toFixed(1), unit: "°C", status },
      activity: { value: latest.vitals.activityScore.toFixed(0), status },
    }} />;
}
