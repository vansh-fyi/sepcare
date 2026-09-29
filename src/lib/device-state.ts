export type DeviceState = "healthy" | "medium" | "low" | "disconnected";

/** Presentation thresholds, independent of infant health/risk classification. */
export function getDeviceState(
  connected = true,
  battery?: number,
): DeviceState {
  if (!connected) return "disconnected";
  if (battery === undefined || !Number.isFinite(battery)) return "healthy";
  const level = clampBattery(battery);
  return level <= 20 ? "low" : level <= 50 ? "medium" : "healthy";
}

export function clampBattery(level: number): number {
  return Number.isFinite(level) ? Math.min(100, Math.max(0, level)) : 0;
}

export const DEVICE_STATE = {
  healthy: {
    tone: "safe",
    label: "Connected",
    tile: "bg-device-healthy-surface text-device-healthy-icon",
  },
  medium: {
    tone: "caution",
    label: "Medium battery",
    tile: "bg-device-medium-surface text-device-medium-icon",
  },
  low: {
    tone: "critical",
    label: "Low battery",
    tile: "bg-device-low-surface text-device-low-icon",
  },
  disconnected: {
    tone: "neutral",
    label: "Disconnected",
    tile: "bg-device-disconnected-surface text-device-disconnected-icon",
  },
} as const;
