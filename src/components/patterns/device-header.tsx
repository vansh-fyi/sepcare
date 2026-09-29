import { Wordmark } from "@/components/wordmark";
import { DeviceTileRow } from "./device-tile-row";
import { clampBattery, DEVICE_STATE, getDeviceState } from "@/lib/device-state";
import { Icon } from "@/components/icon";
import { PulseWave } from "@/components/motion/pulse-wave";
import { Button } from "@/components/ui/button";

const BATTERY_TEXT = {
  healthy: "text-device-header-battery-healthy",
  medium: "text-device-header-battery-medium",
  low: "text-device-header-battery-low",
  disconnected: "text-device-header-battery-disconnected",
};

export interface DeviceHeaderProps {
  deviceName: string;
  connected?: boolean;
  battery?: number;
  slowInternet?: boolean;
  onReadings: () => void;
  onSettings: () => void;
}

/** Device connection is independent of the baby's clinical status. */
export function DeviceHeader({
  deviceName,
  connected = true,
  battery,
  slowInternet = false,
  onReadings,
  onSettings,
}: DeviceHeaderProps) {
  const actionColors = {
    fill: "var(--color-device-header-action)",
    fillHover: "var(--color-text-muted)",
    fillActive: "var(--color-text-secondary)",
    onFill: "var(--color-text-inverse)",
  };
  return (
    <header className="shrink-0 rounded-b-[var(--radius-header)] bg-device-header-surface px-6 pb-6 pt-5 text-text-inverse">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-3">
          <Wordmark size="lg" />
          <div className="flex gap-2">
            <Button
              colors={actionColors}
              radius="lg"
              aria-label="View readings"
              onClick={onReadings}
              icon={<Icon name="monitoring" size={22} />}
            />
            <Button
              colors={actionColors}
              radius="lg"
              aria-label="Device settings"
              onClick={onSettings}
              icon={<Icon name="wearable" size={22} />}
            />
          </div>
        </div>
        <DeviceTileRow className="mt-5" connected={connected} battery={battery}>
          <div className="min-w-0">
            <p className="break-words font-heading text-xl font-bold">
              {deviceName}
            </p>
            <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
              {battery !== undefined && Number.isFinite(battery) && (
                <span className="inline-flex shrink-0 items-center gap-2">
                <span
                  className={`shrink-0 whitespace-nowrap font-bold tabular-nums ${BATTERY_TEXT[getDeviceState(connected, battery)]}`}
                  aria-label={`${connected ? "Battery" : "Last known battery"}: ${clampBattery(battery)}%`}
                >
                  {clampBattery(battery)}%
                </span>
                <span aria-hidden="true" className="h-4 w-px bg-current opacity-30" />
                </span>
              )}
              <span className="inline-flex min-w-0 items-center gap-2">
                <PulseWave
                  size="sm"
                  emoji={false}
                  tone={!connected ? "neutral" : slowInternet ? "caution" : DEVICE_STATE[getDeviceState(connected, battery)].tone}
                  active={connected}
                />
                <span>{!connected ? "Wearable Disconnected" : slowInternet ? "Slow internet" : "Wearable Connected"}</span>
              </span>
            </p>
          </div>
        </DeviceTileRow>
      </div>
    </header>
  );
}
