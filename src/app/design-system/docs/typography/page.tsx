import { readThemeBlock, resolveTypographyRoles } from "../_lib/tokens";

/**
 * Live typography reference (06-11 Task 2) — renders all 9 roles from
 * 06-UI-SPEC.md's Typography table as real rendered samples at their actual
 * compiled size/weight/line-height, sourced from `docs/_lib/tokens.ts`'s
 * `resolveTypographyRoles`, not a table of numbers.
 *
 * Each sample's className references the token-generated Tailwind utility
 * (`text-display`, `text-body`, …) directly, so the rendering itself reads
 * the same `--text-*` custom properties the caption row below displays —
 * two views of one source, never a hand-duplicated literal. The two
 * recombination roles ("Heading — card", "Secondary text") use an existing
 * size token with an explicit `leading-[…]` override, per the UI-SPEC's own
 * note that they intentionally get no new token.
 *
 * The Vital-metric sample carries `tabular-nums` (font-variant-numeric)
 * so digits don't jiggle as readings update, and Display/page-title use
 * `text-balance` (text-wrap: balance) for better line breaks — both per
 * emil-ui-polish principle 5.
 */
export default function DesignSystemDocsTypographyPage() {
  const themeBlock = readThemeBlock();
  const roles = resolveTypographyRoles(themeBlock);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          Typography
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          Every role rendered at its real compiled size/weight/line-height —
          9 roles across 3 weights (400 regular, 600 semibold, 700 bold,
          reserved for Display/page-title/Vital-metric only).
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="flex flex-col gap-1 border-b border-border-subtle pb-6 last:border-0 last:pb-0"
          >
            <p className={`${role.className} text-text`}>{role.sample}</p>
            <p className="text-caption text-text-muted">{role.description}</p>
            <p className="text-caption text-text-subtle">
              {role.label} · {role.sizeValue} · {role.weightLabel} ·
              line-height {role.lineHeightValue}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
