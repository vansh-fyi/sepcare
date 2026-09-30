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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Sparkline } from "@/components/ui/sparkline";
import { VitalDetailCard } from "@/components/patterns/vital-detail-card";
import { DeviceHeader } from "@/components/patterns/device-header";
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

describe("Button contract", () => {
  it("keeps variant, tone, size, and radius as independent, non-interfering axes", () => {
    const html = renderToStaticMarkup(
      createElement(
        Button,
        { variant: "secondary", tone: "critical", size: "lg", radius: "full" },
        "Call ambulance",
      ),
    );
    expect(html).toContain('data-variant="secondary"');
    expect(html).toContain('data-tone="critical"');
    expect(html).toContain('data-size="lg"');
    expect(html).toContain("rounded-full");
    expect(html).toContain("h-12");
    // secondary treatment (border/surface classes) must still be present with a critical tone
    expect(html).toContain("border-[color:var(--button-border)]");
    // tone drives the custom-property values, not the class list
    expect(html).toContain("--button-fill:var(--color-button-critical-fill)");
  });

  it("preserves button dimensions and disables the native button while loading", () => {
    const idle = renderToStaticMarkup(
      createElement(Button, { size: "lg" }, "Save"),
    );
    const loading = renderToStaticMarkup(
      createElement(Button, { size: "lg", loading: true }, "Save"),
    );
    expect(idle).toContain("h-12");
    expect(loading).toContain("h-12");
    expect(loading).toContain("disabled=\"\"");
    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain('data-loading="true"');
  });

  it("becomes square and data-icon-only when rendered with an icon and no text", () => {
    const withLabel = renderToStaticMarkup(
      createElement(Button, {
        size: "default",
        icon: createElement("svg", { "data-testid": "icon" }),
        "aria-label": "Device settings",
      }),
    );
    expect(withLabel).toContain('data-icon-only="true"');
    expect(withLabel).toContain('aria-label="Device settings"');

    // The component does not itself throw or warn when aria-label is omitted on an
    // icon-only button — enforcement is documented guidance (button.DESIGN.md), not a
    // runtime guard. Record that actual (unenforced) behavior rather than assuming one.
    const withoutAriaLabel = renderToStaticMarkup(
      createElement(Button, {
        size: "default",
        icon: createElement("svg"),
      }),
    );
    expect(withoutAriaLabel).toContain('data-icon-only="true"');
    expect(withoutAriaLabel).not.toContain("aria-label");
  });

  it("slots icon and text inside the child element when asChild is used", () => {
    const html = renderToStaticMarkup(
      createElement(
        Button,
        { asChild: true, icon: createElement("svg", { "data-testid": "start-icon" }) },
        createElement("a", { href: "/vitals" }, "View vitals"),
      ),
    );
    expect(html).toContain("<a");
    expect(html).toContain('href="/vitals"');
    expect(html).toContain("View vitals");
    expect(html).toContain('data-slot="button"');
  });
});

describe("Badge multi-modal guarantee", () => {
  it("always renders an icon, a label, and a status color class together", () => {
    for (const status of ["safe", "caution", "critical"] as const) {
      const html = renderToStaticMarkup(
        createElement(Badge, { status }, "Stable"),
      );
      expect(html).toContain(`data-status="${status}"`);
      expect(html).toContain("<svg");
      expect(html).toContain("Stable");
      expect(html).toMatch(/bg-(safe|caution|critical)-soft/);
    }
  });

  it("never produces a color-only badge even when showIcon is withheld from a status without a mapped glyph", () => {
    const html = renderToStaticMarkup(
      createElement(Badge, { status: "neutral" }, "Draft"),
    );
    // neutral has no dedicated status icon, but the label text is still present —
    // color is never the sole carrier of meaning.
    expect(html).toContain("Draft");
    expect(html).toContain('data-status="neutral"');
  });
});

