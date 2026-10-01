import { existsSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { STATUS_LABEL } from "@/lib/fixtures/risk-status";
import { READINGS } from "@/lib/fixtures/readings";

it("pairs every status word with its icon and color and reserves the call action for critical", async () => {
  expect(existsSync("src/components/patterns/infant-status-section.tsx"), "shared status section must exist").toBe(true);
  const { InfantStatusSection } = await import("@/components/patterns/infant-status-section");
  for (const status of ["safe", "caution", "critical"] as const) {
    const html = renderToStaticMarkup(createElement(InfantStatusSection, { infant: { status, title: "Infant status", description: "Status description" } }));
    expect(html).toContain(`data-status="${status}"`);
    expect(html).toContain(`data-icon="${status}"`);
    expect(html).toContain(`bg-${status}-soft`);
    expect(html).toContain(STATUS_LABEL[status]);
    expect(html.includes("Call ambulance")).toBe(status === "critical");
    expect(html.includes("Status description")).toBe(status !== "critical");
  }
});

it("renders three real summary values and three unsupported signals in VitalsView", async () => {
  expect(existsSync("src/components/patterns/vitals-view.tsx"), "shared Vitals view exists").toBe(true);
  const { VitalsView } = await import("@/components/patterns/vitals-view");
  const html = renderToStaticMarkup(createElement(VitalsView, { entries: READINGS.entries }));
  expect(html.match(/Not yet available — awaiting device support\./g)).toHaveLength(3);
  expect(html.match(/data-slot="vital-value"/g)).toHaveLength(3);
  expect(html).not.toContain('data-slot="vitals-trend-chart"');
  const latest = READINGS.entries.at(-1)!;
  expect(html).toContain(String(latest.vitals.temperature));
  expect(html).toContain(String(latest.vitals.activityScore));
  expect(html).toContain(latest.risk!.breakdown.hrTempProportionality.ratio!.toFixed(1));
  expect(html).toContain('data-slot="badge"');
  for (const [flag, expected] of [[true, "text-critical"], [false, "text-safe"]] as const) {
    const entry = { ...latest, risk: { ...latest.risk!, breakdown: {
      temperature: { value: latest.vitals.temperature, abnormal: flag },
      hrTempProportionality: { ratio: 12, abnormal: flag },
      activityTrend: { delta: 0, trending: flag },
    } } };
    const output = renderToStaticMarkup(createElement(VitalsView, { entries: [entry] }));
    expect(output.match(new RegExp(`data-slot="vital-value"[^>]*${expected}`, "g"))).toHaveLength(3);
  }
});

it("does not invent values for absent readings or an uncomputed ratio", async () => {
  expect(existsSync("src/components/patterns/vitals-view.tsx")).toBe(true);
  const { VitalsView } = await import("@/components/patterns/vitals-view");
  const html = renderToStaticMarkup(createElement(VitalsView, { entries: [] }));
  expect(html).toContain("No readings yet");
  const first = renderToStaticMarkup(createElement(VitalsView, { entries: [READINGS.entries[0]] }));
  expect(first).toContain("Not enough temperature change or baseline history to calculate a ratio.");
});
