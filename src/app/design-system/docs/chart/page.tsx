import { readThemeBlock, getExactToken } from "../_lib/tokens";
import { TokenSwatchGrid } from "../_lib/token-swatch";
import { CodeBlock } from "../_lib/code-block";
import { ChartPlayground } from "./chart-playground";

/**
 * Live Chart docs route (06-18 Task 3) — `VitalsTrendChart`, the larger,
 * fully-labeled analytics chart composing chart.tsx's `ChartContainer`
 * chrome (Figma node 203-13216, "Perfusion Index"). Deliberately distinct
 * from Sparkline (see /design-system/docs/sparkline) — do not conflate the
 * two.
 */
const CHART_TOKENS = [
  "--color-critical",
  "--color-brand",
  "--color-safe",
  "--color-surface",
  "--shadow-floating",
];

export default function DesignSystemDocsChartPage() {
  const themeBlock = readThemeBlock();
  const tokens = CHART_TOKENS.map((name) => ({
    name,
    value: getExactToken(themeBlock, name),
  }));

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          Chart
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          <code className="text-caption">VitalsTrendChart</code> is the
          larger, fully-labeled analytics chart — axes, tooltip, and (when
          multi-series) a legend — composing{" "}
          <code className="text-caption">chart.tsx</code>&rsquo;s restyled{" "}
          <code className="text-caption">ChartContainer</code> chrome.
          Verified against Figma node 203-13216 (&ldquo;Perfusion
          Index&rdquo;), a real single-axis frame; the component genuinely
          supports a second Y-axis when a series opts in via{" "}
          <code className="text-caption">
            yAxisId: &quot;right&quot;
          </code>
          , but never forces one onto data that doesn&rsquo;t need it.
          Deliberately distinct from{" "}
          <a
            href="/design-system/docs/sparkline"
            className="underline underline-offset-4 hover:text-brand"
          >
            Sparkline
          </a>{" "}
          — do not conflate the two.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-semibold text-text">
          Live preview
        </h2>
        <p className="max-w-2xl text-body text-text-secondary">
          Real mock time-series data below, plus a toggle switching to the
          locked empty-state copy — &ldquo;No data for this range yet.&rdquo;
          — sized identically to the populated chart, so toggling produces
          no visible reflow.
        </p>
        <ChartPlayground />
      </section>

      <section className="flex flex-col gap-4 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">
          Tokens Chart consumes
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
              "<VitalsTrendChart",
              '  xKey="time"',
              "  data={data}",
              "  series={[",
              '    { key: "perfusion", label: "Perfusion Index", color: "var(--color-critical)" },',
              "  ]}",
              "/>",
            ]}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-body font-semibold text-text">
            Incorrect usage
          </h3>
          <CodeBlock
            lines={[
              "// Do not hardcode a hex/rgb color on a series — always route",
              "// through series[].color -> ChartConfig -> var(--color-{key}).",
              '{ key: "pulse", label: "Pulse", color: "#2563EB" }',
              "",
              "// Do not reuse Sparkline's chromeless treatment here — this",
              "// primitive exists specifically for the fully-labeled use case.",
            ]}
          />
        </div>

        <p className="max-w-2xl text-body text-text-secondary">
          Once any <code className="text-caption">YAxis</code> declares an
          explicit <code className="text-caption">yAxisId</code>, every{" "}
          <code className="text-caption">Line</code> must declare a matching
          one — <code className="text-caption">VitalsTrendChart</code>{" "}
          handles this internally via its <code className="text-caption">
            series
          </code>{" "}
          config array, so a caller never has to think about the Recharts
          constraint directly.
        </p>
      </section>
    </div>
  );
}
