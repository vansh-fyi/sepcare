"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { BatteryIndicator } from "@/components/ui/battery-indicator";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";

/**
 * Client island for Progress/BatteryIndicator's live level slider (06-18
 * Task 1). A single 0-100 range input drives both the generic `Progress`
 * bar and the `BatteryIndicator` composite simultaneously, so the reader
 * sees exactly how one shared restyled primitive (`progress.tsx`) diverges
 * visually for the two use cases. No entrance animation on mount
 * (emil-animations principle 8) — only `Progress`'s own existing fill-width
 * transition.
 */
export function ProgressPlayground() {
  const [level, setLevel] = useState(72);
  const [charging, setCharging] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="progress-level-slider"
          className="text-label font-semibold text-text tabular-nums"
        >
          Level: {level}%
        </label>
        <input
          id="progress-level-slider"
          type="range"
          min={0}
          max={100}
          value={level}
          onChange={(event) => setLevel(Number(event.target.value))}
          className="w-full max-w-sm accent-[var(--color-brand-fill)]"
        />
      </div>

      <Field orientation="horizontal" className="w-fit">
        <Checkbox
          id="progress-charging-toggle"
          checked={charging}
          onCheckedChange={(value) => setCharging(value === true)}
        />
        <FieldContent>
          <FieldLabel htmlFor="progress-charging-toggle">
            Charging
          </FieldLabel>
        </FieldContent>
      </Field>

      <div className="grid grid-cols-1 gap-8 rounded-card-sm border border-border-subtle bg-bg p-8 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <p className="text-caption font-semibold text-text-muted">
            Progress (generic)
          </p>
          <div className="flex items-center gap-2">
            <Progress value={level} className="w-32" />
            <span className="text-[10px] font-bold text-safe tabular-nums">
              {level}%
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-caption font-semibold text-text-muted">
            BatteryIndicator (domain composite)
          </p>
          <BatteryIndicator level={level} charging={charging} />
        </div>
      </div>
    </div>
  );
}
