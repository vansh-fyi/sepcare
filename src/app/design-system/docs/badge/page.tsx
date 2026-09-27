import { readThemeBlock, getExactToken } from "../_lib/tokens";
import { TokenSwatchGrid } from "../_lib/token-swatch";
import { CodeBlock } from "../_lib/code-block";
import { BadgePlayground } from "./badge-playground";

/**
 * Live Badge docs route (06-18 Task 1). Demonstrates the locked 3-value
 * icon+label+color multi-modal contract (DESIGN-SYSTEM.md §9) live, via a
 * real status picker plus a side-by-side "color alone" forbidden-pattern
 * mock — not merely described in prose. No dedicated Figma frame exists for
 * Badge (badge.DESIGN.md's own honest 06-08 finding); this page states that
 * plainly rather than implying a Figma source.
 */
const BADGE_TOKENS = [
  "--color-safe-soft",
  "--color-safe-dark",
  "--color-caution-soft",
  "--color-caution-dark",
  "--color-critical-soft",
  "--color-critical-dark",
  "--radius-full",
];

export default function DesignSystemDocsBadgePage() {
  const themeBlock = readThemeBlock();
  const tokens = BADGE_TOKENS.map((name) => ({
    name,
    value: getExactToken(themeBlock, name),
  }));

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          Badge
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          The tri-state status pill —{" "}
          <code className="text-caption">safe</code>/
          <code className="text-caption">caution</code>/
          <code className="text-caption">critical</code> — and the
          component-level enforcement of DESIGN-SYSTEM.md &sect;9&rsquo;s
          multi-modal rule: a status is never communicated by color alone.{" "}
          <strong className="font-semibold text-text">
            No dedicated Figma frame exists for Badge
          </strong>{" "}
          — its visual treatment carries forward unchanged, per
          badge.DESIGN.md&rsquo;s own honest 06-08 finding.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-semibold text-text">
          Live preview
        </h2>
        <p className="max-w-2xl text-body text-text-secondary">
          Pick a status below — the real{" "}
          <code className="text-caption">Badge</code> re-renders live. Beside
          it, a &ldquo;color alone&rdquo; mock shows exactly what the rule
          forbids: the same background color with no icon and no text label,
          crossed out to mark it as the forbidden pattern, not a real
          exported component variant.
        </p>
        <BadgePlayground />
      </section>

      <section className="flex flex-col gap-4 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">
          Tokens Badge consumes
        </h2>
        <TokenSwatchGrid tokens={tokens} />
      </section>

      <section className="flex flex-col gap-6 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">
          Usage notes
        </h2>

        <div className="flex flex-col gap-3">
          <h3 className="text-body font-semibold text-text">
            Correct usage
          </h3>
          <CodeBlock
            lines={[
              '<Badge status="safe">Safe</Badge>',
              '<Badge status="caution">Caution</Badge>',
              '<Badge status="critical">Critical</Badge>',
            ]}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-body font-semibold text-text">
            Incorrect usage
          </h3>
          <CodeBlock
            lines={[
              "// Violates the multi-modal rule — a bare colored <span> communicates",
              "// status via color alone, with no icon and no text label a screen",
              "// reader or colorblind user can rely on.",
              '<span className="bg-critical-soft" />',
              "",
              '// Rejected by TypeScript — "danger" is not a member of the locked',
              "// status union.",
              '<Badge status="danger">Danger</Badge>',
            ]}
          />
        </div>

        <p className="max-w-2xl text-body text-text-secondary">
          <code className="text-caption">status</code> only accepts{" "}
          <code className="text-caption">
            &quot;safe&quot; | &quot;caution&quot; | &quot;critical&quot;
          </code>{" "}
          (the <code className="text-caption">BadgeStatus</code> type
          exported from <code className="text-caption">badge.tsx</code>) —
          any other string literal is a compile-time error. Because the
          icon+label+color pairing lives inside the component body, Badge
          intentionally omits composable-slot substitution — a caller
          substituting the rendered element could otherwise bypass the
          pairing.
        </p>
      </section>
    </div>
  );
}
