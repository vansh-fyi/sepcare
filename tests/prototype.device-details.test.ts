import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEVICE } from "@/lib/fixtures/device";

describe("device details", () => {
  it("provides shared device details", () => {
    expect(existsSync("src/components/patterns/device-details.tsx")).toBe(true);
  });
  it("shows identity, battery, freshness, contact and neutral connection action", async () => {
    const { DeviceDetails } = await import("@/components/patterns/device-details");
    const html = renderToStaticMarkup(createElement(DeviceDetails, { device: DEVICE }));
    for (const value of [DEVICE.name, 'data-slot="battery-indicator"', `${DEVICE.battery}%`, 'data-state=', "Good contact", 'data-tone="neutral"', "Disconnect"]) expect(html).toContain(value);
    expect(html).not.toContain('role="dialog"');
  });
  it("uses Connect and honest last-sync wording when disconnected, with all contact states", async () => {
    const { DeviceDetails } = await import("@/components/patterns/device-details");
    for (const [sensorContact, label] of [["safe", "Good contact"], ["caution", "Check placement"], ["critical", "No contact"]] as const) {
      const html = renderToStaticMarkup(createElement(DeviceDetails, { device: { ...DEVICE, connected: false, sensorContact, lastSyncedAt: Date.now() } }));
      expect(html).toContain("Connect");
      expect(html).toContain(label);
      expect(html).toContain("Last synced");
      expect(html).not.toContain('data-tone="critical"');
    }
  });
});
