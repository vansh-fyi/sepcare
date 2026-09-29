import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";
import { Progress } from "@/components/ui/progress";
import { clampBattery, DEVICE_STATE, getDeviceState } from "@/lib/device-state";

interface BatteryIndicatorProps extends ComponentProps<"div"> {
  level: number;
  charging?: boolean;
  connected?: boolean;
  showIcon?: boolean;
}
const TEXT = {
  safe: "text-safe-dark",
  caution: "text-caution-dark",
  critical: "text-critical-dark",
  neutral: "text-text-muted",
};

export function BatteryIndicator({
  level,
  charging = false,
  connected = true,
  showIcon = true,
  className,
  ...props
}: BatteryIndicatorProps) {
  const clamped = clampBattery(level);
  const { tone } = DEVICE_STATE[getDeviceState(connected, level)];
  return (
    <div
      data-slot="battery-indicator"
      data-charging={charging || undefined}
      className={cn("inline-flex w-32 min-w-0 items-center gap-2", className)}
      {...props}
    >
      {showIcon && (
        <Icon
          name={charging ? "charging" : "battery"}
          size={20}
          className={cn("shrink-0", TEXT[tone])}
        />
      )}
      <Progress
        value={clamped}
        tone={tone}
        className="min-w-0 flex-1"
        aria-label={
          props["aria-label"] ??
          (!connected
            ? "Last known battery level"
            : charging
              ? "Charging"
              : "Battery level")
        }
      />
      <span
        data-slot="battery-indicator-label"
        className={cn(
          "shrink-0 whitespace-nowrap text-[10px] font-bold tabular-nums",
          TEXT[tone],
        )}
      >
        {clamped}%
      </span>
    </div>
  );
}
