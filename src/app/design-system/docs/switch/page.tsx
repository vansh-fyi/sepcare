import { readThemeBlock, getExactToken } from "../_lib/tokens";
import { TokenSwatchGrid } from "../_lib/token-swatch";
import { CodeBlock } from "../_lib/code-block";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

/**
 * Live Switch docs route (06-16 Task 3). Switch is a Client Component
 * (radix-ui Switch.Root) rendered uncontrolled below — clicking it is
 * Radix's own real toggle, no wrapper state needed. No dedicated Figma
 * frame exists for Switch — stated plainly rather than implying a Figma
 * source, per switch.DESIGN.md.
 */
const SWITCH_TOKENS = ["--color-brand-fill", "--color-border", "--duration-fast"];

export default function DesignSystemDocsSwitchPage() {
  const themeBlock = readThemeBlock();
  const tokens = SWITCH_TOKENS.map((name) => ({
    name,
    value: getExactToken(themeBlock, name),
  }));

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          Switch
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          The project&rsquo;s toggle-field primitive, always composed inside{" "}
          <a
            href="/design-system/docs/field"
            className="underline underline-offset-4 hover:text-brand"
          >
            Field
          </a>
          . <strong className="font-semibold text-text">
            No dedicated Figma frame exists for Switch
          </strong>{" "}
          — its checked-state track fill reuses the same{" "}
          <code className="text-caption">bg-brand-fill</code> convention
          established for{" "}
          <a
            href="/design-system/docs/checkbox"
            className="underline underline-offset-4 hover:text-brand"
          >
            Checkbox
          </a>{" "}
          and{" "}
          <a
            href="/design-system/docs/radio-group"
            className="underline underline-offset-4 hover:text-brand"
          >
            Radio Group
          </a>{" "}
          so all three toggle-family controls share one checked-state color,
          not a guessed Figma source.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-semibold text-text">Live preview</h2>
        <p className="max-w-2xl text-body text-text-secondary">
          Click either switch below — a real click, not a static two-image
          comparison. Press feedback applies to the thumb only, matching how
          a physical switch&rsquo;s moving part animates.
        </p>
        <div className="flex flex-col gap-4 rounded-card-sm border border-border-subtle bg-bg p-8">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="docs-switch-realtime-alerts">
                Real-time alerts
              </FieldLabel>
              <FieldDescription>
                Push a notification the moment risk crosses Amber.
              </FieldDescription>
            </FieldContent>
            <Switch id="docs-switch-realtime-alerts" defaultChecked />
          </Field>

          <Field data-invalid="true" orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="docs-switch-offline-sync">
                Offline sync
              </FieldLabel>
              <FieldError>
                Could not save this preference — try again.
              </FieldError>
            </FieldContent>
            <Switch id="docs-switch-offline-sync" aria-invalid />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">
          Tokens Switch consumes
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
              '<Field orientation="horizontal">',
              "  <FieldContent>",
              '    <FieldLabel htmlFor="realtime-alerts">',
              "      Real-time alerts",
              "    </FieldLabel>",
              "    <FieldDescription>",
              "      Push a notification the moment risk crosses Amber.",
              "    </FieldDescription>",
              "  </FieldContent>",
              '  <Switch id="realtime-alerts" />',
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
              "// ✗ Do not hand-roll a div-based toggle with manual tabIndex/",
              "// aria-* wiring — Radix's SwitchPrimitive already solves",
              "// keyboard focus and aria-checked state.",
              "// ✗ Do not re-invent Input's bespoke inline error-slot pattern —",
              "// Field/FieldError is the canonical wrapper.",
            ]}
          />
        </div>

        <p className="max-w-2xl text-body text-text-secondary">
          The root (<code className="text-caption">SwitchPrimitive.Root</code>
          ) is the actual focusable/pressable element, so the thumb reads its{" "}
          <code className="text-caption">:active</code> state via{" "}
          <code className="text-caption">group-active/switch</code> rather
          than its own (non-interactive){" "}
          <code className="text-caption">active:</code> pseudo-class.
        </p>
      </section>
    </div>
  );
}
