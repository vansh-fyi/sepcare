import { readThemeBlock, getExactToken } from "../_lib/tokens";
import { TokenSwatchGrid } from "../_lib/token-swatch";
import { CodeBlock } from "../_lib/code-block";
import {
  Field,
  FieldSet,
  FieldLegend,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

/**
 * Live RadioGroup docs route (06-16 Task 3). RadioGroup is a Client
 * Component (radix-ui RadioGroup.Root) rendered uncontrolled below —
 * clicking (or arrow-keying between) the options is Radix's own real
 * keyboard-navigation state machine. No dedicated Figma frame exists for
 * RadioGroup — stated plainly rather than implying a Figma source, per
 * radio-group.DESIGN.md.
 */
const RADIO_GROUP_TOKENS = [
  "--color-brand-fill",
  "--color-border",
  "--duration-fast",
];

export default function DesignSystemDocsRadioGroupPage() {
  const themeBlock = readThemeBlock();
  const tokens = RADIO_GROUP_TOKENS.map((name) => ({
    name,
    value: getExactToken(themeBlock, name),
  }));

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          Radio Group
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          The project&rsquo;s single-choice-from-a-set field primitive,
          always composed inside{" "}
          <a
            href="/design-system/docs/field"
            className="underline underline-offset-4 hover:text-brand"
          >
            Field
          </a>
          . <strong className="font-semibold text-text">
            No dedicated Figma frame exists for RadioGroup
          </strong>{" "}
          — its checked-state fill reuses the same{" "}
          <code className="text-caption">bg-brand-fill</code> convention
          established for{" "}
          <a
            href="/design-system/docs/checkbox"
            className="underline underline-offset-4 hover:text-brand"
          >
            Checkbox
          </a>{" "}
          so the toggle-family controls read as visually identical, not a
          guessed Figma source.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-semibold text-text">Live preview</h2>
        <p className="max-w-2xl text-body text-text-secondary">
          Click any option below (or use arrow keys once focused) — this is
          Radix&rsquo;s own real keyboard-navigation state machine.
        </p>
        <div className="flex flex-col gap-6 rounded-card-sm border border-border-subtle bg-bg p-8">
          <FieldSet>
            <FieldLegend>Alert sensitivity</FieldLegend>
            <FieldDescription>
              Choose how quickly caregivers are notified.
            </FieldDescription>
            <RadioGroup defaultValue="balanced">
              <Field orientation="horizontal">
                <RadioGroupItem
                  value="conservative"
                  id="docs-sensitivity-conservative"
                />
                <FieldLabel htmlFor="docs-sensitivity-conservative">
                  Conservative
                </FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <RadioGroupItem value="balanced" id="docs-sensitivity-balanced" />
                <FieldLabel htmlFor="docs-sensitivity-balanced">
                  Balanced
                </FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <RadioGroupItem
                  value="aggressive"
                  id="docs-sensitivity-aggressive"
                />
                <FieldLabel htmlFor="docs-sensitivity-aggressive">
                  Aggressive
                </FieldLabel>
              </Field>
            </RadioGroup>
          </FieldSet>

          <Field data-invalid="true">
            <RadioGroup aria-invalid>
              <Field orientation="horizontal">
                <RadioGroupItem value="a" id="docs-choice-a" aria-invalid />
                <FieldLabel htmlFor="docs-choice-a">Option A</FieldLabel>
              </Field>
            </RadioGroup>
            <FieldError>Please select one option.</FieldError>
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">
          Tokens Radio Group consumes
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
              "<FieldSet>",
              "  <FieldLegend>Alert sensitivity</FieldLegend>",
              '  <RadioGroup defaultValue="balanced">',
              '    <Field orientation="horizontal">',
              '      <RadioGroupItem value="balanced" id="sensitivity-balanced" />',
              '      <FieldLabel htmlFor="sensitivity-balanced">Balanced</FieldLabel>',
              "    </Field>",
              "  </RadioGroup>",
              "</FieldSet>",
            ]}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-body font-semibold text-text">
            Incorrect usage
          </h3>
          <CodeBlock
            lines={[
              "// ✗ Do not hand-roll a div-based radio group with manual",
              "// tabIndex/arrow-key wiring — Radix's RadioGroupPrimitive",
              "// already solves keyboard navigation and aria-checked state.",
              "// ✗ Do not re-invent Input's bespoke inline error-slot pattern —",
              "// Field/FieldError is the canonical wrapper.",
            ]}
          />
        </div>

        <p className="max-w-2xl text-body text-text-secondary">
          The indicator dot is a plain filled{" "}
          <code className="text-caption">{"<span>"}</code>, not a stroked{" "}
          <code className="text-caption">Icon</code> glyph — a solid dot is
          the correct visual for a radio control, unlike this project&rsquo;s
          stroke-based icon system.
        </p>
      </section>
    </div>
  );
}
