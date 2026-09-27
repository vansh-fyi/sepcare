import { readThemeBlock, getExactToken } from "../_lib/tokens";
import { TokenSwatchGrid } from "../_lib/token-swatch";
import { CodeBlock } from "../_lib/code-block";
import { InputPlayground } from "./input-playground";

/**
 * Live Input docs route (06-16 Task 1). Input has no variant axis — only
 * its state (empty, focus, error, disabled) changes its treatment. Token
 * values below are live-parsed from globals.css, never hardcoded copies.
 */
const INPUT_TOKENS = [
  "--radius-input",
  "--color-border",
  "--color-border-focus",
  "--shadow-focus",
  "--color-critical",
  "--color-critical-dark",
];

export default function DesignSystemDocsInputPage() {
  const themeBlock = readThemeBlock();
  const tokens = INPUT_TOKENS.map((name) => ({
    name,
    value: getExactToken(themeBlock, name),
  }));

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          Input
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          The project&rsquo;s single text-entry primitive. No dedicated Figma
          frame was found for Input as of 06-09 — its treatment is kept
          consistent with the extracted values already used by
          Button/Card (<code className="text-caption">rounded-input</code>,{" "}
          <code className="text-caption">border</code>,{" "}
          <code className="text-caption">focus:border-border-focus</code>).
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-semibold text-text">Live preview</h2>
        <p className="max-w-2xl text-body text-text-secondary">
          Toggle the error state — the border turns critical-colored and the
          built-in inline error message renders below the field.
        </p>
        <InputPlayground />
      </section>

      <section className="flex flex-col gap-4 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">
          Tokens Input consumes
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
              '<Input placeholder="Device ID" />',
              '<Input placeholder="Device ID" disabled />',
              '<Input placeholder="Device ID" error />',
              '<Input',
              '  placeholder="Device ID"',
              "  error",
              '  errorMessage="Device ID is required."',
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
              "// ✗ Do not hand-roll a separate error-text element next to Input —",
              "// the error slot is built in and already wired to the locked",
              "// copy/color; a hand-rolled one will drift from the contract.",
              '<Input placeholder="Device ID" aria-invalid />',
              '<p className="text-red-500 text-xs">Something went wrong</p>',
            ]}
          />
        </div>

        <p className="max-w-2xl text-body text-text-secondary">
          <code className="text-caption">error</code> defaults the inline
          message to the locked copy &ldquo;Couldn&rsquo;t load this. Check
          your connection and try again.&rdquo; Pass{" "}
          <code className="text-caption">errorMessage</code> to override with
          field-specific copy. Every field type added after Input composes
          inside{" "}
          <a
            href="/design-system/docs/field"
            className="underline underline-offset-4 hover:text-brand"
          >
            Field
          </a>{" "}
          instead — Input&rsquo;s inline error slot is a grandfathered
          exception, not a pattern to copy.
        </p>
      </section>
    </div>
  );
}
