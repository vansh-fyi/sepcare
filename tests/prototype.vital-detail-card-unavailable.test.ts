import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VitalDetailCard, VITAL_DETAILS } from "@/components/patterns/vital-detail-card";

const copy = "Not yet available — awaiting device support.";

describe("unavailable vital detail", () => {
  it("uses honest descriptions only for unsupported signals", () => {
    expect([1, 2, 4].map((index) => VITAL_DETAILS[index].description)).toEqual([copy, copy, copy]);
    expect([0, 3, 5].map((index) => VITAL_DETAILS[index].description)).toEqual([
      "Hypothermia trend. Severe dropping over 4h", "All systems stable", "All systems stable",
    ]);
  });

  it.each([false, true])("suppresses values and charts even if chart supplied: %s", (withChart) => {
    const html = renderToStaticMarkup(createElement(VitalDetailCard, {
      title: "Cardiac Autonomic", icon: "pulse", description: "Misleading old copy",
      status: "unavailable", critical: true, value: 987,
      chart: withChart ? { data: [{ time: 1, value: 987 }], xKey: "time", series: [{ key: "value", label: "HRV", color: "var(--color-safe)" }] } : undefined,
    }));
    expect(html).toContain(copy);
    expect(html).toContain("bg-neutral-100 text-text-muted");
    for (const hidden of ["987", "text-2xl font-bold", 'data-slot="sparkline"', "recharts", "Misleading old copy", "bg-safe-soft", 'data-icon="calendar"']) expect(html).not.toContain(hidden);
  });
});
