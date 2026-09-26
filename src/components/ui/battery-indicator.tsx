import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/icon"
import { Progress } from "@/components/ui/progress"

/**
 * Wraps the restyled `Progress` primitive with the Home screen device-status
 * header's battery-level presentation (D-12/D-16). No card node among this
 * phase's 6 inspected Figma frames shows a dedicated battery-glyph treatment
 * — node `203-11669`'s progress bar IS the battery-level visual (a generic
 * percentage-driven horizontal bar, not a notched battery shape); this
 * composite exists because `06-UI-SPEC.md`'s Domain composites table
 * explicitly declares it ("Wraps `Progress` with a battery-shaped track;
 * reuse the existing `battery`/`charging` `Icon` glyphs for the terminal nub
 * rather than drawing a new one"). The leading `Icon` glyph — which already
 * has the battery rect + terminal-nub shape drawn into its own path data —
 * supplies that battery silhouette; the bar itself stays the plain
 * percentage-driven `Progress` track, not a second hand-drawn SVG shape.
 *
 * Composed by the Home-proof device status header (06-20), per Figma node
 * `266-9257`'s device-status-header region.
 */
interface BatteryIndicatorProps
  extends Omit<React.ComponentProps<"div">, "className"> {
  /** Battery charge level, 0–100. Out-of-range values are clamped. */
  level: number
  /** Shows the charging glyph in place of the plain battery glyph. */
  charging?: boolean
  className?: string
}

function BatteryIndicator({
  level,
  charging = false,
  className,
  ...props
}: BatteryIndicatorProps) {
  const clamped = Math.min(100, Math.max(0, level))

  return (
    <div
      data-slot="battery-indicator"
      data-charging={charging || undefined}
      className={cn("inline-flex items-center gap-2", className)}
      {...props}
    >
      <Icon
        name={charging ? "charging" : "battery"}
        size={20}
        className="shrink-0 text-icon-fill-dark"
      />
      <Progress
        value={clamped}
        className="w-16"
        aria-label={charging ? "Charging" : "Battery level"}
      />
      <span
        data-slot="battery-indicator-label"
        className="text-[10px] font-bold text-safe"
      >
        {clamped}%
      </span>
    </div>
  )
}

export { BatteryIndicator }
