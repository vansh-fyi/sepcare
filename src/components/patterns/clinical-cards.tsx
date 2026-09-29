import { ContentTileRow } from "./content-tile-row";
import type { ReactNode } from "react";
import { PulseWave } from "@/components/motion/pulse-wave";
import { Icon, type IconName } from "@/components/icon";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "@/components/ui/item";
import { BatteryIndicator } from "@/components/ui/battery-indicator";
import { DeviceTileRow } from "./device-tile-row";
import { DEVICE_STATE, getDeviceState } from "@/lib/device-state";
import { Sparkline, type SparklinePoint } from "@/components/ui/sparkline";
import { cn } from "@/lib/utils";

export type ClinicalStatus = "safe" | "caution" | "critical";
const STATUS_TILES = {
  safe: "bg-status-tile text-text-strong",
  caution: "bg-caution-soft text-caution-dark",
  critical: "bg-critical-soft text-critical-dark",
};

export function StatusCard({
  status,
  title,
  description,
  children,
  className,
}: {
  status: ClinicalStatus;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <ContentTileRow
        tileClassName={STATUS_TILES[status]}
        tile={
          <PulseWave emoji size="lg" tone={status} />
        }
      >
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base leading-snug">{title}</CardTitle>
          <CardDescription className="mt-1 text-text-hero-muted">
            {description}
          </CardDescription>
          {children && <div className="mt-3">{children}</div>}
        </div>
      </ContentTileRow>
    </Card>
  );
}

export function DeviceCard({
  name,
  identifier,
  battery,
  connected = true,
  action,
  className,
}: {
  name: string;
  identifier: string;
  battery?: number;
  connected?: boolean;
  action?: ReactNode;
  className?: string;
}) {
  const state = getDeviceState(connected, battery);
  return (
    <Card className={cn("shadow-card-device", className)}>
      <DeviceTileRow connected={connected} battery={battery}>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="break-words text-sm">{name}</CardTitle>
          {action}
        </div>
        <CardDescription className="mt-1">{identifier}</CardDescription>
        {state !== "healthy" && (
          <CardDescription className="mt-1">
            {DEVICE_STATE[state].label}
          </CardDescription>
        )}
        {battery !== undefined && Number.isFinite(battery) && (
          <BatteryIndicator
            level={battery}
            connected={connected}
            showIcon={false}
            className="mt-3 w-full"
            aria-label={`${name} battery${!connected ? " (last known)" : ""}`}
          />
        )}
      </DeviceTileRow>
    </Card>
  );
}

const METRICS = {
  pulse: {
    label: "Pulse",
    icon: "heartRate",
    fill: "bg-[image:var(--gradient-metric-pulse)]",
  },
  temperature: {
    label: "Temp",
    icon: "temperature",
    fill: "bg-[image:var(--gradient-metric-temp)]",
  },
  activity: {
    label: "Activity",
    icon: "activity",
    fill: "bg-[image:var(--gradient-metric-activity)]",
  },
} as const;

export function VitalCard({
  metric,
  value,
  unit,
  data,
  status,
  className,
}: {
  metric: keyof typeof METRICS;
  value: string;
  unit?: string;
  data?: SparklinePoint[];
  status?: ClinicalStatus;
  className?: string;
}) {
  const spec = METRICS[metric];
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col justify-between gap-4 rounded-card p-4 text-text-inverse",
        status === "critical" ? "bg-critical" : status === "caution" ? "bg-caution" : spec.fill,
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption font-semibold">{spec.label}</span>
        <Icon name={spec.icon} size={14} />
      </div>
      {data ? (
        <>
          <Sparkline data={data} color="var(--color-text-inverse)" />
          <p className="flex flex-wrap items-baseline gap-1 tabular-nums">
            <span className="font-heading text-2xl font-bold">{value}</span>
            <span className="text-[10px]">{unit}</span>
          </p>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-1">
          <Icon name={status === "critical" ? "critical" : status === "caution" ? "warning" : "safe"} size={30} />
          <span className="font-heading text-2xl font-bold">{value}</span>
        </div>
      )}
    </div>
  );
}

export function InstructionCard({
  icon,
  title,
  description,
  className,
}: {
  icon: IconName;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <Card className={cn("p-0", className)}>
      <Item className="flex-nowrap gap-3.5 p-3.5">
        <ContentTileRow
          tileClassName="bg-icon-tile-neutral text-text-subtle"
          tile={<Icon name={icon} size={24} />}
        >
          <ItemContent>
            <ItemTitle className="text-sm leading-snug">{title}</ItemTitle>
            <ItemDescription className="line-clamp-none text-xs">
              {description}
            </ItemDescription>
          </ItemContent>
        </ContentTileRow>
      </Item>
    </Card>
  );
}
