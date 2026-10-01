import { existsSync } from "node:fs";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { VitalsView } from "@/components/patterns/vitals-view";
import { StatsView } from "@/components/patterns/stats-view";
import { READINGS } from "@/lib/fixtures/readings";

it("renders the caregiver six-signal grid and complete chronological risk history", () => {
  const html = renderToStaticMarkup(createElement(VitalsView, { entries: READINGS.entries }));
  expect(html.match(/Not yet available — awaiting device support\./g)).toHaveLength(3);
  for (const title of ["Thermoregulation", "Cardiac Autonomic", "Perfusion Index", "HR / Temp Ratio", "Respiratory Pattern", "Activity Level"]) expect(html).toContain(title);
  expect(html).toContain("Risk history");
});

it("serves caregiver Stats with real readings and all three range choices", async () => {
  expect(existsSync("src/app/(prototype)/caregiver/stats/page.tsx"), "caregiver Stats route is reachable").toBe(true);
  const { default: Page } = await import("@/app/(prototype)/caregiver/stats/page");
  const html = renderToStaticMarkup(createElement(Page as ComponentType));
  const shared = renderToStaticMarkup(createElement(StatsView, { entries: READINGS.entries }));
  expect(html).toContain(shared);
  expect(html.match(/Not yet available — awaiting device support\./g)).toHaveLength(3);
  for (const label of ["1H", "6H", "24H"]) expect(html).toContain(label);
});
