import { readThemeBlock, getExactToken } from "../_lib/tokens";
import { TokenSwatchGrid } from "../_lib/token-swatch";
import { CodeBlock } from "../_lib/code-block";
import { ProgressPlayground } from "./progress-playground";

/**
 * Live Progress + BatteryIndicator docs route (06-18 Task 1). Both share the
 * same restyled `progress.tsx` primitive (Figma node 203-11669) — this page
 * covers them together so the reader sees exactly how one shared bar
 * diverges visually for the generic-percentage vs. battery-level use cases.
 */
const PROGRESS_TOKENS = [
  "--color-safe-soft",
  "--color-safe-fill",
  "--color-safe",
  "--radius-full",
];

export default function DesignSystemDocsProgressPage() {
  const themeBlock = readThemeBlock();
  const tokens = PROGRESS_TOKENS.map((name) => ({
    name,
    value: getExactToken(themeBlock, name),
  }));

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          Progress / Battery Indicator
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          <code className="text-caption">Progress</code> is the generic,
          percentage-driven horizontal bar (Radix{" "}
          <code className="text-caption">Progress</code>, restyled against
          Figma node 203-11669).{" "}
          <code className="text-caption">BatteryIndicator</code> is a domain
          composite that wraps the exact same primitive with a leading
          battery/charging glyph and a numeric label for the device-status
          header — there is no second bar implementation, only one restyled
          primitive reused two ways.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-semibold text-text">
          Live preview
        </h2>
        <p className="max-w-2xl text-body text-text-secondary">
          Drag the slider — both the bare{" "}
          <code className="text-caption">Progress</code> bar and the{" "}
          <code className="text-caption">BatteryIndicator</code> below update
          from the exact same 0&ndash;100 value. Toggle Charging to see
          BatteryIndicator swap its leading glyph.
        </p>
        <ProgressPlayground />
      </section>

      <section className="flex flex-col gap-4 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">
          Tokens Progress consumes
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
              "// Bare progress bar — consumer composes its own label if one is needed",
              "<Progress value={72} />",
              "",
              "// BatteryIndicator composes the label + glyph for you",
              "<BatteryIndicator level={90} />",
              "<BatteryIndicator level={42} charging />",
            ]}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-body font-semibold text-text">
            Incorrect usage
          </h3>
          <CodeBlock
            lines={[
              "// Do not hand-roll a percentage bar with a raw <div> — Progress",
              "// already provides the ARIA role/attributes a bare <div> would",
              "// have to re-implement.",
              '<div className="h-1.5 w-full rounded-full bg-safe-soft">',
              '  <div className="h-full rounded-full bg-safe-fill" style={{ width: "72%" }} />',
              "</div>",
              "",
              "// Do not draw a new battery-glyph SVG for the track — icon.tsx's",
              "// existing battery/charging glyphs already supply the silhouette.",
            ]}
          />
        </div>

        <p className="max-w-2xl text-body text-text-secondary">
          Only one visual treatment has been Figma-extracted for{" "}
          <code className="text-caption">Progress</code> in this phase —
          there is intentionally no <code className="text-caption">
            variant
          </code>{" "}
          prop. An indeterminate/loading track state is flagged in
          progress.DESIGN.md as a documented backstop, not yet implemented —
          no current consumer needs it.
        </p>
      </section>
    </div>
  );
}
