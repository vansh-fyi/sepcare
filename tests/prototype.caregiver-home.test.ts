import { existsSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { getLatestEntry } from "@/lib/fixtures/readings";
import { mapRiskStatus, STATUS_LABEL } from "@/lib/fixtures/risk-status";

it("renders the latest fixture values and mapped risk on caregiver Home", async () => {
  expect(existsSync("src/app/(prototype)/caregiver/page.tsx"), "caregiver Home must exist").toBe(true);
  const { default: Home } = await import("@/app/(prototype)/caregiver/page");
  const latest = getLatestEntry()!;
  const html = renderToStaticMarkup(createElement(Home, { params: Promise.resolve({}), searchParams: Promise.resolve({}) }));
  expect(html).toContain(`>${latest.vitals.heartRate.toFixed(0)}</span>`);
  expect(html).toContain(`>${latest.vitals.temperature.toFixed(1)}</span>`);
  expect(html).toContain(`>${latest.vitals.activityScore.toFixed(0)}</span>`);
  expect(html).toContain("°C");
  expect(html).toContain(STATUS_LABEL[mapRiskStatus(latest.risk!.status)]);
  expect(html).toContain("Instructions");
  expect(html).not.toContain("dangerouslySetInnerHTML");
});
