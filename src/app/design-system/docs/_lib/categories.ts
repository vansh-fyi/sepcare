/**
 * Shared category list for the design-system docs sidebar (`docs/layout.tsx`)
 * and the docs landing page (`docs/page.tsx`) — a single source so the two
 * never drift out of sync (06-11 Task 1/3).
 *
 * Declared as a literal array, never derived from a filesystem `readdir`,
 * since directory-listing order is not guaranteed stable across operating
 * systems — this is the DSYS-03 ordering resolution for the sidebar's
 * category list (06-UI-SPEC.md "Docs Site Interaction Contract").
 */
export const DOCS_COMPONENT_CATEGORIES = [
  "Actions",
  "Forms",
  "Cards",
  "Navigation",
  "Feedback/Status",
  "Data Viz",
] as const;

export type DocsComponentCategory = (typeof DOCS_COMPONENT_CATEGORIES)[number];

/** Top-level links outside the six component-doc categories. */
export const DOCS_TOP_LINKS = [
  { href: "/design-system/docs", label: "Overview" },
  { href: "/design-system/docs/colors", label: "Colors" },
  { href: "/design-system/docs/typography", label: "Typography" },
] as const;
