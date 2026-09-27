"use client";

import { useState } from "react";
import { Sparkline } from "@/components/ui/sparkline";
import { Button } from "@/components/ui/button";

const RISING = [98, 100, 104, 110, 118, 128].map((value) => ({ value }));
const FALLING = [128, 122, 115, 108, 101, 96].map((value) => ({ value }));
const FLAT = [97, 98, 97, 98, 97, 98].map((value) => ({ value }));

/**
 * Client island for Sparkline's live empty-state toggle (06-18 Task 3).
 * `Sparkline` is already a Client Component ("use client" — Recharts'
 * `ResponsiveContainer` requires DOM measurement); this file only holds the
 * `useState` driving which of the three mock trend shapes render, or the
 * empty state for all three at once. Each instance's `height` prop stays
 * identical between states — no layout shift on toggle.
 */
export function SparklinePlayground() {
  const [empty, setEmpty] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        variant="secondary"
        onClick={() => setEmpty((value) => !value)}
      >
        {empty ? "Show mock trends" : "Show empty state"}
      </Button>
      <div className="grid grid-cols-1 gap-6 rounded-card-sm border border-border-subtle bg-bg p-8 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <p className="text-caption font-semibold text-text-muted">
            Rising
          </p>
          <Sparkline data={empty ? [] : RISING} color="var(--color-safe)" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-caption font-semibold text-text-muted">
            Falling
          </p>
          <Sparkline
            data={empty ? [] : FALLING}
            color="var(--color-critical)"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-caption font-semibold text-text-muted">Flat</p>
          <Sparkline data={empty ? [] : FLAT} color="var(--color-caution)" />
        </div>
      </div>
    </div>
  );
}
