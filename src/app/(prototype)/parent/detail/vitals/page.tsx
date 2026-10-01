import { VitalsView } from "@/components/patterns/vitals-view";
import { READINGS } from "@/lib/fixtures/readings";

export default function ParentVitals({}: PageProps<"/parent/detail/vitals">) {
  return (
    <div className="flex flex-col gap-6">
      <VitalsView entries={READINGS.entries} />
    </div>
  );
}
