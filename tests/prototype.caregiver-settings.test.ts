import { existsSync } from "node:fs";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { DeviceDetails } from "@/components/patterns/device-details";
import { DEVICE } from "@/lib/fixtures/device";

it("serves caregiver Settings with the shared device identity, battery and connection", async () => {
  expect(existsSync("src/app/(prototype)/caregiver/settings/page.tsx"), "caregiver Settings route is reachable").toBe(true);
  const { default: Page } = await import("@/app/(prototype)/caregiver/settings/page");
  const html = renderToStaticMarkup(createElement(Page as ComponentType));
  expect(html).toContain(renderToStaticMarkup(createElement(DeviceDetails, { device: DEVICE })));
  expect(html).toContain(DEVICE.name);
  expect(html).toContain('data-slot="battery-indicator"');
  expect(html).toContain(`${DEVICE.battery}%`);
  expect(html).toMatch(/Live|Last synced|Reconnecting/);
});
