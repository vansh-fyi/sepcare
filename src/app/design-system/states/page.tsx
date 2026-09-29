import { Badge } from "@/components/ui/badge";
import { StatusCard } from "@/components/patterns/clinical-cards";
import { PageShell } from "@/components/page-shell";
const STATES = [
  {
    status: "safe",
    title: "Baby is resting safely",
    description: "Based on the latest available readings.",
    label: "Safe",
  },
  {
    status: "caution",
    title: "Needs attention",
    description: "Review the readings and contact the care team.",
    label: "Needs attention",
  },
  {
    status: "critical",
    title: "Take baby to hospital",
    description: "Contact emergency care now.",
    label: "Critical",
  },
] as const;
export default function StatusExamplesPage() {
  return (
    <PageShell
      title="Clinical status"
      description="Compare the shared status cards and badges. Sample messages show how the icon and text support each color."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {STATES.map(({ status, title, description, label }) => (
          <div className="grid content-start gap-5" key={status}>
            <Badge status={status} className="justify-self-start">
              {label}
            </Badge>
            <StatusCard
              status={status}
              title={title}
              description={description}
            />
          </div>
        ))}
      </div>
    </PageShell>
  );
}
