"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL } from "@/lib/fixtures/risk-status";
import { InfantStatusCard, type InfantStatusCardProps } from "./status-summary-cards";

/** Prototype composition: the emergency action demonstrates feedback only. */
export function InfantStatusSection({ infant }: Pick<InfantStatusCardProps, "infant">) {
  const [feedback, setFeedback] = useState("");
  return (
    <section aria-label="Infant status summary" className="flex flex-col items-center gap-3">
      <InfantStatusCard infant={infant} onCallAmbulance={() => setFeedback("Example only. No call was placed.")} />
      <Badge status={infant.status}>{STATUS_LABEL[infant.status]}</Badge>
      {feedback && <p role="status" className="text-sm text-text-secondary">{feedback}</p>}
    </section>
  );
}
