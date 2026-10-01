import { Badge } from "@/components/ui/badge";
import { BatteryIndicator } from "@/components/ui/battery-indicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DeviceProfile } from "@/lib/fixtures/device";
import { ConnectionStatus } from "./connection-status";
import { DeviceTileRow } from "./device-tile-row";

const CONTACT_LABEL = { safe: "Good contact", caution: "Check placement", critical: "No contact" };

export function DeviceDetails({ device, onConnectionChange }: { device: DeviceProfile; onConnectionChange?: () => void }) {
  return <Card className="space-y-6">
    <DeviceTileRow connected={device.connected} battery={device.battery}>
      <h2 className="break-words font-heading text-xl font-bold text-text-strong">{device.name}</h2>
      <p className="mt-1 text-caption text-text-muted">{device.id}</p>
    </DeviceTileRow>
    <div className="space-y-2">
      <p className="text-sm font-semibold">{device.connected ? "Battery" : "Last known battery"}</p>
      <BatteryIndicator level={device.battery} connected={device.connected} className="w-full" />
    </div>
    <div className="space-y-2">
      <p className="text-sm font-semibold">{device.connected ? "Connection" : "Disconnected"}</p>
      <ConnectionStatus lastSyncedAt={device.lastSyncedAt} forceState={device.connected ? undefined : "stale"} />
    </div>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-semibold">Sensor contact</p>
      <Badge status={device.sensorContact}>{CONTACT_LABEL[device.sensorContact]}</Badge>
    </div>
    <Button tone="neutral" onClick={onConnectionChange} disabled={!onConnectionChange}>{device.connected ? "Disconnect" : "Connect"}</Button>
  </Card>;
}
