import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/page-shell";

/**
 * Phase 6 design-system reference page — user-requested additive scope
 * beyond DSYS-01/02/03 (not a locked roadmap requirement). Presents the
 * artifacts Plans 06-01 through 06-04 already produced: the live compiled
 * @theme token set (primitive ramps, semantic roles, typography), parsed
 * straight from globals.css at request time, live-rendered previews of
 * every component variant, all four component DESIGN.md docs (read
 * verbatim, never re-authored), and links to the three existing sample
 * pages — one page presenting the whole design system's current state,
 * in the spirit of a real component-doc site (e.g. ui.shadcn.com), scoped
 * to what this phase actually ships.
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

const PRIMITIVE_RAMPS = ["pink", "green", "blue", "neutral", "yellow"] as const;
const RAMP_STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

/** Live-parsed primitive ramps (--color-{ramp}-{step}), sourced from Figma Segue 3.0. */
function parsePrimitiveRamps(themeBlock: string) {
  const colorTokens = parseThemeTokens(themeBlock, "--color-");
  return PRIMITIVE_RAMPS.map((ramp) => ({
    ramp,
    steps: RAMP_STEPS.map((step) => {
      const token = colorTokens.find((t) => t.name === `--color-${ramp}-${step}`);
      return { step, value: token?.value ?? "—" };
    }),
  }));
}

interface ColorTokenGroup {
  title: string;
  tokens: ThemeToken[];
}

/**
 * Groups the live-parsed semantic --color-* tokens by role (surface/border,
 * text, brand, safe, caution, critical) — excludes the raw primitive ramps,
 * which get their own swatch section above.
 */
