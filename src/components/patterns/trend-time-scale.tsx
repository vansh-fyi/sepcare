"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
export const TREND_HOURS = [2, 4, 6, 8, 10, 12, 24] as const;

export function TrendTimeScale({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) {
  return <section className="flex flex-col items-center gap-3" aria-label="Trend time range">
    <h2 className="text-sm font-semibold">Select Time Scale</h2>
    <ToggleGroup type="single" value={value} onValueChange={next => { if (next) onValueChange(next); }} aria-label="Time scale" size="sm" fit="equal">
      {TREND_HOURS.map(hours => <ToggleGroupItem key={hours} value={String(hours)}>{hours}H</ToggleGroupItem>)}
    </ToggleGroup>
  </section>;
}
