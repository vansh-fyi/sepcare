import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * D-10 sample page 1 (DSYS-02/DSYS-03). Renders the three Badge/Card status
 * pairs — Safe, Caution, Critical — side by side (stacked on narrow
 * viewports) so all three tri-state colors are visible at once for
 * comparison, exercising the shared token set (globals.css) through real
 * restyled Card + Badge components (Plan 06-03).
 */
const STATUS_ROWS = [
  { status: "safe", label: "Stable" },
  { status: "caution", label: "Monitor" },
  { status: "critical", label: "Critical" },
] as const;

export default function StatesDesignSystemPage() {
  return (
    <div className="flex flex-col gap-6 p-8 md:flex-row">
      {STATUS_ROWS.map(({ status, label }) => (
        <Card key={status} className="flex-1">
          <CardHeader>
            <Badge status={status}>{label}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-body text-text-secondary">
              Example {status} status card.
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
