import Link from "next/link";
import { DOCS_COMPONENT_CATEGORIES, DOCS_TOP_LINKS } from "./_lib/categories";

/**
 * Docs landing/overview (06-11 Task 3) — replaces the old 537-line
 * single-scroll page that dumped raw `.DESIGN.md` markdown into a `<pre>`
 * tag (D-13's rejected "single page bunch of crap"). This page now does no
 * file reads of its own — it is pure navigation into the sidebar shell's
 * categories, reusing the exact same `_lib/categories.ts` array `layout.tsx`
 * renders, so the two can never drift out of sync.
 *
 * Per-component content pages (live previews + DESIGN.md usage notes) land
 * in Wave 5 (06-16/06-17/06-18) — this page only links out to where those
 * will live once built.
 */
const REFERENCE_LINKS = DOCS_TOP_LINKS.filter((link) => link.href !== "/design-system/docs");

export default function DesignSystemDocsLandingPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          SepCare Design System
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          A live, token-driven reference for every component, color, and
          type role this project ships — grouped by category in the sidebar,
          never a single scrolling page.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-semibold text-text">Reference</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {REFERENCE_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-card-sm border border-border-subtle p-4 text-body font-semibold text-text transition-colors duration-[var(--duration-fast)] ease-out hover:border-border hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="text-heading font-semibold text-text">Components</h2>
        <p className="max-w-2xl text-body text-text-secondary">
          Per-component live previews and usage notes land category by
          category — categories below are already fixed and stable.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {DOCS_COMPONENT_CATEGORIES.map((category) =>
            category.links.length > 0 ? (
              <div
                key={category.name}
                className="flex flex-col gap-2 rounded-card-sm border border-border-subtle p-4"
              >
                <span className="text-label font-semibold text-text-muted">
                  {category.name}
                </span>
                <div className="flex flex-wrap gap-2">
                  {category.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-cta border border-border-subtle px-2.5 py-1 text-caption font-semibold text-text transition-colors duration-[var(--duration-fast)] ease-out hover:border-border hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div
                key={category.name}
                className="rounded-card-sm border border-dashed border-border-subtle p-4 text-label font-semibold text-text-muted"
              >
                {category.name}
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
