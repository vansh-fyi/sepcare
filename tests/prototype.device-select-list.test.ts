import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEVICE } from "@/lib/fixtures/device";

describe("device selection", () => {
  it("provides the shared device list", () => {
    expect(existsSync("src/components/patterns/device-select-list.tsx")).toBe(true);
  });
  it("renders only the real supplied device with its destination and battery", async () => {
    const { DeviceSelectList } = await import("@/components/patterns/device-select-list");
    const html = renderToStaticMarkup(createElement(DeviceSelectList, { devices: [DEVICE], hrefFor: d => `/parent/device/${d.id}` }));
    expect(html.match(/data-slot="item"/g)).toHaveLength(1);
    expect(html.replace(/<[^>]*>/g, "").split(DEVICE.name)).toHaveLength(2);
    expect(html).toContain(`href="/parent/device/${DEVICE.id}"`);
    expect(html).toContain(`${DEVICE.battery}%`);
    const disconnected = renderToStaticMarkup(createElement(DeviceSelectList, { devices: [{ ...DEVICE, connected: false }], hrefFor: () => "/device" }));
    expect(disconnected).toContain("Disconnected");
  });
  it("shows the empty copy and pairing affordance without fabricated rows", async () => {
    const { DeviceSelectList } = await import("@/components/patterns/device-select-list");
    const html = renderToStaticMarkup(createElement(DeviceSelectList, { devices: [], hrefFor: () => "/device" }));
    expect(html).toContain("No devices connected yet.");
    expect(html).toContain("Pair a device");
    expect(html).not.toContain('data-slot="item"');
  });
});
