import { clinicalScenario } from "@/lib/examples/clinical-scenarios";
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import postcss from "postcss";
import { PulseWave } from "@/components/motion/pulse-wave";
import { getDeviceState } from "@/lib/device-state";
import { BatteryIndicator } from "@/components/ui/battery-indicator";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { NavLink } from "@/components/ui/nav-link";
import { COMPONENT_CONTENT } from "@/app/design-system/docs/_lib/component-content";
import {
  getExactToken,
  parsePrimitiveRamps,
  parseThemeTokens,
  readThemeBlock,
} from "@/app/design-system/docs/_lib/tokens";

describe("design-system regressions", () => {
  it("selects pulse faces by tone and keeps size independent of emoji", () => {
    const faces = { safe: "mood-smile-beam", caution: "mood-empty", critical: "mood-sad-squint", neutral: "moodSleep" } as const;
    for (const tone of Object.keys(faces) as (keyof typeof faces)[]) {
      const withFace = renderToStaticMarkup(createElement(PulseWave, { emoji: true, size: "lg", tone }));
      const withoutFace = renderToStaticMarkup(createElement(PulseWave, { emoji: false, size: "lg", tone }));
      expect(withFace).toContain(tone === "neutral" ? 'data-icon="moodSleep"' : `tabler-icon-${faces[tone]}`);
      expect(withFace).toContain('data-size="lg"');
      expect(withoutFace).toContain('data-size="lg"');
      expect(withoutFace).not.toContain('<svg');
      expect(withoutFace).toContain('data-slot="pulse-dot"');
      if (tone === "neutral") expect(withFace).toContain('data-active="false"');
    }
  });

  it("prioritizes disconnection and classifies battery boundaries without treating unknown battery as low", () => {
    expect(getDeviceState(true, 51)).toBe("healthy");
    expect(getDeviceState(true, 50)).toBe("medium");
    expect(getDeviceState(true, 21)).toBe("medium");
    expect(getDeviceState(true, 20)).toBe("low");
    expect(getDeviceState(true, 0)).toBe("low");
    expect(getDeviceState(false, 90)).toBe("disconnected");
    expect(getDeviceState(false, 10)).toBe("disconnected");
    expect(getDeviceState(true)).toBe("healthy");
    expect(getDeviceState(true, NaN)).toBe("healthy");
  });

  it("exposes a clamped last-known battery value for a disconnected device", () => {
    const html = renderToStaticMarkup(
      createElement(BatteryIndicator, {
        level: 120,
        connected: false,
        showIcon: false,
      }),
    );
    expect(html).toContain('aria-label="Last known battery level"');
    expect(html).toContain('aria-valuenow="100"');
    expect(html).toContain("100%");
  });

  it("keeps custom text sizes when a color is applied", () => {
    expect(cn("text-body text-text")).toBe("text-body text-text");
    expect(cn("text-caption text-text-muted", "text-critical-dark")).toBe(
      "text-caption text-critical-dark",
    );
    expect(cn("text-body text-text", "text-sm")).toBe("text-text text-sm");
  });

  it("replaces semantic shadows instead of combining conflicting styles", () => {
    expect(cn("shadow-card", "shadow-card-device")).toBe("shadow-card-device");
    expect(cn("shadow-card", "shadow-none")).toBe("shadow-none");
    expect(cn("shadow-sm", "shadow-focus")).toBe("shadow-focus");
  });

  it("keeps global resets inside the base cascade layer", () => {
    const css = postcss.parse(readFileSync("src/app/globals.css", "utf8"));
    css.walkRules((rule) => {
      if (!["*", "a", "body", "html"].includes(rule.selector)) return;
      let parent: postcss.AnyNode | undefined = rule.parent;
      while (
        parent &&
        !(
          parent.type === "atrule" &&
          parent.name === "layer" &&
          parent.params === "base"
        )
      )
        parent = parent.parent;
      expect(
        parent,
        `${rule.selector} must not override utility styles`,
      ).toBeDefined();
    });
  });

  it("includes inline-comment tokens and all documented references", () => {
    const theme = readThemeBlock();
    expect(
      parseThemeTokens(
        "--gradient-example: linear-gradient(\n  90deg,\n  red, blue\n);",
        "--gradient-",
      ),
    ).toEqual([
      {
        name: "--gradient-example",
        value: "linear-gradient( 90deg, red, blue )",
      },
    ]);
    expect(
      parseThemeTokens("--color-example: #FFFFFF; /* reference */", "--color-"),
    ).toEqual([{ name: "--color-example", value: "#FFFFFF" }]);
    expect(getExactToken(theme, "--color-page-canvas").toLowerCase()).toBe(
      "#f0f1f6",
    );
    for (const content of Object.values(COMPONENT_CONTENT)) {
      for (const token of content.tokens)
        expect(getExactToken(theme, token), token).not.toBe("—");
    }
    for (const ramp of parsePrimitiveRamps(theme)) {
      expect(ramp.steps).toHaveLength(9);
      for (const step of ramp.steps)
        expect(step.value).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("exposes the actual progress value and clamps the visual track", () => {
    const html = renderToStaticMarkup(
      createElement(Progress, {
        value: 150,
        max: 100,
        "aria-label": "Battery",
      }),
    );
    expect(html).toContain('aria-valuenow="100"');
    expect(html).toContain('aria-valuemax="100"');
    expect(html).toContain("translateX(-0%)");
    const half = renderToStaticMarkup(
      createElement(Progress, { value: 20, max: 40 }),
    );
    expect(half).toContain('aria-valuenow="20"');
    expect(half).toContain("translateX(-50%)");
  });

  it("keeps inactive navigation named for assistive technology", () => {
    const html = renderToStaticMarkup(
      createElement(NavLink, {
        href: "/vitals",
        icon: "monitoring",
        label: "Vitals",
        state: "inactive",
      }),
    );
    expect(html).toContain('aria-label="Vitals"');
    expect(html).not.toContain('aria-current="page"');
  });

  it("connects an inline error to its input without dropping existing help", () => {
    const html = renderToStaticMarkup(
      createElement(Input, {
        id: "device",
        error: true,
        "aria-describedby": "device-help",
      }),
    );
    expect(html).toContain('aria-describedby="device-help device-error"');
    expect(html).toContain('id="device-error"');
  });
});

describe("clinical preview scenarios", () => {
  it("keeps safe and critical vital states consistent across all six metrics", () => {
    expect(clinicalScenario("safe").vitalStates).toEqual(Array(6).fill("safe"));
    expect(clinicalScenario("critical").vitalStates).toEqual(Array(6).fill("critical"));
  });

  it("provides exactly two yellow and one red caution vitals with a slow device connection", () => {
    const scenario = clinicalScenario("caution");
    expect(scenario.vitalStates).toEqual(["caution", "caution", "safe", "safe", "safe", "critical"]);
    expect(scenario.slowInternet).toBe(true);
    expect(scenario.battery).toBe(40);
    expect(scenario.descriptions[5]).toContain("Significant changes");
    expect(scenario.descriptions[2]).toBe("Readings are stable.");
  });
});
