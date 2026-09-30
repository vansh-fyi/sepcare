import { InfantStatusSection } from "@/components/patterns/infant-status-section";
import { InstructionCard, VitalCard } from "@/components/patterns/clinical-cards";
import { READINGS, getLatestEntry } from "@/lib/fixtures/readings";
import { mapRiskStatus } from "@/lib/fixtures/risk-status";

const COPY = {
  safe: { title: "Baby is resting safely", description: "Based on the latest available readings." },
  caution: { title: "Needs attention", description: "Review the readings and contact the care team." },
  critical: { title: "Take baby to hospital", description: "Contact emergency care now." },
};

export default function CaregiverHome({}: PageProps<"/caregiver">) {
  const latest = getLatestEntry();
  if (!latest) return <p>No readings available.</p>;
  const status = latest.risk ? mapRiskStatus(latest.risk.status) : undefined;
  const recent = READINGS.entries.slice(-12);
  return (
    <div className="flex flex-col gap-6">
      {status ? <InfantStatusSection infant={{ status, ...COPY[status] }} /> : <p>Risk assessment is not available for this reading.</p>}
      <section aria-labelledby="caregiver-vitals">
        <h1 id="caregiver-vitals" className="mb-3 text-sm font-semibold">Vitals</h1>
        <div className="grid grid-cols-3 gap-2">
          <VitalCard metric="pulse" value={latest.vitals.heartRate.toFixed(0)} unit="bpm" status={status} data={recent.map((entry) => ({ value: entry.vitals.heartRate }))} />
          <VitalCard metric="temperature" value={latest.vitals.temperature.toFixed(1)} unit="°C" status={status} data={recent.map((entry) => ({ value: entry.vitals.temperature }))} />
          <VitalCard metric="activity" value={latest.vitals.activityScore.toFixed(0)} status={status} data={recent.map((entry) => ({ value: entry.vitals.activityScore }))} />
        </div>
      </section>
      <section aria-labelledby="caregiver-instructions">
        <h2 id="caregiver-instructions" className="mb-3 text-sm font-semibold text-text-strong">Instructions</h2>
        <div className="grid gap-3">
          <InstructionCard icon="bottleBaby" title="Continue regular feeding" description="Follow the feeding plan from your care team." />
          <InstructionCard icon="baby" title="Keep baby warm and covered" description="Follow your care team's instructions." />
          <InstructionCard icon="ankleBand" title="Keep the ankle band on" description="Check the fit using the device instructions." />
        </div>
      </section>
    </div>
  );
}
