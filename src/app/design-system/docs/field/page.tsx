import { readThemeBlock, getExactToken } from "../_lib/tokens";
import { TokenSwatchGrid } from "../_lib/token-swatch";
import { CodeBlock } from "../_lib/code-block";
import { FieldPlayground } from "./field-playground";

/**
 * Live Field docs route (06-16 Task 2) — Field/FieldLabel/FieldDescription/
 * FieldError is THE canonical label+control+help+error wrapper for every
 * new form field added from Wave 3 onward. This page is what
 * Select/Textarea/Checkbox/RadioGroup/Switch's docs pages link to rather
 * than re-explaining the composition themselves.
 */
const FIELD_TOKENS = [
  "--color-critical-dark",
  "--color-border-focus",
  "--color-brand-soft",
  "--color-border",
];

export default function DesignSystemDocsFieldPage() {
  const themeBlock = readThemeBlock();
  const tokens = FIELD_TOKENS.map((name) => ({
    name,
    value: getExactToken(themeBlock, name),
  }));

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          Field
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          <code className="text-caption">Field</code>,{" "}
          <code className="text-caption">FieldLabel</code>,{" "}
          <code className="text-caption">FieldDescription</code>, and{" "}
          <code className="text-caption">FieldError</code> are the canonical
          composition every new form field wraps its control in — never a
          hand-rolled error slot. (
          <code className="text-caption">Input</code>&rsquo;s own inline
          error slot is a grandfathered exception that predates Field, not a
          pattern to copy.)
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-semibold text-text">Live preview</h2>
        <p className="max-w-2xl text-body text-text-secondary">
          Toggle the error state — the same{" "}
          <code className="text-caption">Field</code> composition swaps its{" "}
          <code className="text-caption">FieldDescription</code> for a{" "}
          <code className="text-caption">FieldError</code>, live.
        </p>
        <FieldPlayground />
      </section>

      <section className="flex flex-col gap-4 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">
          Tokens Field consumes
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
              '  <FieldLabel htmlFor="device-id">Device ID</FieldLabel>',
              '  <Input id="device-id" placeholder="e.g. nb-001" />',
              "  <FieldDescription>",
              "    The armband's paired device identifier.",
              "  </FieldDescription>",
              "</Field>",
              "",
              '<Field data-invalid="true">',
              '  <FieldLabel htmlFor="caregiver-phone">',
              "    Caregiver phone",
              "  </FieldLabel>",
              '  <Input id="caregiver-phone" aria-invalid />',
              "  <FieldError>Enter a valid phone number.</FieldError>",
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
              "// ✗ Do not re-implement a bespoke inline error slot for a NEW",
              "// field type — this is exactly the pattern Field/FieldError",
              "// exists to replace.",
              "function NewSelectField() {",
              "  return (",
              '    <div className="flex flex-col gap-1">',
              "      <select />",
              "      {hasError && (",
              '        <p className="text-caption text-critical-dark">',
              "          Something went wrong",
              "        </p>",
              "      )}",
              "    </div>",
              "  );",
              "}",
            ]}
          />
        </div>

        <p className="max-w-2xl text-body text-text-secondary">
          Every stock shadcn semantic class absent from{" "}
          <code className="text-caption">globals.css</code> (
          <code className="text-caption">text-destructive</code>,{" "}
          <code className="text-caption">bg-primary</code>,{" "}
          <code className="text-caption">bg-background</code>,{" "}
          <code className="text-caption">text-muted-foreground</code>) was
          remapped onto this project&rsquo;s real tokens, and every{" "}
          <code className="text-caption">dark:</code> variant was dropped —
          no dark theme exists in this project.
        </p>
      </section>
    </div>
  );
}
