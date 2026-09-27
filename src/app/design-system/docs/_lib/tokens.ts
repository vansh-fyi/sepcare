import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Shared token-parsing helpers for the design-system docs site.
 *
 * `readThemeBlock`/`parseThemeTokens`/`parsePrimitiveRamps`/
 * `groupSemanticColorTokens` are relocated verbatim from the old
 * single-scroll `docs/page.tsx` (06-11 Task 1), per 06-PATTERNS.md's
 * "legitimately reusable" finding — the parsing logic itself is unchanged,
 * only its location moved so `docs/colors`, `docs/typography`, and any
 * future docs route can import it directly instead of duplicating it or
 * re-reading `globals.css` themselves.
 */

const GLOBALS_CSS_PATH = join(process.cwd(), "src/app/globals.css");

export interface ThemeToken {
  name: string;
  value: string;
}

/** Reads globals.css and returns only the text inside the single @theme { ... } block. */
export function readThemeBlock(): string {
  const css = readFileSync(GLOBALS_CSS_PATH, "utf-8");
  const themeStart = css.indexOf("@theme");
  if (themeStart === -1) {
    throw new Error("No @theme block found in src/app/globals.css");
  }
  const openBrace = css.indexOf("{", themeStart);
  let depth = 0;
  let closeBrace = -1;
  for (let i = openBrace; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) {
        closeBrace = i;
        break;
      }
    }
  }
  if (openBrace === -1 || closeBrace === -1) {
    throw new Error("Unterminated @theme block in src/app/globals.css");
  }
  return css.slice(openBrace + 1, closeBrace);
}

/** Line-based parse of every custom property whose name starts with `prefix` (e.g. "--color-"). */
export function parseThemeTokens(themeBlock: string, prefix: string): ThemeToken[] {
  const tokens: ThemeToken[] = [];
  for (const line of themeBlock.split("\n")) {
    const match = line.match(/^\s*(--[\w-]+):\s*(.+?);\s*$/);
    if (match && match[1].startsWith(prefix)) {
      tokens.push({ name: match[1], value: match[2] });
    }
  }
  return tokens;
}

export const PRIMITIVE_RAMPS = ["pink", "green", "blue", "neutral", "yellow"] as const;
export const RAMP_STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

/** Live-parsed primitive ramps (--color-{ramp}-{step}), sourced from Figma Segue 3.0. */
export function parsePrimitiveRamps(themeBlock: string) {
  const colorTokens = parseThemeTokens(themeBlock, "--color-");
  return PRIMITIVE_RAMPS.map((ramp) => ({
    ramp,
    steps: RAMP_STEPS.map((step) => {
      const token = colorTokens.find((t) => t.name === `--color-${ramp}-${step}`);
      return { step, value: token?.value ?? "—" };
    }),
  }));
}

export interface ColorTokenGroup {
  title: string;
  tokens: ThemeToken[];
}

/**
 * Groups the live-parsed semantic --color-* tokens by role (surface/border,
 * text, brand, safe, caution, critical) — excludes the raw primitive ramps,
 * which get their own swatch section above.
 */
export function groupSemanticColorTokens(themeBlock: string): ColorTokenGroup[] {
  const colorTokens = parseThemeTokens(themeBlock, "--color-").filter(
    (t) => !PRIMITIVE_RAMPS.some((ramp) => t.name.startsWith(`--color-${ramp}-`)),
  );
  const groupDefs: { title: string; test: (name: string) => boolean }[] = [
    {
      title: "Surface / Border",
      test: (n) => /^--color-(bg|surface|border)/.test(n),
    },
    { title: "Text", test: (n) => /^--color-text/.test(n) },
    { title: "Brand", test: (n) => /^--color-brand/.test(n) },
    { title: "Safe", test: (n) => /^--color-safe/.test(n) },
    { title: "Caution", test: (n) => /^--color-caution/.test(n) },
    { title: "Critical", test: (n) => /^--color-critical/.test(n) },
  ];
  return groupDefs
    .map(({ title, test }) => ({
      title,
      tokens: colorTokens.filter((t) => test(t.name)),
    }))
    .filter((group) => group.tokens.length > 0);
}

/**
 * Net-new for 06-11 Task 2 (not one of the four relocated helpers above) —
 * live-parses the full 9-role Typography scale from 06-UI-SPEC.md's table.
 *
 * Two roles ("Heading — card", "Secondary text") are deliberate
 * recombinations per the UI-SPEC: an existing size token at a different
 * weight + line-height, not a new token. Their `lineHeight` is therefore a
 * documented literal, not a parsed value — the same kind of hand-authored
 * exception the old page already used for font-weight (--theme has no
 * --text-*--font-weight namespace).
 */
export interface TypographyRoleSpec {
  id: string;
  label: string;
  description: string;
  sample: string;
  sizeTokenName: string;
  lineHeightTokenName: string | null;
  fallbackLineHeight: string | null;
  weightLabel: string;
  weightValue: 400 | 600 | 700;
  className: string;
}

