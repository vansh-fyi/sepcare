import { readThemeBlock, getExactToken } from "../_lib/tokens";
import { TokenSwatchGrid } from "../_lib/token-swatch";
import { CodeBlock } from "../_lib/code-block";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Live Select docs route (06-16 Task 2). Select is itself a Client Component
 * (radix-ui Select.Root) — both examples below are real, openable dropdowns,
 * no picker wrapper needed to make this page "live." No dedicated Figma
 * frame exists for Select; token-consistent, not node-verified.
 */
const SELECT_TOKENS = [
  "--radius-input",
  "--color-border",
  "--color-border-focus",
  "--shadow-floating",
];

export default function DesignSystemDocsSelectPage() {
  const themeBlock = readThemeBlock();
  const tokens = SELECT_TOKENS.map((name) => ({
    name,
    value: getExactToken(themeBlock, name),
  }));

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          Select
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          The project&rsquo;s dropdown/single-choice field primitive, always
          composed inside{" "}
          <a
            href="/design-system/docs/field"
            className="underline underline-offset-4 hover:text-brand"
          >
            Field
          </a>{" "}
          for label/description/error. No dedicated Figma frame exists for
          Select — its trigger reuses Input&rsquo;s already-extracted
          border/radius/focus-ring treatment rather than a guessed value.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-semibold text-text">Live preview</h2>
        <p className="max-w-2xl text-body text-text-secondary">
          Open either dropdown below — both are real, interactive{" "}
          <code className="text-caption">Select</code> instances.
        </p>
        <div className="flex flex-wrap gap-8 rounded-card-sm border border-border-subtle bg-bg p-8">
          <Field className="w-64">
            <FieldLabel htmlFor="docs-select-region">
              Device region
            </FieldLabel>
            <Select defaultValue="in-south">
              <SelectTrigger id="docs-select-region">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-south">India — South</SelectItem>
                <SelectItem value="in-north">India — North</SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription>
              Used for device-support routing only.
            </FieldDescription>
          </Field>

          <Field data-invalid="true" className="w-64">
            <FieldLabel htmlFor="docs-select-region-error">
              Device region
            </FieldLabel>
            <Select>
              <SelectTrigger id="docs-select-region-error" aria-invalid>
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-south">India — South</SelectItem>
              </SelectContent>
            </Select>
            <FieldError>Please select a region.</FieldError>
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">
          Tokens Select consumes
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
              '  <FieldLabel htmlFor="device-region">Device region</FieldLabel>',
              "  <Select>",
              '    <SelectTrigger id="device-region">',
              '      <SelectValue placeholder="Select a region" />',
              "    </SelectTrigger>",
              "    <SelectContent>",
              '      <SelectItem value="in-south">India — South</SelectItem>',
              "    </SelectContent>",
              "  </Select>",
              "  <FieldDescription>",
              "    Used to route device-support routing only.",
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
              "// for Select — Field/FieldError is the canonical wrapper.",
              "function DeviceRegionField({ hasError }) {",
              "  return (",
              '    <div className="flex flex-col gap-1">',
              "      <Select>...</Select>",
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
          <code className="text-caption">SelectValue</code>&rsquo;s slot
          classes carry <code className="text-caption">line-clamp-1</code> so
          a long selected option label truncates rather than growing the
          trigger&rsquo;s fixed height.
        </p>
      </section>
    </div>
  );
}
