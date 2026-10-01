import { VitalsView } from "@/components/patterns/vitals-view";
import { READINGS } from "@/lib/fixtures/readings";

export default function CaregiverVitals({}: PageProps<"/caregiver/vitals">) {
  return (
    <div className="flex flex-col gap-6">
      <VitalsView entries={READINGS.entries} />
    </div>
  );
}
