import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { HomeOverview } from "@/components/patterns/home-overview";

const vitals = { pulse: { value: "128", unit: "bpm" }, temperature: { value: "36.8", unit: "°C" }, activity: { value: "72" } };

it("shows state-specific instructions and reserves the demo emergency action for critical", () => {
  for (const status of ["safe", "caution", "critical"] as const) {
    const html = renderToStaticMarkup(createElement(HomeOverview, { status, vitals, seeAll: "See all" }));
    expect(html.includes("Continue regular feeding")).toBe(status === "safe");
    expect(html.includes("Review changes with the care team")).toBe(status === "caution");
    expect(html.includes("Call ambulance")).toBe(status === "critical");
    expect(html).toContain(`data-status="${status}"`);
    expect(html).toContain("36.8");
    expect(html).toContain("°C");
  }
});

it("does not supply routine safe instructions when risk is unassessed", () => {
  const html = renderToStaticMarkup(createElement(HomeOverview, { vitals, seeAll: "See all" }));
  expect(html).toContain("Risk assessment is not available");
  expect(html).not.toContain("Continue regular feeding");
  expect(html).not.toContain("Baby is resting safely");
});

it("keeps caregiver and parent Home content identical apart from their See all destinations", async () => {
  const { default: Caregiver } = await import("@/app/(prototype)/caregiver/page");
  const { default: Parent } = await import("@/app/(prototype)/parent/page");
  const props = { params: Promise.resolve({}), searchParams: Promise.resolve({}) };
  const caregiver = renderToStaticMarkup(createElement(Caregiver, props));
  const parent = renderToStaticMarkup(createElement(Parent, props));
  expect(caregiver.replace('/caregiver/vitals', '/details')).toBe(parent.replace('/parent/detail/vitals', '/details'));
});
