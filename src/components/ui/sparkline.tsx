"use client"

import * as React from "react"
import { Line, LineChart, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

export type SparklinePoint = { value: number }

export interface SparklineProps {
  /** Trend data points, oldest first. An empty array renders the empty state. */
  data: SparklinePoint[]
  /**
   * Line stroke color. Defaults to the safe/positive semantic token, matching
   * `06-RESEARCH.md`'s Pattern 1. Pass `var(--color-caution)`/`var(--color-critical)`
   * for status-tinted usage elsewhere, or `var(--color-text-inverse)` when embedding
   * inside a full-bleed gradient Vital Stat Card (Figma node `266-9344`), where the
   * line renders white against the card's own status-colored gradient background
   * rather than carrying its own status color — see `sparkline.DESIGN.md`.
   */
  color?: string
  /** Fixed slot height in px. Figma's Vital Stat Card sparkline slot is 26px tall. */
  height?: number
  className?: string
}

const EMPTY_COPY = "No data for this range yet."

/**
 * Detects `prefers-reduced-motion` client-side. Recharts' own line-draw entrance
 * animation is JS-driven (react-smooth), not a CSS transition Tailwind's
 * `motion-reduce:` variant can intercept, so it must be disabled via the
 * `isAnimationActive` prop instead.
 */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(query.matches)
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener("change", listener)
    return () => query.removeEventListener("change", listener)
  }, [])

  return reduced
}

/**
 * Chromeless inline trend glyph for vital-stat cards — a single `Line` and
 * nothing else; no axis/grid/hover-popover/key chrome of any kind.
 * Deliberately distinct from the `Chart` primitive (`@/components/ui/chart`),
 * which exists for the opposite, fully-labeled use case (see
 * `06-UI-SPEC.md`'s Sparkline row). Must never gain chart chrome — that is
 * `Chart`'s job, not this component's. Carries its own `"use client"`
 * boundary (Recharts' `ResponsiveContainer` requires DOM measurement); a
 * Server Component composing this stays a Server Component and only imports
 * this client leaf. See `sparkline.DESIGN.md`.
 */
export function Sparkline({
  data,
  color = "var(--color-safe)",
  height = 26,
  className,
}: SparklineProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (data.length === 0) {
    return (
      <div
        data-slot="sparkline-empty"
        aria-hidden="true"
        style={{ height }}
        className={cn(
          "flex w-full items-center justify-center overflow-hidden truncate px-1 text-[10px] leading-none text-text-muted",
          className
        )}
      >
        {EMPTY_COPY}
      </div>
    )
  }

  return (
    <div
      data-slot="sparkline"
      aria-hidden="true"
      style={{ height }}
      className={cn("w-full", className)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
        >
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={!prefersReducedMotion}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
