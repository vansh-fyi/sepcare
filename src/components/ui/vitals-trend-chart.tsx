"use client"

import * as React from "react"
import { CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export type VitalsTrendAxisId = "left" | "right"

export interface VitalsTrendSeries {
  /** Data key this series reads from each row in `data`. Also the `ChartConfig` key. */
  key: string
  /** Human-readable label for the tooltip/legend. */
  label: string
  /** CSS-variable color reference, e.g. `var(--color-critical)`. Never a hardcoded hex. */
  color: string
  /**
   * Which Y-axis this series plots against. Defaults to `"left"`. Supply
   * `"right"` on at least one series to opt into the dual-axis layout (e.g.
   * a pulse-like series on `"left"`, an SpO2-like series on `"right"` with
   * its own tighter domain). A single-series chart — matching Figma node
   * `203-13216`'s real "Perfusion Index" frame — only ever renders the left
   * axis; the right axis is not rendered at all unless a series uses it.
   */
  yAxisId?: VitalsTrendAxisId
  /** Optional fixed domain for this series' axis, e.g. `[90, 100]`. */
  domain?: [number, number]
  /** Whether this series renders dot markers at each data point. Defaults to `true`, matching the Figma-extracted frame. */
  showDots?: boolean
}

export interface VitalsTrendChartProps {
  /** Generic row shape — not hardcoded to pulse/spo2 field names, so Phase 7 can feed real vitals field names. */
  data: Array<Record<string, number | string>>
  series: VitalsTrendSeries[]
  /** Data key used for the X-axis (e.g. an hourly time label). */
  xKey: string
  /** Fixed chart height in px. Kept identical between the empty and populated states — no reflow. */
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
 * Larger analytics chart composing `chart.tsx`'s `ChartContainer`/hover-popover/
 * legend chrome — the fully-labeled use case that primitive exists for, unlike
 * the chromeless `Sparkline`. Built on Recharts' composable `YAxis`/`yAxisId`
 * pattern so a caller can opt into a genuine two-scale layout (one axis per
 * series group) without the component forcing a second axis onto data that
 * doesn't need one. See `vitals-trend-chart.DESIGN.md`.
 */
export function VitalsTrendChart({
  data,
  series,
  xKey,
  height = 240,
  className,
}: VitalsTrendChartProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  const usesRightAxis = series.some((s) => s.yAxisId === "right")
  const showLegend = series.length > 1

  const leftDomain = series.find((s) => (s.yAxisId ?? "left") === "left")
    ?.domain
  const rightDomain = series.find((s) => s.yAxisId === "right")?.domain

  const chartConfig = React.useMemo<ChartConfig>(
    () =>
      series.reduce<ChartConfig>((config, s) => {
        config[s.key] = { label: s.label, color: s.color }
        return config
      }, {}),
    [series]
  )

  if (data.length === 0) {
    return (
      <div
        data-slot="vitals-trend-chart-empty"
        role="img"
        aria-label={EMPTY_COPY}
        style={{ height }}
        className={cn(
          "flex w-full items-center justify-center text-caption text-text-muted",
          className
        )}
      >
        {EMPTY_COPY}
      </div>
    )
  }

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("aspect-auto w-full", className)}
      style={{ height }}
    >
      <ComposedChart
        data={data}
        margin={{ top: 4, right: usesRightAxis ? 8 : 16, bottom: 4, left: 0 }}
      >
        <CartesianGrid vertical strokeDasharray="3 3" />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
        <YAxis
          yAxisId="left"
          tickLine={false}
          axisLine={false}
          domain={leftDomain}
        />
        {usesRightAxis ? (
          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            domain={rightDomain}
          />
        ) : null}
        <ChartTooltip content={<ChartTooltipContent />} />
        {showLegend ? <ChartLegend content={<ChartLegendContent />} /> : null}
        {series.map((s) => (
          <Line
            key={s.key}
            yAxisId={s.yAxisId ?? "left"}
            type="monotone"
            dataKey={s.key}
            stroke={`var(--color-${s.key})`}
            strokeWidth={2}
            dot={s.showDots ?? true}
            isAnimationActive={!prefersReducedMotion}
          />
        ))}
      </ComposedChart>
    </ChartContainer>
  )
}
