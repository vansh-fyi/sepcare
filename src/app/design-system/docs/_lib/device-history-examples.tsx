"use client";

import { useState } from "react";
import { Preview } from "@/components/docs/documentation";
import { DeviceDetails } from "@/components/patterns/device-details";
import { DeviceSelectList } from "@/components/patterns/device-select-list";
import { RiskTimeline, type RiskTimelineEntry } from "@/components/patterns/risk-timeline";
import { DEVICE } from "@/lib/fixtures/device";

const ENTRIES: RiskTimelineEntry[] = [
  { timestamp: 1790812800000, status: "critical" },
  { timestamp: 1790809200000, status: "caution" },
  { timestamp: 1790805600000, status: "safe" },
];

export function DeviceHistoryExample({ name }: { name: "risk-timeline" | "device-select-list" | "device-details" }) {
  const [empty, setEmpty] = useState(false);
  const [connected, setConnected] = useState(true);
  const device = { ...DEVICE, connected };
  if (name === "risk-timeline") return <Preview
    caption="Sample hourly status history. Times use your local time zone."
    code={`<RiskTimeline entries={${JSON.stringify(empty ? [] : ENTRIES, null, 2)}} />`}
    controls={<label><input type="checkbox" checked={empty} onChange={e => setEmpty(e.target.checked)} /> Empty history</label>}
  ><RiskTimeline entries={empty ? [] : ENTRIES} /></Preview>;
  if (name === "device-select-list") return <Preview
    caption="Sample device data. The row opens the shared details documentation. Pairing is unavailable in this preview."
    code={`<DeviceSelectList devices={${empty ? "[]" : "[" + JSON.stringify(DEVICE) + "]"}} hrefFor={() => "/design-system/docs/device-details"} />`}
    controls={<label><input type="checkbox" checked={empty} onChange={e => setEmpty(e.target.checked)} /> No devices</label>}
  ><DeviceSelectList devices={empty ? [] : [DEVICE]} hrefFor={() => "/design-system/docs/device-details"} /></Preview>;
  return <Preview
    caption="Sample device data. No device is connected or disconnected by this preview; the action is disabled without a handler."
    code={`<DeviceDetails device={${JSON.stringify(device, null, 2)}} />`}
    controls={<label><input type="checkbox" checked={connected} onChange={e => setConnected(e.target.checked)} /> Connected</label>}
  ><DeviceDetails device={device} /></Preview>;
}
