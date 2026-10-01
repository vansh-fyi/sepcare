import type { ReadingEntry } from "./readings";

/** Last original reading in each local calendar hour, newest first. */
export function getRiskHistory(entries: ReadingEntry[]): ReadingEntry[] {
  const buckets = new Map<number, ReadingEntry>();
  for (const entry of entries) {
    const hour = new Date(entry.timestamp).setMinutes(0, 0, 0);
    const previous = buckets.get(hour);
    if (!previous || entry.timestamp > previous.timestamp) buckets.set(hour, entry);
  }
  return [...buckets.values()].sort((a, b) => b.timestamp - a.timestamp);
}
