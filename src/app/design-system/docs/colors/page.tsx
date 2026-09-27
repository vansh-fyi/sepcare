import {
  groupSemanticColorTokens,
  parseThemeTokens,
  parsePrimitiveRamps,
  readThemeBlock,
} from "../_lib/tokens";

/**
 * Live color-token reference (06-11 Task 2) — replaces the old single-scroll
 * page's raw-text color list with real, labeled swatches sourced straight
 * from the compiled `@theme` block, never retyped by hand.
 *
 * DSYS-03 empty-input resolution: if `groupSemanticColorTokens` ever
 * resolves to zero groups (every semantic --color-* category empty), the
 * "Semantic roles" section below renders an explicit "No tokens in this
 * category" note instead of a blank/broken grid — verified during Task 2
 * that `parseThemeTokens(themeBlock, "--color-nonexistent-")` returns `[]`
 * without throwing (scratch check run and removed before finishing).
 */

const TRI_STATE_ROWS: {
  status: "Safe" | "Caution" | "Critical";
  primary: string;
  onFill: string | null;
  soft: string;
  dark: string;
}[] = [
  { status: "Safe", primary: "--color-safe", onFill: null, soft: "--color-safe-soft", dark: "--color-safe-dark" },
  { status: "Caution", primary: "--color-caution", onFill: null, soft: "--color-caution-soft", dark: "--color-caution-dark" },
  { status: "Critical", primary: "--color-critical", onFill: "--color-critical-fill", soft: "--color-critical-soft", dark: "--color-critical-dark" },
];

function Swatch({ label, value }: { label: string; value: string }) {
  const isApplicable = value !== "—";
  return (
    <div className="flex flex-col gap-1">
      {isApplicable ? (
        <div
          className="h-14 w-full rounded-card-sm border border-border-subtle"
          style={{ backgroundColor: value }}
          title={value}
        />
      ) : (
        <div className="flex h-14 w-full items-center justify-center rounded-card-sm border border-dashed border-border-subtle text-caption text-text-subtle">
          N/A
        </div>
      )}
      <span className="text-caption text-text-muted">{label}</span>
      <code className="text-caption text-text-subtle">{value}</code>
    </div>
  );
}

export default function DesignSystemDocsColorsPage() {
  const themeBlock = readThemeBlock();
  const primitiveRamps = parsePrimitiveRamps(themeBlock);
  const semanticGroups = groupSemanticColorTokens(themeBlock);
  const allColorTokens = parseThemeTokens(themeBlock, "--color-");

  const lookup = (name: string | null) =>
    name ? allColorTokens.find((t) => t.name === name)?.value ?? "—" : "—";

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          Colors
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          Primitive ramps sourced verbatim from Figma Segue 3.0, live-parsed
          from <code className="text-caption">globals.css</code> — never
          retyped by hand. Semantic roles below are the ones components
          actually consume.
        </p>
      </header>

      <section className="flex flex-col gap-6">
        <h2 className="text-heading font-semibold text-text">
          Primitive ramps
        </h2>
        <div className="flex flex-col gap-8">
          {primitiveRamps.map(({ ramp, steps }) => (
            <div key={ramp} className="flex flex-col gap-2">
              <h3 className="text-label font-semibold text-text capitalize">
                {ramp}
              </h3>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-9">
                {steps.map(({ step, value }) => (
                  <Swatch key={step} label={String(step)} value={value} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="text-heading font-semibold text-text">
          Semantic roles
        </h2>
        {semanticGroups.length === 0 ? (
          <p className="text-body text-text-muted">No tokens in this category.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {semanticGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-2">
                <h3 className="text-label font-semibold text-text">
                  {group.title}
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {group.tokens.map((token) => (
                    <div
                      key={token.name}
                      className="flex items-center gap-2 rounded-card-sm border border-border-subtle p-2"
                    >
                      <div
                        className="h-8 w-8 shrink-0 rounded-full border border-border-subtle"
                        style={{ backgroundColor: token.value }}
                        title={token.value}
                      />
                      <code className="truncate text-caption text-text-secondary">
                        {token.name}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="text-heading font-semibold text-text">
          Tri-state health status
        </h2>
        <p className="max-w-2xl text-body text-text-secondary">
          Safe / Caution / Critical — always paired with an icon and a label,
          never color alone.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-body text-text-secondary">
            <thead>
              <tr className="text-left text-label font-semibold text-text">
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Primary</th>
                <th className="pb-2 pr-4">On-fill</th>
                <th className="pb-2 pr-4">Soft</th>
                <th className="pb-2">Dark</th>
              </tr>
            </thead>
            <tbody>
              {TRI_STATE_ROWS.map((row) => (
                <tr key={row.status} className="border-t border-border-subtle">
                  <td className="py-2 pr-4 text-label font-semibold text-text">
                    {row.status}
                  </td>
                  <td className="py-2 pr-4">
                    <Swatch label="Primary" value={lookup(row.primary)} />
                  </td>
                  <td className="py-2 pr-4">
                    <Swatch label="On-fill" value={lookup(row.onFill)} />
                  </td>
                  <td className="py-2 pr-4">
                    <Swatch label="Soft" value={lookup(row.soft)} />
                  </td>
                  <td className="py-2">
                    <Swatch label="Dark" value={lookup(row.dark)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
