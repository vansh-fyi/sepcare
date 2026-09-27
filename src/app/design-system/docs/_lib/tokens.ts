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
