import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { READINGS } from "@/lib/fixtures/readings";

describe("risk timeline", () => {
  it("renders VitalsView history using the supplied original hourly readings", async () => {
    expect(existsSync("src/components/patterns/vitals-view.tsx")).toBe(true);
    const { VitalsView } = await import("@/components/patterns/vitals-view");
    const { getRiskHistory } = await import("@/lib/fixtures/risk-history");
    const html = renderToStaticMarkup(createElement(VitalsView, { entries: READINGS.entries }));
    expect(html).toContain("Risk history");
    for (const entry of getRiskHistory(READINGS.entries)) {
      expect(html).toContain(new Date(entry.timestamp).toISOString());
    }
  });
  it("provides hourly history and the timeline composition", () => {
    expect(existsSync("src/lib/fixtures/risk-history.ts")).toBe(true);
    expect(existsSync("src/components/patterns/risk-timeline.tsx")).toBe(true);
  });
  it("keeps the last reading per local calendar hour newest-first without mutating input", async () => {
    const { getRiskHistory } = await import("@/lib/fixtures/risk-history");
    const entries = Array.from({ length: 18 }, (_, i) => ({ ...READINGS.entries[0], timestamp: new Date(2026, 8, 30, 10 + Math.floor(i / 6), i % 6 * 10).getTime() }));
    const shuffled = [...entries].reverse();
    expect(getRiskHistory(shuffled)).toEqual([entries[17], entries[11], entries[5]]);
    expect(shuffled).toEqual([...entries].reverse());
    expect(getRiskHistory([])).toEqual([]);
    expect(new Set(READINGS.entries.map(e => e.timestamp)).size).toBe(READINGS.entries.length);
  });
  it("preserves supplied order and pairs each status word with its icon and timestamp", async () => {
    const { RiskTimeline } = await import("@/components/patterns/risk-timeline");
    const entries = (["critical", "caution", "safe"] as const).map((status, i) => ({ status, timestamp: new Date(2026, 8, 30, 12 - i).getTime() }));
    const html = renderToStaticMarkup(createElement(RiskTimeline, { entries }));
    expect(html.indexOf("Critical")).toBeLessThan(html.indexOf("Safe"));
    for (const entry of entries) {
      expect(html).toContain(`data-icon="${entry.status}"`);
      expect(html).toContain(new Date(entry.timestamp).toISOString());
    }
    const reversed = renderToStaticMarkup(createElement(RiskTimeline, { entries: [...entries].reverse() }));
    expect(reversed.indexOf("Safe")).toBeLessThan(reversed.indexOf("Critical"));
  });
  it("renders honest empty history", async () => {
    const { RiskTimeline } = await import("@/components/patterns/risk-timeline");
    const html = renderToStaticMarkup(createElement(RiskTimeline, { entries: [] }));
    expect(html).toContain("No status changes recorded yet.");
    expect(html).not.toContain('data-slot="item"');
  });
});
