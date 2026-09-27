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
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Live Checkbox docs route (06-16 Task 3). Checkbox is a Client Component
 * (radix-ui Checkbox.Root) rendered uncontrolled below — clicking it is a
 * real, native toggle, no extra picker state needed at the page level. No
 * dedicated Figma frame exists for Checkbox — this page states that plainly
 * rather than implying a Figma source, per checkbox.DESIGN.md.
 */
const CHECKBOX_TOKENS = ["--color-brand-fill", "--color-border", "--duration-fast"];

export default function DesignSystemDocsCheckboxPage() {
  const themeBlock = readThemeBlock();
  const tokens = CHECKBOX_TOKENS.map((name) => ({
    name,
    value: getExactToken(themeBlock, name),
  }));

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          Checkbox
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          The project&rsquo;s single-toggle boolean field primitive, always
          composed inside{" "}
          <a
            href="/design-system/docs/field"
            className="underline underline-offset-4 hover:text-brand"
          >
            Field
          </a>
          . <strong className="font-semibold text-text">
            No dedicated Figma frame exists for Checkbox
          </strong>{" "}
          — its checked-state fill reuses the same blue-accent convention
          already used by Input&rsquo;s focus ring and Button&rsquo;s primary
          variant, a token-consistent-not-node-verified disposition, not a
          guessed Figma source.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-semibold text-text">Live preview</h2>
        <p className="max-w-2xl text-body text-text-secondary">
          Click either checkbox below — this is Radix&rsquo;s own real{" "}
          <code className="text-caption">aria-checked</code>/keyboard-focus
          state machine, not a static comparison image.
        </p>
        <div className="flex flex-col gap-4 rounded-card-sm border border-border-subtle bg-bg p-8">
          <Field orientation="horizontal">
            <Checkbox id="docs-checkbox-demo" defaultChecked />
            <FieldContent>
              <FieldLabel htmlFor="docs-checkbox-demo">
                Notify caregiver on Amber+
              </FieldLabel>
              <FieldDescription>
                Sends a push alert when the risk signal reaches Amber or
                Red.
              </FieldDescription>
            </FieldContent>
          </Field>

          <Field data-invalid="true" orientation="horizontal">
            <Checkbox id="docs-checkbox-error" aria-invalid />
            <FieldContent>
              <FieldLabel htmlFor="docs-checkbox-error">
                I consent to data storage
              </FieldLabel>
              <FieldError>You must accept before continuing.</FieldError>
            </FieldContent>
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">
          Tokens Checkbox consumes
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
              '  <Checkbox id="notify-caregiver" />',
              "  <FieldContent>",
              '    <FieldLabel htmlFor="notify-caregiver">',
              "      Notify caregiver on Amber+",
              "    </FieldLabel>",
              "    <FieldDescription>",
              "      Sends a push alert when the risk signal reaches Amber or Red.",
              "    </FieldDescription>",
              "  </FieldContent>",
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
              "// ✗ Do not hand-roll a div-based checkbox with manual tabIndex/",
              "// aria-* wiring — Radix's CheckboxPrimitive already solves",
              "// keyboard focus and aria-checked state.",
              "// ✗ Do not re-invent Input's bespoke inline error-slot pattern —",
              "// Field/FieldError is the canonical wrapper.",
            ]}
          />
        </div>

        <p className="max-w-2xl text-body text-text-secondary">
          <code className="text-caption">
            disabled:opacity-50 disabled:cursor-not-allowed
          </code>{" "}
          on the root is the exact same treatment Input/Select/Textarea/Field
          already use — no new pattern invented for the toggle family.
        </p>
      </section>
    </div>
  );
}