function groupSemanticColorTokens(themeBlock: string): ColorTokenGroup[] {
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

interface TypographyRole {
  role: string;
  size: string;
  lineHeight: string;
  weight: string;
  weightValue: 400 | 600;
}

const TYPOGRAPHY_ROLES = ["heading", "body", "label", "caption"] as const;

// Font-weight is not a --theme custom property in this system — there are
// only two fixed weights (600 semibold, 400 regular) per 06-UI-SPEC.md's
// Typography contract, and no --text-*--font-weight token exists to parse.
// This lookup is legitimately hand-authored, not live-parsed.
const TYPOGRAPHY_WEIGHT_BY_ROLE: Record<
  (typeof TYPOGRAPHY_ROLES)[number],
  { label: string; value: 400 | 600 }
> = {
  heading: { label: "600 (semibold)", value: 600 },
  body: { label: "400 (regular)", value: 400 },
  label: { label: "600 (semibold)", value: 600 },
  caption: { label: "400 (regular)", value: 400 },
};

/** Pairs each --text-{role} size token with its --text-{role}--line-height sibling. */
function parseTypographyRoles(themeBlock: string): TypographyRole[] {
  const textTokens = parseThemeTokens(themeBlock, "--text-");
  return TYPOGRAPHY_ROLES.map((role) => {
    const sizeToken = textTokens.find((t) => t.name === `--text-${role}`);
    const lineHeightToken = textTokens.find(
      (t) => t.name === `--text-${role}--line-height`,
    );
    const weight = TYPOGRAPHY_WEIGHT_BY_ROLE[role];
    return {
      role,
      size: sizeToken?.value ?? "—",
      lineHeight: lineHeightToken?.value ?? "—",
      weight: weight.label,
      weightValue: weight.value,
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

function SectionCard({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <Card>
        <CardHeader>
          <h2 className="text-heading font-semibold text-text">{title}</h2>
          {description ? (
            <p className="text-body text-text-secondary">{description}</p>
          ) : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  );
}

export default function DesignSystemDocsPage() {
  const themeBlock = readThemeBlock();
  const primitiveRamps = parsePrimitiveRamps(themeBlock);
  const semanticGroups = groupSemanticColorTokens(themeBlock);
  const typographyRoles = parseTypographyRoles(themeBlock);
  const componentDocs = readComponentDocs();

  return (
    <PageShell
      title="SepCare Design System"
      description="Live token summary, rendered component previews, and full usage docs — Phase 6, user-requested additive scope beyond DSYS-01/02/03."
    >
      <nav className="mb-10 flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-4 text-label font-semibold text-text-secondary">
        <a href="#colors" className="hover:text-brand hover:underline">
          Colors
        </a>
        <a href="#typography" className="hover:text-brand hover:underline">
          Typography
        </a>
        <a href="#spacing" className="hover:text-brand hover:underline">
          Spacing
        </a>
        <a href="#components" className="hover:text-brand hover:underline">
          Components
        </a>
        <a href="#sample-pages" className="hover:text-brand hover:underline">
          Sample Pages
        </a>
      </nav>

      <div className="flex flex-col gap-8">
        <SectionCard
          id="colors"
          title="Color"
          description="Primitive ramps sourced verbatim from Figma Segue 3.0, live-parsed from globals.css — never retyped by hand. Semantic roles below are the ones components actually consume."
        >
          <div className="flex flex-col gap-8">
            {primitiveRamps.map(({ ramp, steps }) => (
              <div key={ramp} className="flex flex-col gap-2">
                <h3 className="text-label font-semibold text-text capitalize">
                  {ramp}
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-9">
                  {steps.map(({ step, value }) => (
                    <div key={step} className="flex flex-col gap-1">
                      <div
                        className="h-14 w-full rounded-card-sm border border-border-subtle"
                        style={{ backgroundColor: value }}
                        title={value}
                      />
                      <span className="text-caption text-text-muted">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-4 flex flex-col gap-6 border-t border-border pt-6">
              {semanticGroups.map((group) => (
                <div key={group.title} className="flex flex-col gap-2">
                  <h3 className="text-label font-semibold text-text">
                    {group.title}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {group.tokens.map((token) => (
                      <div
                        key={token.name}
                        className="flex items-center gap-2 rounded-card-sm border border-border-subtle p-2"
                      >
                        <div
                          className="h-8 w-8 shrink-0 rounded-full border border-border-subtle"
                          style={{ backgroundColor: token.value }}
                          title={token.value}
                        />
                        <code className="truncate text-caption text-text-secondary">
                          {token.name}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          id="typography"
          title="Typography"
          description="Every role rendered at its real compiled size/weight/line-height, not just described in a table."
        >
          <div className="flex flex-col gap-6">
            {typographyRoles.map((role) => (
              <div
                key={role.role}
                className="flex flex-col gap-1 border-b border-border-subtle pb-4 last:border-0 last:pb-0"
              >
                <p
                  className="text-text"
                  style={{
                    fontSize: role.size,
                    lineHeight: role.lineHeight,
                    fontWeight: role.weightValue,
                  }}
                >
                  The quick brown fox jumps over the lazy dog
                </p>
                <p className="text-caption text-text-muted">
                  {role.role} · {role.size} · {role.weight} · line-height{" "}
                  {role.lineHeight}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          id="spacing"
          title="Spacing"
          description="Tailwind v4's stock spacing primitive covers this scale — no custom --spacing-* token is declared (D-01)."
        >
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
        </SectionCard>

        <div id="components" className="flex flex-col gap-6 scroll-mt-8">
          <h2 className="text-2xl font-semibold text-text">Components</h2>

          <Card>
            <CardHeader>
              <h3 className="text-heading font-semibold text-text">Button</h3>
              <p className="text-body text-text-secondary">
                Exactly four variants — no size axis this phase.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Sync Now</Button>
                <Button variant="secondary">Dismiss</Button>
                <Button variant="tertiary">View Details →</Button>
                <Button variant="critical">Call Clinician</Button>
                <Button variant="primary" loading>
                  Sync Now
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-heading font-semibold text-text">
                Badge (StatusPill)
              </h3>
              <p className="text-body text-text-secondary">
                Always icon + label + color together — never color alone.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Badge status="safe">Stable</Badge>
                <Badge status="caution">Monitor</Badge>
                <Badge status="critical">Critical</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-heading font-semibold text-text">Input</h3>
              <p className="text-body text-text-secondary">
                Default, error, and disabled treatments.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input placeholder="Device ID" />
                <Input placeholder="Device ID" defaultValue="bad-id" error />
                <Input placeholder="Device ID" disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-heading font-semibold text-text">Card</h3>
              <p className="text-body text-text-secondary">
                Structure never changes between content states — see the{" "}
                <a
                  href="/design-system/empty-loading"
                  className="text-brand underline-offset-2 hover:underline"
                >
                  empty/loading sample page
                </a>
                .
              </p>
            </CardHeader>
            <CardContent>
              <Card className="bg-surface-soft-blue shadow-none">
                <CardContent>
                  <p className="text-body text-text-secondary">
                    A Card, nested inside a Card, to show the surface/shadow
                    tokens compose without fighting each other.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {componentDocs.map((doc) => (
            <Card key={doc.name}>
              <CardHeader>
                <h3 className="text-label font-semibold text-text capitalize">
                  {doc.name}.DESIGN.md
                </h3>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap break-words text-caption text-text-secondary">
                  {doc.content}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>

        <SectionCard id="sample-pages" title="Sample Pages">
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
        </SectionCard>
      </div>
    </PageShell>
  );
}
