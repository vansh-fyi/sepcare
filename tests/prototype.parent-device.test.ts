import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEVICE } from "@/lib/fixtures/device";
import { DeviceDetails } from "@/components/patterns/device-details";

describe("parent device routes", () => {
  it("provides the select and dynamic details routes", () => {
    expect(existsSync("src/app/(prototype)/parent/device/page.tsx")).toBe(true);
    expect(existsSync("src/app/(prototype)/parent/device/[deviceId]/page.tsx")).toBe(true);
  });

  it("links exactly one real device to its details", async () => {
    const { default: Page } = await import("@/app/(prototype)/parent/device/page");
    const html = renderToStaticMarkup(Page({ params: Promise.resolve({}), searchParams: Promise.resolve({}) }));
    expect(html.match(/<a\b/g)).toHaveLength(1);
    expect(html).toContain(`href="/parent/device/${DEVICE.id}"`);
    expect(html).toContain(DEVICE.name);
  });

  it("renders the shared details for the real device", async () => {
    const { default: Page } = await import("@/app/(prototype)/parent/device/[deviceId]/page");
    const element = await Page({ params: Promise.resolve({ deviceId: DEVICE.id }), searchParams: Promise.resolve({}) });
    expect(element.type).toBe(DeviceDetails);
    expect(element.props.device).toBe(DEVICE);
    const html = renderToStaticMarkup(element);
    for (const value of [DEVICE.name, 'data-slot="battery-indicator"', `${DEVICE.battery}%`, "Good contact", 'data-tone="neutral"', "Disconnect"]) expect(html).toContain(value);
    expect(html).toBe(renderToStaticMarkup(createElement(DeviceDetails, { device: DEVICE })));
  });

  it("rejects unknown device IDs with an honest retry link", async () => {
    const { default: Page } = await import("@/app/(prototype)/parent/device/[deviceId]/page");
    const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ deviceId: "unknown" }), searchParams: Promise.resolve({}) }));
    expect(html).toContain("Something went wrong loading this device&#x27;s data. Try again.");
    expect(html).toContain('href="/parent/device"');
    expect(html).not.toContain('data-slot="battery-indicator"');
  });
});
