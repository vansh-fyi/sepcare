import { existsSync } from "node:fs";
import { expect, it } from "vitest";
import { READINGS } from "@/lib/fixtures/readings";

it("windows original readings inclusively without reordering or mutation", async () => {
  expect(existsSync("src/lib/fixtures/trend-window.ts"), "bounded window implementation exists").toBe(true);
  const { getTrendWindow } = await import("@/lib/fixtures/trend-window");
  const now = 100_000_000;
  const entries = [now, now - 3_600_001, now - 3_600_000, now - 30_000]
    .map(timestamp => ({ ...READINGS.entries[0], timestamp }))
    .sort((a, b) => a.timestamp - b.timestamp);
  const original = [...entries];
  expect(getTrendWindow(entries, 1, now)).toEqual(entries.slice(1));
  expect(getTrendWindow(entries, 6, now)).toEqual(entries);
  expect(getTrendWindow(entries, 24, now)).toEqual(entries);
  expect(getTrendWindow([], 24, now)).toEqual([]);
  expect(getTrendWindow(entries, 1, now + 86_400_000)).toEqual([]);
  expect(entries).toEqual(original);
});