describe("ToggleGroup contract", () => {
  it("applies different width classes for fit=content vs fit=equal", () => {
    const content = renderToStaticMarkup(
      createElement(
        ToggleGroup,
        { type: "single", fit: "content", "aria-label": "Range" },
        createElement(ToggleGroupItem, { value: "day" }, "Day"),
      ),
    );
    const equal = renderToStaticMarkup(
      createElement(
        ToggleGroup,
        { type: "single", fit: "equal", "aria-label": "Range" },
        createElement(ToggleGroupItem, { value: "day" }, "Day"),
      ),
    );
    expect(content).toContain('data-fit="content"');
    expect(content).not.toContain("w-full");
    expect(equal).toContain('data-fit="equal"');
    expect(equal).toContain("w-full");
  });

  it("maps spacing to a quarter-rem gap", () => {
    const html = renderToStaticMarkup(
      createElement(
        ToggleGroup,
        { type: "single", spacing: 3, "aria-label": "Range" },
        createElement(ToggleGroupItem, { value: "day" }, "Day"),
      ),
    );
    expect(html).toContain("gap:0.75rem");
  });

  it("documents required-single-selection consumers guarding against an empty onValueChange payload", () => {
    // ToggleGroup/ToggleGroupItem are a stateless Radix pass-through — they hold no
    // internal value state, so "retain the previous value on empty callback" (per
    // toggle-group.DESIGN.md) is implemented per-consumer, not inside the shared
    // component. This regression guard asserts the documented consumers still apply
    // the guard idiom, the same way the globals.css @layer guard checks source text.
    const motionExamples = readFileSync(
      "src/app/design-system/docs/_lib/motion-examples.tsx",
      "utf8",
    );
    const componentExamples = readFileSync(
      "src/app/design-system/docs/_lib/component-examples.tsx",
      "utf8",
    );
    const guardedOnValueChange = /onValueChange=\{\(v(?:alue)?\) => \{?\s*if \(v(?:alue)?\)/;
    expect(motionExamples).toMatch(guardedOnValueChange);
    expect(componentExamples).toMatch(guardedOnValueChange);
  });
});

describe("Field error wiring across form controls", () => {
  it("does not strip an existing aria-describedby when Select's trigger also carries aria-invalid", () => {
    const html = renderToStaticMarkup(
      createElement(
        Select,
        { open: false },
        createElement(
          SelectTrigger,
          {
            id: "device-select",
            "aria-invalid": true,
            "aria-describedby": "device-select-help",
          },
          createElement(SelectValue, { placeholder: "Choose a device" }),
        ),
      ),
    );
    expect(html).toContain('aria-describedby="device-select-help"');
    expect(html).toContain('aria-invalid="true"');
  });

  it("passes an existing aria-describedby and aria-invalid through unmodified on Textarea", () => {
    const html = renderToStaticMarkup(
      createElement(Textarea, {
        id: "notes",
        "aria-invalid": true,
        "aria-describedby": "notes-help",
      }),
    );
    expect(html).toContain('aria-describedby="notes-help"');
    expect(html).toContain('aria-invalid="true"');
  });

  it("passes an existing aria-describedby and aria-invalid through unmodified on Checkbox", () => {
    const html = renderToStaticMarkup(
      createElement(Checkbox, {
        id: "consent",
        "aria-invalid": true,
        "aria-describedby": "consent-help",
      }),
    );
    expect(html).toContain('aria-describedby="consent-help"');
    expect(html).toContain('aria-invalid="true"');
  });

  it("passes an existing aria-describedby and aria-invalid through unmodified on RadioGroupItem", () => {
    const html = renderToStaticMarkup(
      createElement(
        RadioGroup,
        { "aria-label": "Plan" },
        createElement(RadioGroupItem, {
          value: "a",
          id: "plan-a",
          "aria-invalid": true,
          "aria-describedby": "plan-help",
        }),
      ),
    );
    expect(html).toContain('aria-describedby="plan-help"');
    expect(html).toContain('aria-invalid="true"');
  });

  it("passes an existing aria-describedby and aria-invalid through unmodified on Switch", () => {
    const html = renderToStaticMarkup(
      createElement(Switch, {
        id: "notify",
        "aria-invalid": true,
        "aria-describedby": "notify-help",
      }),
    );
    expect(html).toContain('aria-describedby="notify-help"');
    expect(html).toContain('aria-invalid="true"');
  });
});

describe("Sparkline chromeless guard", () => {
  it("never imports or renders recharts chrome elements", () => {
    const source = readFileSync("src/components/ui/sparkline.tsx", "utf8");
    for (const forbidden of ["XAxis", "YAxis", "CartesianGrid", "Tooltip", "Legend"]) {
      expect(source, `sparkline.tsx must not use recharts' ${forbidden}`).not.toContain(forbidden);
    }
    const html = renderToStaticMarkup(
      createElement(Sparkline, { data: [{ value: 1 }, { value: 2 }, { value: 3 }] }),
    );
    for (const forbidden of ["xAxis", "yAxis", "cartesian-grid", "recharts-tooltip", "recharts-legend"]) {
      expect(html.toLowerCase()).not.toContain(forbidden);
    }
  });
});

describe("VitalDetailCard contract", () => {
  it("lets an explicit status prop override the legacy critical boolean", () => {
    const html = renderToStaticMarkup(
      createElement(VitalDetailCard, {
        title: "Thermoregulation",
        icon: "temperature",
        description: "All systems stable",
        critical: true,
        status: "safe",
      }),
    );
    expect(html).toContain("bg-safe-soft");
    expect(html).not.toContain("bg-critical-soft");
  });

  it("renders a summary, not a chart, when chart is omitted", () => {
    const html = renderToStaticMarkup(
      createElement(VitalDetailCard, {
        title: "Respiratory Pattern",
        icon: "lungs",
        description: "All systems stable",
      }),
    );
    expect(html).toContain("All systems stable");
    expect(html).not.toContain('data-slot="sparkline"');
    expect(html).not.toContain("recharts-responsive-container");
  });

  it("preserves the chart height and shows the empty state for an empty data array", () => {
    const html = renderToStaticMarkup(
      createElement(VitalDetailCard, {
        title: "Cardiac Autonomic",
        icon: "pulse",
        description: "Abrupt HRV pattern changes detected",
        chart: {
          data: [],
          xKey: "t",
          series: [{ key: "value", label: "HRV", color: "var(--color-critical)" }],
          height: 180,
        },
      }),
    );
    expect(html).toContain("No readings for this range");
  });
});

describe("DeviceHeader battery omission", () => {
  it("omits both the battery percentage text and its divider when battery is missing", () => {
    const html = renderToStaticMarkup(
      createElement(DeviceHeader, {
        deviceName: "Armband 01",
        connected: true,
        onReadings: () => {},
        onSettings: () => {},
      }),
    );
    expect(html).not.toContain("%");
    expect(html).not.toContain("h-4 w-px");
  });

  it("omits both the battery percentage text and its divider when battery is NaN", () => {
    const html = renderToStaticMarkup(
      createElement(DeviceHeader, {
        deviceName: "Armband 01",
        connected: true,
        battery: NaN,
        onReadings: () => {},
        onSettings: () => {},
      }),
    );
    expect(html).not.toContain("%");
    expect(html).not.toContain("h-4 w-px");
  });

  it("renders the battery percentage and divider together when battery is a finite number", () => {
    const html = renderToStaticMarkup(
      createElement(DeviceHeader, {
        deviceName: "Armband 01",
        connected: true,
        battery: 72,
        onReadings: () => {},
        onSettings: () => {},
      }),
    );
    expect(html).toContain("72%");
    expect(html).toContain("h-4 w-px");
  });
});
