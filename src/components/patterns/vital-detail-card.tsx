import { Icon, type IconName } from "@/components/icon";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import {
  VitalsTrendChart,
  type VitalsTrendChartProps,
} from "@/components/ui/vitals-trend-chart";
import type { ClinicalStatus } from "./clinical-cards";
import { cn } from "@/lib/utils";

export const UNAVAILABLE_VITAL_DESCRIPTION = "Not yet available — awaiting device support.";

export const VITAL_DETAILS: {
  title: string;
  icon: IconName;
  description: string;
}[] = [
  {
    title: "Thermoregulation",
    icon: "temperature",
    description: "Hypothermia trend. Severe dropping over 4h",
  },
  {
    title: "Cardiac Autonomic",
    icon: "pulse",
    description: UNAVAILABLE_VITAL_DESCRIPTION,
  },
  {
    title: "Perfusion Index",
    icon: "perfusion",
    description: UNAVAILABLE_VITAL_DESCRIPTION,
  },
  {
    title: "HR / Temp Ratio",
    icon: "ratio",
    description: "All systems stable",
  },
  {
    title: "Respiratory Pattern",
    icon: "lungs",
    description: UNAVAILABLE_VITAL_DESCRIPTION,
  },
  {
    title: "Activity Level",
    icon: "connected",
    description: "All systems stable",
  },
];

export function VitalDetailCard({
  title,
  icon,
  description,
  critical = false,
  status,
  chart,
  value,
  unit,
  rangeLabel,
}: {
  title: string;
  icon: IconName;
  description: string;
  critical?: boolean;
  status?: ClinicalStatus | "unavailable";
  value?: string | number;
  unit?: string;
  rangeLabel?: string;
  chart?: Omit<VitalsTrendChartProps, "className">;
}) {
  const tone = status ?? (critical ? "critical" : "safe");
  const showChart = Boolean(chart) && tone !== "unavailable";
  const treatment = {
    unavailable: { tile: "bg-neutral-100 text-text-muted", text: "text-text-muted", label: "Unavailable" },
    safe: { tile: "bg-safe-soft text-safe", text: "text-safe", label: "Stable" },
    caution: { tile: "bg-caution-soft text-caution-dark", text: "text-caution-dark", label: "Needs attention" },
    critical: { tile: "bg-critical-soft text-critical", text: "text-critical", label: "Critical" },
  }[tone];
  const latest = chart?.data.at(-1);
  const latestValue =
    value ?? (chart?.series[0] ? latest?.[chart.series[0].key] : undefined);
  const times = chart?.timeAxis
    ? chart.data.map((row) => Number(row[chart.xKey])).filter(Number.isFinite)
    : [];
  const formatTime = (time: number) =>
    new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  const start = times.length ? Math.min(...times) : undefined;
  const end = times.length ? Math.max(...times) : undefined;
  const dateLabel =
    start === undefined
      ? ""
      : new Date(start).toLocaleDateString([], {
          day: "numeric",
          month: "short",
        });
  const range =
    rangeLabel ??
    (start !== undefined && end !== undefined
      ? `${dateLabel} · ${formatTime(start)}–${formatTime(end)}`
      : "No readings for this range");
  const series = chart?.series.map((item) => ({
    ...item,
    color: status || critical ? `var(--color-${tone})` : item.color,
  }));
  return (
    <Card className="min-w-0 p-5">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-icon-btn",
            treatment.tile,
          )}
        >
          <Icon name={icon} size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-1 flex items-center gap-1.5">
            {showChart && chart && <Icon name="calendar" size={13} />}
            {tone === "unavailable" ? UNAVAILABLE_VITAL_DESCRIPTION : chart ? range : description}
          </CardDescription>
        </div>
        {tone !== "unavailable" && (showChart || value !== undefined) && (
          <div
            data-slot="vital-value"
            className={cn(
              "shrink-0 text-right tabular-nums",
              treatment.text,
            )}
          >
            <p className="font-heading text-2xl font-bold">
              {latestValue ?? "—"}
              {unit && <span className="ml-1 text-xs font-medium">{unit}</span>}
            </p>
            <span className="sr-only">
              {treatment.label} · Latest reading
            </span>
          </div>
        )}
      </div>
      {showChart && chart && (
        <div className="mt-5">
          <VitalsTrendChart
            {...chart}
            series={series ?? chart.series}
            height={chart.height ?? 180}
          />
        </div>
      )}
    </Card>
  );
}
