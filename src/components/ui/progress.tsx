"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/** Accessible progress primitive with semantic track and fill colors. */
const TONES = {
  safe: { track: "bg-safe-soft", fill: "bg-safe-fill" },
  caution: { track: "bg-caution-soft", fill: "bg-caution" },
  critical: { track: "bg-critical-soft", fill: "bg-critical" },
  neutral: { track: "bg-bg", fill: "bg-text-muted" },
} as const;

function Progress({
  className,
  value,
  max = 100,
  tone = "safe",
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  tone?: keyof typeof TONES;
}) {
  const limit = max > 0 && Number.isFinite(max) ? max : 100;
  const resolvedValue = Math.max(
    0,
    Math.min(limit, Number.isFinite(value) ? value! : 0),
  );
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={resolvedValue}
      max={limit}
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full",
        TONES[tone].track,
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 transition-[transform] duration-[var(--duration-normal)] ease-out motion-reduce:transition-none",
          TONES[tone].fill,
        )}
        style={{
          transform: `translateX(-${100 - (resolvedValue / limit) * 100}%)`,
        }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
