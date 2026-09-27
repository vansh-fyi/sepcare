/**
 * Shared category list for the design-system docs sidebar (`docs/layout.tsx`)
 * and the docs landing page (`docs/page.tsx`) — a single source so the two
 * never drift out of sync (06-11 Task 1/3).
 *
 * Declared as a literal array, never derived from a filesystem `readdir`,
 * since directory-listing order is not guaranteed stable across operating
 * systems — this is the DSYS-03 ordering resolution for the sidebar's
 * category list (06-UI-SPEC.md "Docs Site Interaction Contract").
 *
 * Each category carries its own `links` array of real per-component doc
 * routes. 06-11 shipped every category with an empty `links` array (a
 * "Coming soon" placeholder) with the explicit intent that each Wave 5 plan
 * (06-16/06-17/06-18) populate its own category's `links` when that
 * category's routes land — 06-17 populates Cards/Navigation here.
 */
export interface DocsCategoryLink {
  href: string;
  label: string;
}

export interface DocsComponentCategory {
  name: string;
  links: readonly DocsCategoryLink[];
}

export const DOCS_COMPONENT_CATEGORIES: readonly DocsComponentCategory[] = [
  { name: "Actions", links: [] },
  { name: "Forms", links: [] },
  {
    name: "Cards",
    links: [
      { href: "/design-system/docs/card", label: "Card" },
      { href: "/design-system/docs/item", label: "Item" },
    ],
  },
  { name: "Navigation", links: [] },
  { name: "Feedback/Status", links: [] },
  { name: "Data Viz", links: [] },
] as const;

/** Top-level links outside the six component-doc categories. */
export const DOCS_TOP_LINKS = [
  { href: "/design-system/docs", label: "Overview" },
  { href: "/design-system/docs/colors", label: "Colors" },
  { href: "/design-system/docs/typography", label: "Typography" },
] as const;
