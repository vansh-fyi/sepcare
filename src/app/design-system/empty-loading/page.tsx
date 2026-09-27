"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageShell } from "@/components/page-shell";

/**
 * D-10 sample page 2 (DSYS-02/DSYS-03), rebuilt against the expanded D-12
 * component set (06-19). Renders one Card in empty-state and one in
 * loading-state, proving Card's structurally-invariant layout holds across
 * content states (DESIGN-SYSTEM.md §9 "layout never changes" rule).
 *
 * The loading-state example was originally a bespoke `animate-` + `pulse`
 * skeleton div with no relationship to any real component (06-01). Now that
 * a restyled `Progress` primitive exists (06-08), the loading state is a genuinely
 * progressing `Progress` bar instead — a real component demonstrating a
 * real in-flight sync, not a placeholder skeleton shape. The interval is
 * skipped entirely under `prefers-reduced-motion`, matching the original
 * page's own reduced-motion discipline; the value simply holds still.
 */
const LOADING_INTERVAL_MS = 900;
const LOADING_STEP = 17;

export default function EmptyLoadingDesignSystemPage() {
  const [syncProgress, setSyncProgress] = useState(12);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const id = window.setInterval(() => {
      setSyncProgress((current) =>
        current >= 100 ? LOADING_STEP : current + LOADING_STEP
      );
    }, LOADING_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, []);

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
            <h2 className="text-heading font-semibold text-text">
              Syncing device
            </h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Progress value={syncProgress} aria-label="Syncing device data" />
            <p className="text-caption text-text-secondary">
              Buffered readings will finish uploading once connectivity
              returns.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
