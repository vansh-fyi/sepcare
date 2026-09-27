import { readThemeBlock, getExactToken } from "../_lib/tokens";
import { TokenSwatchGrid } from "../_lib/token-swatch";
import { CodeBlock } from "../_lib/code-block";
import { SparklinePlayground } from "./sparkline-playground";

/**
 * Live Sparkline docs route (06-18 Task 3) — the chromeless inline trend
 * glyph for vital-stat cards (Figma nodes 266-9350 "Pulse", 266-9363
 * "Temp"). Deliberately distinct from the fully-labeled `Chart` primitive
 * (see /design-system/docs/chart) — this page explicitly calls out the
 * distinction rather than letting a reader conflate the two.
 */
const SPARKLINE_TOKENS = [
  "--color-safe",
  "--color-caution",
  "--color-critical",
  "--color-text-inverse",
];

export default function DesignSystemDocsSparklinePage() {
  const themeBlock = readThemeBlock();
  const tokens = SPARKLINE_TOKENS.map((name) => ({
    name,
    value: getExactToken(themeBlock, name),
  }));

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          Sparkline
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          A chromeless inline trend glyph for the 76&times;26px vital-stat
          card slot (Figma nodes 266-9350 &ldquo;Pulse&rdquo;, 266-9363
          &ldquo;Temp&rdquo;) — a single Recharts{" "}
          <code className="text-caption">Line</code>, nothing else.{" "}
          <strong className="font-semibold text-text">
            No axes, tooltip, legend, or grid — ever.
          </strong>{" "}
          Deliberately distinct from{" "}
          <a
            href="/design-system/docs/chart"
            className="underline underline-offset-4 hover:text-brand"
          >
            Chart
          </a>
          &rsquo;s fully-labeled use case; a future need for that chrome
          should reach for{" "}
          <code className="text-caption">VitalsTrendChart</code> instead of
          an expanded Sparkline.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-semibold text-text">
          Live preview
        </h2>
        <p className="max-w-2xl text-body text-text-secondary">
          Three live mock trend shapes — rising, falling, flat — plus a
          toggle switching all three to the locked empty-state copy:
          &ldquo;No data for this range yet.&rdquo; Each slot stays the same
          height in both states, so toggling produces no visible reflow.
        </p>
        <SparklinePlayground />
      </section>

      <section className="flex flex-col gap-4 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">
          Tokens Sparkline consumes
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
              'import { Sparkline } from "@/components/ui/sparkline"',
              "",
              "export function PulseVitalCard({ trend }: { trend: { value: number }[] }) {",
              "  return (",
              '    <div className="rounded-card bg-gradient-to-br from-blue-500 to-blue-400 p-4">',
              '      <p className="text-label font-semibold text-text-inverse">Pulse</p>',
              '      <Sparkline data={trend} color="var(--color-text-inverse)" />',
              '      <p className="text-vital-metric text-text-inverse">128 bpm</p>',
              "    </div>",
              "  )",
              "}",
            ]}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-body font-semibold text-text">
            Incorrect usage
          </h3>
          <CodeBlock
            lines={[
              "// Do not add axes/tooltip/legend/grid — that turns Sparkline",
              "// into a second, redundant Chart primitive. Use VitalsTrendChart.",
              "<LineChart data={data}>",
              '  <XAxis dataKey="time" />',
              "  <Tooltip />",
              '  <Line dataKey="value" />',
              "</LineChart>",
            ]}
          />
        </div>

        <p className="max-w-2xl text-body text-text-secondary">
          The real Vital Stat Card usage (node 266-9344) renders the line{" "}
          <strong className="font-semibold text-text">white</strong>, not
          status-colored — the whole card background is itself the status
          gradient, so{" "}
          <code className="text-caption">
            color=&quot;var(--color-text-inverse)&quot;
          </code>{" "}
          is passed explicitly at that call site. The component&rsquo;s own
          default (<code className="text-caption">var(--color-safe)</code>)
          is for generic reuse outside that gradient context.
        </p>
      </section>
    </div>
  );
}
