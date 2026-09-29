import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { PulseWave } from "@/components/motion/pulse-wave";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import type { ClinicalStatus } from "./clinical-cards";

export interface InfantStatusCardProps {
  onCallAmbulance?: () => void;
  infant: { status: ClinicalStatus; title: string; description: string };
}

/** Full-width infant summary with the status face above the text. */
export function InfantStatusCard({ infant, onCallAmbulance }: InfantStatusCardProps) {
  return (
    <Card role="group" aria-label="Infant status" className="flex w-full min-w-0 flex-col items-center gap-4 py-6 text-center">
      <PulseWave emoji tone={infant.status} size="xl" />
      <div className="flex flex-col gap-2">
        <CardTitle className="font-heading text-xl font-bold">{infant.title}</CardTitle>
        {infant.status === "critical" && onCallAmbulance ? (
          <Button tone="critical" onClick={onCallAmbulance} icon={<Icon name="phone" size={18} />}>
            Call ambulance
          </Button>
        ) : <CardDescription>{infant.description}</CardDescription>}
      </div>
    </Card>
  );
}
