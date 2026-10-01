import Link from "next/link";
import { Item, ItemGroup } from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import type { DeviceProfile } from "@/lib/fixtures/device";
import { DeviceCard } from "./clinical-cards";

export function DeviceSelectList({ devices, hrefFor }: { devices: DeviceProfile[]; hrefFor: (device: DeviceProfile) => string }) {
  if (devices.length === 0) return <div className="space-y-4">
    <p className="text-sm text-text-muted">No devices connected yet.</p>
    <Button tone="neutral" disabled>Pair a device</Button>
  </div>;
  return <ItemGroup className="gap-4">{devices.map(device =>
    <Item key={device.id} asChild className="min-w-0 p-0">
      <Link href={hrefFor(device)}>
        <DeviceCard name={device.name} identifier={device.id} battery={device.battery} connected={device.connected} className="w-full min-w-0" />
      </Link>
    </Item>
  )}</ItemGroup>;
}