export const TYPOGRAPHY_ROLE_SPECS: TypographyRoleSpec[] = [
  {
    id: "display",
    label: "Display",
    description: 'Hero headline, e.g. "Baby is Resting Safely."',
    sample: "Baby is Resting Safely.",
    sizeTokenName: "--text-display",
    lineHeightTokenName: "--text-display--line-height",
    fallbackLineHeight: null,
    weightLabel: "700 (bold)",
    weightValue: 700,
    className: "text-display font-bold text-balance",
  },
  {
    id: "heading-page",
    label: "Heading — page title",
    description: "Top-level page title.",
    sample: "Design System",
    sizeTokenName: "--text-heading-page",
    lineHeightTokenName: "--text-heading-page--line-height",
    fallbackLineHeight: null,
    weightLabel: "700 (bold)",
    weightValue: 700,
    className: "text-heading-page font-bold text-balance",
  },
  {
    id: "heading",
    label: "Heading — section",
    description: "Section heading (existing --text-heading token, unchanged).",
    sample: "Section heading",
    sizeTokenName: "--text-heading",
    lineHeightTokenName: "--text-heading--line-height",
    fallbackLineHeight: null,
    weightLabel: "600 (semibold)",
    weightValue: 600,
    className: "text-heading font-semibold",
  },
  {
    id: "heading-card",
    label: "Heading — card",
    description:
      "Vital-card label, e.g. “Pulse” — recombination of Body's size at Heading's weight.",
    sample: "Pulse",
    sizeTokenName: "--text-body",
    lineHeightTokenName: null,
    fallbackLineHeight: "1.40",
    weightLabel: "600 (semibold)",
    weightValue: 600,
    className: "text-body leading-[1.4] font-semibold",
  },
  {
    id: "body",
    label: "Body",
    description: "Default text, Input/Field value.",
    sample: "The quick brown fox jumps over the lazy dog.",
    sizeTokenName: "--text-body",
    lineHeightTokenName: "--text-body--line-height",
    fallbackLineHeight: null,
    weightLabel: "400 (regular)",
    weightValue: 400,
    className: "text-body font-normal",
  },
  {
    id: "label",
    label: "Label",
    description: "Badge/Field label.",
    sample: "STATUS LABEL",
    sizeTokenName: "--text-label",
    lineHeightTokenName: "--text-label--line-height",
    fallbackLineHeight: null,
    weightLabel: "600 (semibold)",
    weightValue: 600,
    className: "text-label font-semibold",
  },
  {
    id: "secondary",
    label: "Secondary text",
    description:
      "Timestamps, telemetry sub-labels — recombination of Label's size at Body's weight.",
    sample: "Synced 2m ago",
    sizeTokenName: "--text-label",
    lineHeightTokenName: null,
    fallbackLineHeight: "1.45",
    weightLabel: "400 (regular)",
    weightValue: 400,
    className: "text-label leading-[1.45] font-normal",
  },
  {
    id: "caption",
    label: "Caption",
    description: "Helper text, error text, units.",
    sample: "Helper text goes here.",
    sizeTokenName: "--text-caption",
    lineHeightTokenName: "--text-caption--line-height",
    fallbackLineHeight: null,
    weightLabel: "400 (regular)",
    weightValue: 400,
    className: "text-caption font-normal",
  },
  {
    id: "vital-metric",
    label: "Vital metric",
    description:
      "Large Pulse/Temp/Activity readings — tabular-nums so digits don't jiggle as readings update.",
    sample: "128 bpm",
    sizeTokenName: "--text-vital-metric",
    lineHeightTokenName: "--text-vital-metric--line-height",
    fallbackLineHeight: null,
    weightLabel: "700 (bold)",
    weightValue: 700,
    className: "text-vital-metric font-bold tabular-nums",
  },
];

export interface ResolvedTypographyRole extends TypographyRoleSpec {
  sizeValue: string;
  lineHeightValue: string;
}

/** Resolves each TYPOGRAPHY_ROLE_SPECS entry's live size (and line-height, where a token exists). */
export function resolveTypographyRoles(themeBlock: string): ResolvedTypographyRole[] {
  const textTokens = parseThemeTokens(themeBlock, "--text-");
  return TYPOGRAPHY_ROLE_SPECS.map((spec) => {
    const sizeToken = textTokens.find((t) => t.name === spec.sizeTokenName);
    const lineHeightToken = spec.lineHeightTokenName
      ? textTokens.find((t) => t.name === spec.lineHeightTokenName)
      : undefined;
    return {
      ...spec,
      sizeValue: sizeToken?.value ?? "—",
      lineHeightValue: lineHeightToken?.value ?? spec.fallbackLineHeight ?? "—",
    };
  });
}
