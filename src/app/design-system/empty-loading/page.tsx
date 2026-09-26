import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";

/**
 * D-10 sample page 2 (DSYS-02/DSYS-03). Renders one Card in empty-state and
 * one in loading-state, proving Card's structurally-invariant layout holds
 * across content states (DESIGN-SYSTEM.md §9 "layout never changes" rule).
 * The loading-state skeleton drives its pulse duration from the
 * `--duration-slow` token via arbitrary-value syntax (Tailwind v4 has no
 * `--duration-*` utility-generating namespace — see 06-03-SUMMARY.md) and
 * is skipped entirely under `prefers-reduced-motion`.
 */
export default function EmptyLoadingDesignSystemPage() {
  return (
    <PageShell
      title="Empty & loading states"
      description="Card's DOM structure never changes between content states — only what's inside CardContent differs."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-heading font-semibold text-text">
              No readings yet
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-body text-text-secondary">
              Vitals will appear here once the device starts sending data.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-heading font-semibold text-text">Loading</h2>
          </CardHeader>
          <CardContent>
            <div
              aria-hidden="true"
              className="h-24 w-full rounded-card-sm bg-surface-soft-blue animate-pulse [animation-duration:var(--duration-slow)] motion-reduce:animate-none"
            />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
