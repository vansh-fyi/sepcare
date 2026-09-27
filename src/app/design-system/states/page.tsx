import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageShell } from "@/components/page-shell";

/**
 * D-10 sample page 1 (DSYS-02/DSYS-03), rebuilt against the expanded D-12
 * component set (06-19). Renders the three Badge/Card status pairs — Safe,
 * Caution, Critical — side by side (stacked on narrow viewports) so all
 * three tri-state colors are visible at once for comparison, exercising the
 * shared token set (globals.css) through real restyled Card + Badge
 * components (Plan 06-03, Figma-verified Plans 06-07/06-08).
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

/**
 * Widens the tri-state demonstration beyond Badge+Card (06-19 Task 1): the
 * same safe/caution/critical tokens applied to `Progress` — a second
 * component family entirely — proving the shared token set drives more than
 * one component. `Progress` (06-08) has no built-in status variant (it ships
 * a single green treatment verified against Figma node 203-11669), so the
 * caution/critical rows override the track/indicator via a `data-slot`
 * attribute selector scoped to this instance — a standard "reach into a
 * primitive's internal slot" pattern, not a change to progress.tsx itself.
 * Every color referenced (`bg-caution-soft`/`bg-caution`,
 * `bg-critical-soft`/`bg-critical-fill`) is an existing semantic token; no
 * new token is introduced by this page.
 */
const RISK_SCORE_ROWS = [
  {
    status: "safe",
    label: "Stable",
    value: 18,
    // Default Progress treatment already renders bg-safe-soft/bg-safe-fill.
    progressClassName: "",
    textClassName: "text-safe-dark",
  },
  {
    status: "caution",
    label: "Monitor",
    value: 54,
    progressClassName:
      "bg-caution-soft [&_[data-slot=progress-indicator]]:bg-caution",
    textClassName: "text-caution-dark",
  },
  {
    status: "critical",
    label: "Critical",
    value: 87,
    progressClassName:
      "bg-critical-soft [&_[data-slot=progress-indicator]]:bg-critical-fill",
    textClassName: "text-critical-dark",
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

      <section className="mt-10">
        <h2 className="mb-1 text-heading font-semibold text-text">
          Same tokens, a second component family
        </h2>
        <p className="mb-4 max-w-2xl text-body text-text-secondary">
          The tri-state token set is not a Badge-only convention — it drives
          any component family that renders a status. Here it colors a
          composite risk-score <code>Progress</code> bar instead of a Badge.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {RISK_SCORE_ROWS.map(
            ({ status, label, value, progressClassName, textClassName }) => (
              <Card key={status}>
                <CardHeader>
                  <Badge status={status}>{label}</Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Progress
                    value={value}
                    aria-label={`${label} composite risk score`}
                    className={progressClassName || undefined}
                  />
                  <p className={`text-caption font-semibold ${textClassName}`}>
                    {value}% composite risk score
                  </p>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </section>
    </PageShell>
  );
}
