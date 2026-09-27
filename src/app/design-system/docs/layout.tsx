"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DOCS_COMPONENT_CATEGORIES, DOCS_TOP_LINKS } from "./_lib/categories";

/**
 * Persistent sidebar shell for every `/design-system/docs/*` route (06-11
 * Task 1) — replaces the rejected single-scroll `docs/page.tsx` ("a single
 * page bunch of crap", D-13) with a real navigation shell + content pane.
 *
 * The six component-doc categories come from `_lib/categories.ts`'s literal
 * array constant — never a filesystem `readdir` — so the sidebar's category
 * order stays stable across operating systems (DSYS-03 ordering resolution).
 * Each category's own `links` array is populated by the Wave 5 plan
 * (06-16/06-17/06-18) that builds its routes; a category with no links yet
 * renders a "Coming soon" placeholder instead of a dangling link.
 *
 * Active-link state signals via color only (`text-brand` vs `text-text-
 * muted`), never a font-weight change (emil-ui-polish principle 2). No
 * entrance animation plays on this shell's own load (emil-animations
 * principle 8) — only the hover/press color transition below is
 * intentional, and it only ever transitions `color`, never `transition-all`.
 */
function SidebarLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "block rounded-card-sm px-3 py-2 text-label transition-colors duration-[var(--duration-fast)] ease-out",
        isActive ? "text-brand" : "text-text-muted hover:text-text",
      )}
    >
      {label}
    </Link>
  );
}

export default function DesignSystemDocsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-6 py-12 sm:px-8">
      <aside className="sticky top-12 hidden h-fit w-56 shrink-0 flex-col gap-6 md:flex">
        <nav aria-label="Docs" className="flex flex-col gap-1">
          {DOCS_TOP_LINKS.map((link) => (
            <SidebarLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>

        <nav
          aria-label="Components"
          className="flex flex-col gap-5 border-t border-border-subtle pt-5"
        >
          {DOCS_COMPONENT_CATEGORIES.map((category) => (
            <div key={category.name} className="flex flex-col gap-1">
              <h3 className="px-3 text-caption font-semibold tracking-wide text-text-subtle uppercase">
                {category.name}
              </h3>
              {category.links.length > 0 ? (
                category.links.map((link) => (
                  <SidebarLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                  />
                ))
              ) : (
                <p className="px-3 text-caption text-text-muted">
                  Coming soon
                </p>
              )}
            </div>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
