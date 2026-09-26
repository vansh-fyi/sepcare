import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Phase 6 design-system reference page — user-requested additive scope
 * beyond DSYS-01/02/03 (not a locked roadmap requirement). Presents the
 * artifacts Plans 06-01 through 06-04 already produced: the live compiled
 * @theme token set (color/typography), parsed straight from globals.css at
 * request time, plus the locked Spacing Scale, all four component
 * DESIGN.md docs (read verbatim, never re-authored), and links to the
 * three existing sample pages — so the team can see the whole design
 * system's current state on one page without opening five separate files
 * by hand.
 */

const GLOBALS_CSS_PATH = join(process.cwd(), "src/app/globals.css");

interface ThemeToken {
  name: string;
  value: string;
}

/** Reads globals.css and returns only the text inside the single @theme { ... } block. */
function readThemeBlock(): string {
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
function parseThemeTokens(themeBlock: string, prefix: string): ThemeToken[] {
  const tokens: ThemeToken[] = [];
  for (const line of themeBlock.split("\n")) {
    const match = line.match(/^\s*(--[\w-]+):\s*(.+?);\s*$/);
    if (match && match[1].startsWith(prefix)) {
      tokens.push({ name: match[1], value: match[2] });
    }
  }
  return tokens;
}

interface ColorTokenGroup {
  title: string;
  tokens: ThemeToken[];
}

/**
 * Groups the live-parsed --color-* tokens by role prefix (surface/border,
 * text, brand, safe, caution, critical) — the same grouping 06-UI-SPEC.md's
 * Color section uses, but built from what globals.css actually contains,
 * never retyped from the spec by hand.
 */
function groupColorTokens(themeBlock: string): ColorTokenGroup[] {
  const colorTokens = parseThemeTokens(themeBlock, "--color-");
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

interface TypographyRole {
  role: string;
  size: string;
  lineHeight: string;
  weight: string;
}

const TYPOGRAPHY_ROLES = ["heading", "body", "label", "caption"] as const;

// Font-weight is not a --theme custom property in this system — there are
// only two fixed weights (600 semibold, 400 regular) per 06-UI-SPEC.md's
// Typography contract, and no --text-*--font-weight token exists to parse.
// This lookup is legitimately hand-authored, not live-parsed.
const TYPOGRAPHY_WEIGHT_BY_ROLE: Record<
  (typeof TYPOGRAPHY_ROLES)[number],
  string
> = {
  heading: "600 (semibold)",
  body: "400 (regular)",
  label: "600 (semibold)",
  caption: "400 (regular)",
};

/** Pairs each --text-{role} size token with its --text-{role}--line-height sibling. */
function parseTypographyRoles(themeBlock: string): TypographyRole[] {
  const textTokens = parseThemeTokens(themeBlock, "--text-");
  return TYPOGRAPHY_ROLES.map((role) => {
    const sizeToken = textTokens.find((t) => t.name === `--text-${role}`);
    const lineHeightToken = textTokens.find(
      (t) => t.name === `--text-${role}--line-height`,
    );
    return {
      role,
      size: sizeToken?.value ?? "—",
      lineHeight: lineHeightToken?.value ?? "—",
      weight: TYPOGRAPHY_WEIGHT_BY_ROLE[role],
    };
  });
}

// Locked transcription from 06-UI-SPEC.md's Spacing Scale — there is no
// live token source for these values, since Tailwind v4's stock --spacing
// primitive is intentionally left undeclared in @theme (D-01/UI-SPEC). This
// is the one table on the page allowed to be a direct transcription rather
// than a live parse.
const SPACING_SCALE: { token: string; value: string; usage: string }[] = [
  { token: "xs", value: "4px", usage: "Icon-to-label gap, badge inner padding" },
  {
    token: "sm",
    value: "8px",
    usage: "Compact element spacing, list row spacing",
  },
  {
    token: "— (exception)",
    value: "12px",
    usage: "Input vertical padding, compact card-row separation",
  },
  {
    token: "md",
    value: "16px",
    usage: "Default element spacing, button padding, card element gap",
  },
  {
    token: "lg",
    value: "24px",
    usage: "Default Card internal padding, section margin",
  },
  { token: "xl", value: "32px", usage: "Section-to-section spacing" },
  {
    token: "2xl",
    value: "48px",
    usage: "Major viewport section divisions",
  },
  { token: "3xl", value: "64px", usage: "Page-level top/bottom padding" },
  {
    token: "— (exception)",
    value: "44×44px minimum",
    usage: "Icon-only Button touch target (size-11)",
  },
];

// The four component DESIGN.md files this page renders verbatim — read live
// from src/components/ui/*.DESIGN.md, never re-authored or paraphrased into
// a second location. Each readFileSync call below uses a fully static,
// literal path (not built via string interpolation or dynamic property
// lookup) so Next.js's build-time file tracer can scope each read to its
// single target file rather than tracing the whole project into the
// deployment output — relevant on this project's Vercel free-tier hosting.
interface ComponentDoc {
  name: "button" | "card" | "badge" | "input";
  content: string;
}

function readComponentDocs(): ComponentDoc[] {
  return [
    {
      name: "button",
      content: readFileSync(
        join(process.cwd(), "src/components/ui/button.DESIGN.md"),
        "utf-8",
      ),
    },
    {
      name: "card",
      content: readFileSync(
        join(process.cwd(), "src/components/ui/card.DESIGN.md"),
        "utf-8",
      ),
    },
    {
      name: "badge",
      content: readFileSync(
        join(process.cwd(), "src/components/ui/badge.DESIGN.md"),
        "utf-8",
      ),
    },
    {
      name: "input",
      content: readFileSync(
        join(process.cwd(), "src/components/ui/input.DESIGN.md"),
        "utf-8",
      ),
    },
  ];
}

// Outbound-only links to the existing D-10 sample pages (Plan 06-04) —
// read-only references, no changes to any of these routes.
const SAMPLE_PAGES: { href: string; label: string }[] = [
  { href: "/design-system/states", label: "States (Safe/Caution/Critical)" },
  { href: "/design-system/empty-loading", label: "Empty + Loading" },
  { href: "/design-system/nested", label: "Nested composition" },
];

export default function DesignSystemDocsPage() {
  const themeBlock = readThemeBlock();
  const colorGroups = groupColorTokens(themeBlock);
  const typographyRoles = parseTypographyRoles(themeBlock);
  const componentDocs = readComponentDocs();

  return (
    <div className="flex flex-col gap-8 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading font-semibold text-text">
          SepCare Design System Reference
        </h1>
        <p className="text-body text-text-secondary">
          Live token summary plus full component usage docs — Phase 6,
          user-requested additive scope beyond DSYS-01/02/03.
        </p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-heading font-semibold text-text">
            Color Tokens
          </h2>
        </CardHeader>
        <CardContent>
          {colorGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <h3 className="text-label font-semibold text-text">
                {group.title}
              </h3>
              <table className="w-full text-body text-text-secondary">
                <thead>
                  <tr className="text-left text-label font-semibold text-text">
                    <th>Token</th>
                    <th>Compiled Value</th>
                  </tr>
                </thead>
                <tbody>
                  {group.tokens.map((token) => (
                    <tr key={token.name}>
                      <td>{token.name}</td>
                      <td>{token.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-heading font-semibold text-text">
            Typography Scale
          </h2>
        </CardHeader>
        <CardContent>
          <table className="w-full text-body text-text-secondary">
            <thead>
              <tr className="text-left text-label font-semibold text-text">
                <th>Role</th>
                <th>Size</th>
                <th>Weight</th>
                <th>Line Height</th>
              </tr>
            </thead>
            <tbody>
              {typographyRoles.map((role) => (
                <tr key={role.role}>
                  <td className="capitalize">{role.role}</td>
                  <td>{role.size}</td>
                  <td>{role.weight}</td>
                  <td>{role.lineHeight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-heading font-semibold text-text">
            Spacing Scale
          </h2>
        </CardHeader>
        <CardContent>
          <table className="w-full text-body text-text-secondary">
            <thead>
              <tr className="text-left text-label font-semibold text-text">
                <th>Token</th>
                <th>Value</th>
                <th>Usage</th>
              </tr>
            </thead>
            <tbody>
              {SPACING_SCALE.map((row) => (
                <tr key={`${row.token}-${row.value}`}>
                  <td>{row.token}</td>
                  <td>{row.value}</td>
                  <td>{row.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-semibold text-text">
          Component Reference
        </h2>
        {componentDocs.map((doc) => (
          <Card key={doc.name}>
            <CardHeader>
              <h3 className="text-label font-semibold text-text capitalize">
                {doc.name}
              </h3>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap break-words text-body text-text">
                {doc.content}
              </pre>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <h2 className="text-heading font-semibold text-text">
            Sample Pages
          </h2>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {SAMPLE_PAGES.map((page) => (
              <li key={page.href}>
                <a
                  href={page.href}
                  className="text-body text-brand underline-offset-2 hover:underline"
                >
                  {page.label}
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
