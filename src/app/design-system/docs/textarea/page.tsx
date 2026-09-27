import { readThemeBlock, getExactToken } from "../_lib/tokens";
import { TokenSwatchGrid } from "../_lib/token-swatch";
import { CodeBlock } from "../_lib/code-block";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

/**
 * Live Textarea docs route (06-16 Task 2). Textarea is the multi-line
 * counterpart to Input, always composed inside Field. No dedicated Figma
 * frame exists for Textarea; token-consistent, not node-verified — reuses
 * Input's exact border/radius/focus-ring treatment.
 */
const TEXTAREA_TOKENS = [
  "--radius-input",
  "--color-border",
  "--color-border-focus",
  "--shadow-focus",
];

export default function DesignSystemDocsTextareaPage() {
  const themeBlock = readThemeBlock();
  const tokens = TEXTAREA_TOKENS.map((name) => ({
    name,
    value: getExactToken(themeBlock, name),
  }));

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          Textarea
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          The project&rsquo;s multi-line text-entry primitive — the direct
          counterpart to{" "}
          <a
            href="/design-system/docs/input"
            className="underline underline-offset-4 hover:text-brand"
          >
            Input
          </a>{" "}
          for longer free-text content, always composed inside{" "}
          <a
            href="/design-system/docs/field"
            className="underline underline-offset-4 hover:text-brand"
          >
            Field
          </a>
          . No dedicated Figma frame exists for Textarea — token-consistent,
          not node-verified, reusing Input&rsquo;s exact tokens.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-semibold text-text">Live preview</h2>
        <p className="max-w-2xl text-body text-text-secondary">
          Both fields below are real, focusable, resizable-with-content
          textareas.
        </p>
        <div className="flex flex-wrap gap-8 rounded-card-sm border border-border-subtle bg-bg p-8">
          <Field className="w-72">
            <FieldLabel htmlFor="docs-textarea-notes">
              Caregiver notes
            </FieldLabel>
            <Textarea
              id="docs-textarea-notes"
              placeholder="Add any observations..."
            />
            <FieldDescription>
              Visible to other caregivers on this device.
            </FieldDescription>
          </Field>

          <Field data-invalid="true" className="w-72">
            <FieldLabel htmlFor="docs-textarea-notes-error">
              Caregiver notes
            </FieldLabel>
            <Textarea id="docs-textarea-notes-error" aria-invalid />
            <FieldError>Notes cannot be empty.</FieldError>
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">
          Tokens Textarea consumes
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
              "<Field>",
              '  <FieldLabel htmlFor="caregiver-notes">',
              "    Caregiver notes",
              "  </FieldLabel>",
              '  <Textarea id="caregiver-notes" placeholder="Add any observations..." />',
              "  <FieldDescription>",
              "    Visible to other caregivers on this device.",
              "  </FieldDescription>",
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
              "// ✗ Do not re-invent Input's bespoke inline error-slot pattern",
              "// for Textarea — Field/FieldError is the canonical wrapper.",
              "function CaregiverNotesField({ hasError }) {",
              "  return (",
              '    <div className="flex flex-col gap-1">',
              '      <Textarea placeholder="Add any observations..." />',
              "      {hasError && (",
              '        <p className="text-caption text-critical-dark">',
              "          Notes cannot be empty.",
              "        </p>",
              "      )}",
              "    </div>",
              "  );",
              "}",
            ]}
          />
        </div>

        <p className="max-w-2xl text-body text-text-secondary">
          <code className="text-caption">field-sizing-content</code> lets the
          textarea grow with its content up from{" "}
          <code className="text-caption">min-h-16</code> rather than staying
          fixed-height with an internal scrollbar.
        </p>
      </section>
    </div>
  );
}
