"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

/**
 * Restyled onto the project's semantic token layer. Figma node `203-11669`
 * (Device Status Card WITH progress bar — D-16's resolved disposition: a
 * generic percentage-driven horizontal bar, not a battery glyph) is the only
 * real per-node extraction available for this primitive: 6px-tall track,
 * `bg-safe-soft` (green-100), `bg-safe-fill` (green-600) indicator, 10px Bold
 * `text-safe` (green-700) percentage label (rendered by the consumer, not
 * built into this primitive — see `battery-indicator.tsx` for the composed
 * usage). No second visual treatment has been extracted anywhere in this
 * phase's Figma data, so this stays a single treatment (no CVA `variant`
 * axis) rather than guessing at variants that don't exist yet.
 *
 * Radius uses the existing `rounded-full` (`--radius-full`) token rather than
 * a new near-duplicate 5px token — Figma's exact 5px value is visually
 * indistinguishable from full-round on a 6px-tall track (a radius only needs
 * to exceed half the track height to render fully rounded), and
 * `06-UI-SPEC.md`'s Radius table already assigns `--radius-full` to
 * "BatteryIndicator track" for this exact usage.
 */
function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-safe-soft",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-safe-fill transition-[transform] duration-[var(--duration-normal)] ease-out"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
