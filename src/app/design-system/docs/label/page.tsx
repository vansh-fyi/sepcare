import { readThemeBlock, getExactToken } from "../_lib/tokens";
import { TokenSwatchGrid } from "../_lib/token-swatch";
import { CodeBlock } from "../_lib/code-block";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

/**
 * Live Label docs route (06-16 Task 2). Label is the shadcn radix-ui
 * Label.Root wrapper, restyled onto `text-label font-semibold` — going
 * forward it is primarily consumed through `FieldLabel` inside `Field`
 * rather than used bare, but both usages render below, live.
 */
const LABEL_TOKENS = ["--text-label", "--color-text"];

export default function DesignSystemDocsLabelPage() {
  const themeBlock = readThemeBlock();
  const tokens = LABEL_TOKENS.map((name) => ({
    name,
    value: getExactToken(themeBlock, name),
  }));

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          Label
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          The shadcn <code className="text-caption">radix-ui</code>{" "}
          <code className="text-caption">Label.Root</code> wrapper, restyled
          to <code className="text-caption">text-label font-semibold</code>{" "}
          (13px/600 semibold). No dedicated Figma node exists for Label — a
          token-consistent, not Figma-node-verified disposition, matching the
          same honest note already used for Badge and Item.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-semibold text-text">Live preview</h2>
        <div className="flex flex-wrap gap-8 rounded-card-sm border border-border-subtle bg-bg p-8">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="docs-label-device-id">Device ID</Label>
            <Input id="docs-label-device-id" placeholder="e.g. nb-001" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="docs-label-disabled" className="opacity-50">
              Device ID (disabled group)
            </Label>
            <Input
              id="docs-label-disabled"
              placeholder="e.g. nb-001"
              disabled
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">
          Tokens Label consumes
        </h2>
        <TokenSwatchGrid tokens={tokens} />
      </section>

      <section className="flex flex-col gap-6 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">Usage notes</h2>

        <div className="flex flex-col gap-3">
          <h3 className="text-body font-semibold text-text">
            Correct usage
          </h3>
          <CodeBlock
            lines={[
              '<Label htmlFor="device-id">Device ID</Label>',
              '<Input id="device-id" placeholder="e.g. nb-001" />',
              "",
              "// Preferred going forward — via Field/FieldLabel:",
              "<Field>",
              '  <FieldLabel htmlFor="device-id">Device ID</FieldLabel>',
              '  <Input id="device-id" placeholder="e.g. nb-001" />',
              "</Field>",
            ]}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-body font-semibold text-text">
            Incorrect usage
          </h3>
          <CodeBlock
            lines={[
              "// ✗ Do not hand-roll a <label> with ad hoc text classes —",
              "// this is exactly the pattern nested/page.tsx used before",
              "// Label existed.",
              '<label className="text-xs font-bold">Device ID</label>',
            ]}
          />
        </div>

        <p className="max-w-2xl text-body text-text-secondary">
          Consumed primarily through{" "}
          <a
            href="/design-system/docs/field"
            className="underline underline-offset-4 hover:text-brand"
          >
            Field
          </a>
          &rsquo;s <code className="text-caption">FieldLabel</code> — this
          page is the direct/bare usage, not the recommended default for new
          form compositions.
        </p>
      </section>
    </div>
  );
}
