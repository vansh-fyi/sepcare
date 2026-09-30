import { existsSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { STATUS_LABEL } from "@/lib/fixtures/risk-status";

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
