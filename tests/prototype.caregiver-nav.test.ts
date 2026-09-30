import { existsSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ pathname: "/caregiver" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname, useRouter: () => ({ push: vi.fn() }) }));

describe("caregiver navigation", () => {
  it("links all four destinations and selects exactly the current route", async () => {
    expect(existsSync("src/app/(prototype)/caregiver/_components/chrome.tsx"), "caregiver chrome must exist").toBe(true);
    const { CaregiverNav } = await import("@/app/(prototype)/caregiver/_components/chrome");
    const hrefs = ["/caregiver", "/caregiver/vitals", "/caregiver/stats", "/caregiver/settings"];
    for (const href of hrefs) {
      navigation.pathname = href;
      const html = renderToStaticMarkup(createElement(CaregiverNav));
      expect(html.match(/data-slot="nav-link"/g)).toHaveLength(4);
      expect(html.match(/data-state="active"/g)).toHaveLength(1);
      for (const destination of hrefs) expect(html).toContain(`href="${destination}"`);
      expect(html).toMatch(new RegExp(`<a[^>]*data-state="active"[^>]*href="${href}"`));
    }
  });
});
