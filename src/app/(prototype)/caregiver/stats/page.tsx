import { StatsView } from "@/components/patterns/stats-view";
import { READINGS } from "@/lib/fixtures/readings";

export default function CaregiverStats({}: PageProps<"/caregiver/stats">) {
  return (
    <div className="flex flex-col gap-6">
      <StatsView entries={READINGS.entries} />
    </div>
  );
}
