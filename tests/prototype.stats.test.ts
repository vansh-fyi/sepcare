import { existsSync } from "node:fs";
import * as React from "react";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { READINGS } from "@/lib/fixtures/readings";
import { getTrendWindow } from "@/lib/fixtures/trend-window";
import { VitalDetailCard } from "@/components/patterns/vital-detail-card";

afterEach(() => vi.restoreAllMocks());

it("selects original timestamped chart readings for every range and retains required selection", async () => {
  expect(existsSync("src/components/patterns/stats-view.tsx"), "shared Stats view exists").toBe(true);
  const { StatsView } = await import("@/components/patterns/stats-view");
  let range = 1;
  vi.spyOn(React, "useState").mockImplementation((() => [range, (value: number) => { range = value; }]) as typeof React.useState);
  const entries = READINGS.entries;
  const now = entries.at(-1)!.timestamp;
  for (const hours of [1, 6, 24] as const) {
    const tree = StatsView({ entries });
    const [selector] = React.Children.toArray(tree.props.children) as ReactElement<{ onValueChange: (value: string) => void }>[];
    selector.props.onValueChange(String(hours));
    const updated = StatsView({ entries });
    const [control, grid] = React.Children.toArray(updated.props.children) as ReactElement<{ value: string; onValueChange: (value: string) => void; children: React.ReactNode }>[];
    expect(control.props.value).toBe(String(hours));
    const cards = React.Children.toArray(grid.props.children) as ReactElement<React.ComponentProps<typeof VitalDetailCard>>[];
    expect(cards).toHaveLength(6);
    for (const index of [0, 3, 5]) {
      const expected = getTrendWindow(entries, hours, now);
      expect(cards[index].props.chart?.data.map(row => row.timestamp)).toEqual(expected.map(entry => entry.timestamp));
      expect(cards[index].props.chart?.data.map(row => row.value)).toEqual(expected.map(entry => index === 0 ? entry.vitals.temperature : index === 3 ? entry.risk?.breakdown.hrTempProportionality.ratio ?? undefined : entry.vitals.activityScore));
      expect(cards[index].props.chart?.timeAxis).toBe(true);
    }
    for (const index of [1, 2, 4]) {
      expect(cards[index].props.status).toBe("unavailable");
      expect(cards[index].props.chart).toBeUndefined();
      expect(cards[index].props.value).toBeUndefined();
    }
    control.props.onValueChange("");
    expect(range).toBe(hours);
  }
});

it("renders empty Stats charts without inventing readings", async () => {
  expect(existsSync("src/components/patterns/stats-view.tsx")).toBe(true);
  const { StatsView } = await import("@/components/patterns/stats-view");
  const html = renderToStaticMarkup(createElement(StatsView, { entries: [] }));
  expect(html.match(/No readings for this range/g)).toHaveLength(3);
  expect(html.match(/No data for this range yet\./g)).toHaveLength(3);
  expect(html.match(/Not yet available — awaiting device support\./g)).toHaveLength(3);
});
