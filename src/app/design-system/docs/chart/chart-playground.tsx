"use client";

import { useState } from "react";
import { VitalsTrendChart } from "@/components/ui/vitals-trend-chart";
import { Button } from "@/components/ui/button";

const MOCK_DATA = [
  { time: "8:00", perfusion: 100 },
  { time: "10:00", perfusion: 99 },
  { time: "12:00", perfusion: 96 },
  { time: "14:00", perfusion: 94 },
];

/**
 * Client island for VitalsTrendChart's live empty-state toggle (06-18 Task
 * 3). `VitalsTrendChart` is already a Client Component ("use client" —
 * Recharts' `ResponsiveContainer` requires DOM measurement); this file only
 * holds the `useState` driving which data array it receives. The
 * component's own `height` prop stays identical between the two states, so
 * toggling produces no layout shift — verify this live by clicking and
 * watching the surrounding border stay put.
 */
export function ChartPlayground() {
  const [empty, setEmpty] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        variant="secondary"
        onClick={() => setEmpty((value) => !value)}
      >
        {empty ? "Show mock data" : "Show empty state"}
      </Button>
      <div className="rounded-card-sm border border-border-subtle bg-bg p-4">
        <VitalsTrendChart
          xKey="time"
          data={empty ? [] : MOCK_DATA}
          series={[
            {
              key: "perfusion",
              label: "Perfusion Index",
              color: "var(--color-critical)",
            },
          ]}
        />
      </div>
    </div>
  );
}
