import { readThemeBlock, getExactToken } from "../_lib/tokens";
import { TokenSwatchGrid } from "../_lib/token-swatch";
import { CodeBlock } from "../_lib/code-block";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/**
 * Live ToggleGroup docs route (06-18 Task 2). `ToggleGroup` already manages
 * its own uncontrolled Radix state client-side ("use client" in
 * toggle-group.tsx) — this page stays a pure Server Component (reads live
 * token values via node:fs) and renders two real, independently clickable
 * instances side by side to prove the cross-phase reuse contract live: this
 * phase's 1D/1W/1M time-scale toggle (Figma node 203-11938) and Phase 7's
 * caregiver trend-graph label set (REQUIREMENTS.md CARE-04, 1h/6h/24h) on
 * the exact same underlying component, zero code duplication.
 */
const TOGGLE_GROUP_TOKENS = [
  "--radius-btn",
  "--color-brand-fill",
  "--color-text-inverse",
  "--color-border-focus",
];

export default function DesignSystemDocsToggleGroupPage() {
  const themeBlock = readThemeBlock();
  const tokens = TOGGLE_GROUP_TOKENS.map((name) => ({
    name,
    value: getExactToken(themeBlock, name),
  }));

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          Toggle Group
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          The generic segmented control behind the time-scale toggle (Figma
          node 203-11938). No dedicated per-value Figma extraction exists for
          this node — restyled token-consistent with Button/Card/Item rather
          than guessed bespoke values (see toggle-group.DESIGN.md). The
          component itself carries zero hardcoded range-label strings.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-semibold text-text">
          Live preview — cross-phase reuse, proven
        </h2>
        <p className="max-w-2xl text-body text-text-secondary">
          Both segmented controls below are the exact same{" "}
          <code className="text-caption">ToggleGroup</code>/
          <code className="text-caption">ToggleGroupItem</code> primitive,
          with no per-range wrapper component. Click either one — Radix&rsquo;s
          own uncontrolled state makes each independently interactive.
        </p>
        <div className="flex flex-wrap gap-8 rounded-card-sm border border-border-subtle bg-bg p-8">
          <div className="flex flex-col gap-2">
            <p className="text-caption font-semibold text-text-muted">
              This phase&rsquo;s chart time-scale toggle
            </p>
            <ToggleGroup type="single" defaultValue="1d">
              <ToggleGroupItem value="1d">1D</ToggleGroupItem>
              <ToggleGroupItem value="1w">1W</ToggleGroupItem>
              <ToggleGroupItem value="1m">1M</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-caption font-semibold text-text-muted">
              Phase 7&rsquo;s caregiver trend graph (REQUIREMENTS.md CARE-04)
            </p>
            <ToggleGroup type="single" defaultValue="6h">
              <ToggleGroupItem value="1h">1h</ToggleGroupItem>
              <ToggleGroupItem value="6h">6h</ToggleGroupItem>
              <ToggleGroupItem value="24h">24h</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">
          Tokens Toggle Group consumes
        </h2>
        <TokenSwatchGrid tokens={tokens} />
      </section>

      <section className="flex flex-col gap-6 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">
          Usage notes
        </h2>

        <div className="flex flex-col gap-3">
          <h3 className="text-body font-semibold text-text">
            Correct usage
          </h3>
          <CodeBlock
            lines={[
              '<ToggleGroup type="single" defaultValue="1d">',
              '  <ToggleGroupItem value="1d">1D</ToggleGroupItem>',
              '  <ToggleGroupItem value="1w">1W</ToggleGroupItem>',
              '  <ToggleGroupItem value="1m">1M</ToggleGroupItem>',
              "</ToggleGroup>",
              "",
              '<ToggleGroup type="single" defaultValue="6h">',
              '  <ToggleGroupItem value="1h">1h</ToggleGroupItem>',
              '  <ToggleGroupItem value="6h">6h</ToggleGroupItem>',
              '  <ToggleGroupItem value="24h">24h</ToggleGroupItem>',
              "</ToggleGroup>",
            ]}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-body font-semibold text-text">
            Incorrect usage
          </h3>
          <CodeBlock
            lines={[
              "// Do not bake range semantics into the component itself (e.g. a",
              "// hardcoded TimeScaleToggle wrapper with a fixed union prop) —",
              "// that would block Phase 7's reuse with a different labeled set",
              "// on the exact same primitive.",
              'function TimeScaleToggle({ value }: { value: "1D" | "1W" | "1M" }) {',
              "  /* ... */",
              "}",
            ]}
          />
        </div>

        <p className="max-w-2xl text-body text-text-secondary">
          Segmented-control labels are expected to stay short (
          <code className="text-caption">1D</code>/
          <code className="text-caption">1h</code>/single words) — no
          long-text overflow handling was added, since no consumer usage in
          this phase&rsquo;s scope requires it.
        </p>
      </section>
    </div>
  );
}
