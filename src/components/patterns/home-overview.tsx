import type { ComponentProps, ReactNode } from "react";
import { HomeVitals } from "./home-vitals";
import { InfantStatusSection } from "./infant-status-section";
import { InstructionCard, type ClinicalStatus } from "./clinical-cards";

const COPY = {
  safe: { title: "Baby is resting safely", description: "Based on the latest available readings." },
  caution: { title: "Needs attention", description: "Review the readings and contact the care team." },
  critical: { title: "Take baby to hospital", description: "Contact emergency care now." },
};

/** Presentation shared by fixture-driven routes and illustrative screen examples. */
export function HomeOverview({ status, vitals, seeAll }: {
  status?: ClinicalStatus;
  vitals: ComponentProps<typeof HomeVitals>;
  seeAll: ReactNode;
}) {
  return <>
    {status ? <InfantStatusSection key={status} infant={{ status, ...COPY[status] }} /> : <p>Risk assessment is not available for this reading.</p>}
    <section aria-label="Vitals">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="text-sm font-semibold">Vitals</h1>
        {seeAll}
      </div>
      <HomeVitals {...vitals} />
    </section>
    <section aria-label="Instructions">
      <h2 className="mb-3 text-sm font-semibold text-text-strong">Instructions</h2>
      <div className="grid gap-3">
        {status === "critical" ? <InstructionCard icon="phone" title="Contact the care team" description="Follow the emergency instructions from your care team." />
          : status === "caution" ? <InstructionCard icon="phone" title="Review changes with the care team" description="Check the highlighted vitals and contact your care team." />
            : status === "safe" ? <>
              <InstructionCard icon="bottleBaby" title="Continue regular feeding" description="Follow the feeding plan from your care team." />
              <InstructionCard icon="baby" title="Keep baby warm and covered" description="Follow your care team's instructions." />
              <InstructionCard icon="ankleBand" title="Keep the ankle band on" description="Check the fit using the device instructions." />
            </> : <p className="text-sm text-text-muted">Contact the care team for guidance while risk assessment is unavailable.</p>}
      </div>
    </section>
  </>;
}
