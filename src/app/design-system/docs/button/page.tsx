import { readThemeBlock, getExactToken } from "../_lib/tokens";
import { TokenSwatchGrid } from "../_lib/token-swatch";
import { CodeBlock } from "../_lib/code-block";
import { ButtonPlayground } from "./button-playground";

/**
 * Live Button docs route (06-16 Task 1) — covers all 8 Figma-verified
 * variants (button.tsx, post-06-06), not just the original 4. Token values
 * below are live-parsed from globals.css via `docs/_lib/tokens.ts`'s
 * `getExactToken`, never hardcoded copies.
 */
const BUTTON_TOKENS = [
  "--radius-btn",
  "--color-brand-fill",
  "--radius-cta",
  "--gradient-cta",
  "--gradient-cta-critical",
  "--shadow-cta",
  "--radius-icon-btn",
  "--color-icon-fill-dark",
];

export default function DesignSystemDocsButtonPage() {
  const themeBlock = readThemeBlock();
  const tokens = BUTTON_TOKENS.map((name) => ({
    name,
    value: getExactToken(themeBlock, name),
  }));

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          Button
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          8 variants across 3 archetypes: flat-fill text buttons (
          <code className="text-caption">primary</code>/
          <code className="text-caption">secondary</code>/
          <code className="text-caption">tertiary</code>/
          <code className="text-caption">critical</code>), gradient CTA pills
          (<code className="text-caption">cta</code>/
          <code className="text-caption">cta-critical</code>), and icon-only
          buttons (<code className="text-caption">icon-outline</code>/
          <code className="text-caption">icon-filled</code>). Verified against
          Figma nodes 203-11745, 203-14032, 203-11521, and 266-9285.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-semibold text-text">Live preview</h2>
        <p className="max-w-2xl text-body text-text-secondary">
          Pick a variant and toggle the loading sub-state — the label hides
          (space reserved via opacity, never removed from layout) and a
          spinner overlays without any layout shift.
        </p>
        <ButtonPlayground />
      </section>

      <section className="flex flex-col gap-4 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">
          Tokens Button consumes
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
              '<Button variant="primary">Sync Now</Button>',
              '<Button variant="critical">Call Clinician</Button>',
              '<Button variant="primary" loading>Sync Now</Button>',
              '',
              '<Button variant="cta">',
              '  <Icon name="signal" className="size-5" />',
              "  Connect Device",
              "</Button>",
              '',
              '<Button variant="icon-outline" aria-label="Back">',
              '  <Icon name="back" className="size-6" />',
              "</Button>",
            ]}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-body font-semibold text-text">
            Incorrect usage
          </h3>
          <CodeBlock
            lines={[
              '// ✗ Rejected by TypeScript — "outline" is not a member of the',
              "// locked ButtonVariant union.",
              '<Button variant="outline">Learn More</Button>',
              '',
              "// ✗ icon-outline/icon-filled are icon-only archetypes — do not pass",
              "// a text label as a visible child; use aria-label instead.",
              '<Button variant="icon-filled">Sort</Button>',
            ]}
          />
        </div>

        <p className="max-w-2xl text-body text-text-secondary">
          There is no separate <code className="text-caption">size</code>{" "}
          prop this phase — each variant renders at its own Figma-locked
          dimensions (
          <code className="text-caption">
            px-5 py-3 rounded-btn text-body
          </code>{" "}
          for the flat-fill variants,{" "}
          <code className="text-caption">rounded-cta</code> pills for the CTA
          archetype, fixed square boxes for the icon-only archetypes). Both
          icon-only variants meet or exceed the project&rsquo;s 44&times;44px
          minimum touch target.
        </p>
      </section>
    </div>
  );
}
