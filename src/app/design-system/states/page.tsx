import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";

/**
 * D-10 sample page 1 (DSYS-02/DSYS-03). Renders the three Badge/Card status
 * pairs — Safe, Caution, Critical — side by side (stacked on narrow
 * viewports) so all three tri-state colors are visible at once for
 * comparison, exercising the shared token set (globals.css) through real
 * restyled Card + Badge components (Plan 06-03).
 */
const STATUS_ROWS = [
  {
    status: "safe",
    label: "Stable",
    copy: "All monitored vitals are within the expected baseline range.",
  },
  {
    status: "caution",
    label: "Monitor",
    copy: "A trend is developing — keep a close eye over the next few hours.",
  },
  {
    status: "critical",
    label: "Critical",
    copy: "Multiple systems abnormal and trending together — escalate now.",
  },
] as const;

export default function StatesDesignSystemPage() {
  return (
    <PageShell
      title="Status states"
      description="Safe, Caution, and Critical rendered side by side through the real Card + Badge components and the shared token set — never color alone."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {STATUS_ROWS.map(({ status, label, copy }) => (
          <Card key={status}>
            <CardHeader>
              <Badge status={status}>{label}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-body text-text-secondary">{copy}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
