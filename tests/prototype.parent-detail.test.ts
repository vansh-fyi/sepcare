import { existsSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { READINGS } from "@/lib/fixtures/readings";
import { VITAL_DETAILS } from "@/components/patterns/vital-detail-card";

const navigation = vi.hoisted(() => ({ pathname: "/parent/detail/vitals" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));
const originalEntries = READINGS.entries;
afterEach(() => { READINGS.entries = originalEntries; });
const props = { params: Promise.resolve({}), searchParams: Promise.resolve({}) };

describe("parent health details", () => {
  it("provides both detail destinations", () => {
    expect(existsSync("src/app/(prototype)/parent/detail/vitals/page.tsx")).toBe(true);
    expect(existsSync("src/app/(prototype)/parent/detail/stats/page.tsx")).toBe(true);
  });

  it.each(["vitals", "stats"])("uses two real links with %s selected", async (tab) => {
    navigation.pathname = `/parent/detail/${tab}`;
    const { default: Layout } = await import("@/app/(prototype)/parent/detail/layout");
    const html = renderToStaticMarkup(createElement(Layout, { children: "detail content", params: Promise.resolve({}) }));
    expect(html.match(/data-slot="toggle-group-item"/g)).toHaveLength(2);
    expect(html.indexOf('href="/parent/detail/vitals"')).toBeLessThan(html.indexOf('href="/parent/detail/stats"'));
    expect(html).toContain(`href="/parent/detail/${tab}" aria-current="page"`);
    expect(html).not.toContain('data-slot="nav-bar"');
    expect(html).toContain("detail content");
  });

  it.each(["normal", "empty", "boundary"])("renders identical caregiver and parent data for %s readings", async (scenario) => {
    expect(existsSync("src/app/(prototype)/parent/detail/vitals/page.tsx")).toBe(true);
    const { default: ParentVitals } = await import("@/app/(prototype)/parent/detail/vitals/page");
    const { default: ParentStats } = await import("@/app/(prototype)/parent/detail/stats/page");
    const { default: CaregiverVitals } = await import("@/app/(prototype)/caregiver/vitals/page");
    const { default: CaregiverStats } = await import("@/app/(prototype)/caregiver/stats/page");
    if (scenario === "empty") READINGS.entries = [];
    if (scenario === "boundary") {
      const last = originalEntries.at(-1)!;
      READINGS.entries = [{ ...last, vitals: { ...last.vitals, temperature: 38 } }];
    }
    for (const [Parent, Caregiver] of [[ParentVitals, CaregiverVitals], [ParentStats, CaregiverStats]]) {
      const parent = Parent(props);
      const caregiver = Caregiver(props);
      expect(parent.props.children.type).toBe(caregiver.props.children.type);
      expect(parent.props.children.props.entries).toBe(READINGS.entries);
      expect(caregiver.props.children.props.entries).toBe(READINGS.entries);
      const html = renderToStaticMarkup(parent);
      expect(html).toBe(renderToStaticMarkup(caregiver));
      const positions = VITAL_DETAILS.map(detail => html.indexOf(detail.title));
      expect(positions.every(position => position >= 0)).toBe(true);
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
      expect(html.match(/Not yet available — awaiting device support\./g)).toHaveLength(3);
    }
  });
});
