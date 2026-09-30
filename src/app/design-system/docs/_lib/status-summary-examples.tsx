"use client";

import { useState } from "react";
import { Preview } from "@/components/docs/documentation";
import { InfantStatusCard } from "@/components/patterns/status-summary-cards";
import { InfantStatusSection } from "@/components/patterns/infant-status-section";
import type { ClinicalStatus } from "@/components/patterns/clinical-cards";

const INFANT = {
  safe: { title: "Baby is resting safely", description: "Based on the latest available readings." },
  caution: { title: "Needs attention", description: "Review the readings and contact the care team." },
  critical: { title: "Take baby to hospital", description: "Contact emergency care now." },
};

export function StatusSummaryExample() {
  const [status, setStatus] = useState<ClinicalStatus>("safe");
  const [feedback, setFeedback] = useState("");
  return (
    <Preview
      tone="canvas"
      caption={feedback || "Sample infant status. Call ambulance demonstrates feedback only; no call is placed."}
      code={`import { useState } from "react";\nimport { InfantStatusCard } from "@/components/patterns/status-summary-cards";\n\nconst [feedback, setFeedback] = useState("");\n\n<InfantStatusCard\n  infant={{ status: "${status}", title: "${INFANT[status].title}", description: "${INFANT[status].description}" }}\n  onCallAmbulance={() => setFeedback("Example only. No call was placed.")}\n/>`}
      controls={
        <>
          <label>Infant status{" "}
            <select value={status} onChange={(event) => setStatus(event.target.value as ClinicalStatus)}>
              <option value="safe">Safe</option>
              <option value="caution">Caution</option>
              <option value="critical">Critical</option>
            </select>
          </label>
        </>
      }
    >
      <div className="w-full max-w-lg">
        <InfantStatusCard infant={{ status, ...INFANT[status] }} onCallAmbulance={() => setFeedback("Example only. No call was placed.")} />
      </div>
    </Preview>
  );
}

export function StatusSummaryVariations() {
  return (
    <Preview tone="canvas" caption="Sample prototype section: the Badge adds an explicit status word below the card. Call ambulance only demonstrates feedback."
      code={'import { InfantStatusSection } from "@/components/patterns/infant-status-section";\n\n<InfantStatusSection infant={{ status: "critical", title: "Take baby to hospital", description: "Contact emergency care now." }} />'}
    >
      <div className="w-full max-w-lg">
        <InfantStatusSection infant={{ status: "critical", ...INFANT.critical }} />
      </div>
    </Preview>
  );
}
