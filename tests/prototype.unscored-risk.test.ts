import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { VitalsView } from "@/components/patterns/vitals-view";
import { StatsView } from "@/components/patterns/stats-view";
import { READINGS } from "@/lib/fixtures/readings";

it("does not label unscored history as Safe", () => {
  const entry = { ...READINGS.entries.at(-1)!, risk: null };
  const html = renderToStaticMarkup(createElement(VitalsView, { entries: [entry] }));
  const history = html.slice(html.indexOf('<section aria-label="Risk history"'));
  expect(html).toContain("Risk status not yet calculated.");
  expect(history).not.toContain('data-icon="safe"');
  expect(history).not.toMatch(/>Safe</);
});

it.each([["Vitals", VitalsView], ["Stats", StatsView]] as const)("keeps measured values without declaring absent risk safe in %s", (_name, View) => {
  const entry = { ...READINGS.entries.at(-1)!, risk: null };
  const html = renderToStaticMarkup(createElement(View, { entries: [entry] }));
  expect(html).toContain(String(entry.vitals.temperature));
  expect(html).toContain(String(entry.vitals.activityScore));
  // Raw measurements exist, but no risk calculation exists to justify a clinical tone.
  expect(/(?:text|bg)-(?:safe|critical)(?:[\s"-])/.test(html), "Unscored readings must not receive safe or critical colors").toBe(false);
  expect(html).not.toContain("var(--color-safe)");
  expect(html).not.toContain("var(--color-critical)");
});

it.each([["Vitals", VitalsView], ["Stats", StatsView]] as const)("does not imply a safe classification when %s has no readings", (_name, View) => {
  const html = renderToStaticMarkup(createElement(View, { entries: [] }));
  expect(/(?:text|bg)-(?:safe|critical)(?:[\s"-])/.test(html), "No readings means no risk classification").toBe(false);
  expect(html).not.toContain("var(--color-safe)");
});
