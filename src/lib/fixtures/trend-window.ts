import type { ReadingEntry } from "./readings";

export type TrendRangeHours = 1 | 2 | 4 | 6 | 8 | 10 | 12 | 24;

/** Inclusive lower bound, preserving every original reading and its input order. */
export function getTrendWindow(
  entries: ReadingEntry[],
  hours: TrendRangeHours,
  now: number = Date.now(),
): ReadingEntry[] {
  return entries.filter(entry => entry.timestamp >= now - hours * 3_600_000);
}
