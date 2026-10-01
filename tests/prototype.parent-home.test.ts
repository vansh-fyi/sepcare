import { existsSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import ParentLayout from "@/app/(prototype)/parent/layout";
import { getLatestEntry } from "@/lib/fixtures/readings";
import { mapRiskStatus, STATUS_LABEL } from "@/lib/fixtures/risk-status";

async function renderHome() {
  expect(existsSync("src/app/(prototype)/parent/page.tsx"), "parent Home must render the shared readings and progressive disclosure").toBe(true);
  const { default: Home } = await import("@/app/(prototype)/parent/page");
  return renderToStaticMarkup(createElement(ParentLayout, {
    params: Promise.resolve({}),
    children: createElement(Home, { params: Promise.resolve({}), searchParams: Promise.resolve({}) }),
  }));
}

it("offers one device link and See All without persistent navigation", async () => {
  const html = await renderHome();
  expect(html).not.toContain('data-slot="nav-bar"');
  expect(html.match(/aria-label="Device"/g)).toHaveLength(1);
  expect(html).toMatch(/<a[^>]*href="\/parent\/device"[^>]*><svg/);
  expect(html).toMatch(/<a[^>]*href="\/parent\/detail\/vitals"[^>]*>See All<\/a>/);
  expect(html).toContain("Static sample data");
});

it("renders the caregiver's same latest readings, status, and care instructions", async () => {
  const html = await renderHome();
  const latest = getLatestEntry()!;
  for (const value of [latest.vitals.heartRate.toFixed(0), latest.vitals.temperature.toFixed(1), latest.vitals.activityScore.toFixed(0)]) {
    expect(html).toContain(`>${value}</span>`);
  }
  expect(html).toContain("°C");
  expect(html).toContain(STATUS_LABEL[mapRiskStatus(latest.risk!.status)]);
  for (const instruction of ["Continue regular feeding", "Keep baby warm and covered", "Keep the ankle band on"]) {
    expect(html).toContain(instruction);
  }
});
