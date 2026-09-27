"use client";

import { useState } from "react";
import { Badge, type BadgeStatus } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

/**
 * Client island for Badge's live status picker (06-18 Task 1). Cycles the
 * real `Badge` through all 3 locked status values and renders a side-by-side
 * "color alone" mock — a colored pill with no icon and no text label,
 * crossed out with a red slash — so DESIGN-SYSTEM.md §9's multi-modal rule
 * (a status must never be color-only) is visible, not just described in
 * prose. No entrance animation on mount (emil-animations principle 8) —
 * only ToggleGroup's own existing press-feedback transition.
 */
const STATUS_OPTIONS: { value: BadgeStatus; label: string }[] = [
  { value: "safe", label: "Safe" },
  { value: "caution", label: "Caution" },
  { value: "critical", label: "Critical" },
];

const COLOR_ONLY_BG: Record<BadgeStatus, string> = {
  safe: "bg-safe-soft",
  caution: "bg-caution-soft",
  critical: "bg-critical-soft",
};

export function BadgePlayground() {
  const [status, setStatus] = useState<BadgeStatus>("safe");
  const selected = STATUS_OPTIONS.find((option) => option.value === status)!;

  return (
    <div className="flex flex-col gap-6">
      <ToggleGroup
        type="single"
        value={status}
        onValueChange={(value) => {
          if (value) setStatus(value as BadgeStatus);
        }}
      >
        {STATUS_OPTIONS.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="grid grid-cols-2 gap-6 rounded-card-sm border border-border-subtle bg-bg p-8">
        <div className="flex flex-col items-center gap-3">
          <Badge status={status}>{selected.label}</Badge>
          <p className="text-center text-caption font-semibold text-safe">
            Correct — icon + label + color together
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="relative inline-flex h-8 w-20 shrink-0 items-center justify-center">
            <div
              className={cn(
                "absolute inset-0 rounded-full",
                COLOR_ONLY_BG[status]
              )}
            />
            <div className="absolute inset-0 rounded-full border-2 border-critical" />
            <div className="absolute h-0.5 w-[85%] rotate-45 rounded-full bg-critical" />
          </div>
          <p className="text-center text-caption font-semibold text-critical">
            Forbidden — color alone, no icon or label
          </p>
        </div>
      </div>
    </div>
  );
}
