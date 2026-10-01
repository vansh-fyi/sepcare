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
 * category's routes land — 06-17 populated Cards/Navigation; 06-16 (this
 * plan) populates Actions/Forms.
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
  {
    name: "Actions",
    links: [{ href: "/design-system/docs/button", label: "Button" }],
  },
  {
    name: "Forms",
    links: [
      { href: "/design-system/docs/input", label: "Input" },
      { href: "/design-system/docs/label", label: "Label" },
      { href: "/design-system/docs/field", label: "Field" },
      { href: "/design-system/docs/select", label: "Select" },
      { href: "/design-system/docs/textarea", label: "Textarea" },
      { href: "/design-system/docs/checkbox", label: "Checkbox" },
      { href: "/design-system/docs/radio-group", label: "Radio group" },
      { href: "/design-system/docs/switch", label: "Switch" },
    ],
  },
  {
    name: "Cards",
    links: [
      { href: "/design-system/docs/card", label: "Card" },
      { href: "/design-system/docs/status-summary", label: "Infant status" },
      { href: "/design-system/docs/item", label: "Item" },
    ],
  },
  {
    name: "Navigation",
    links: [{ href: "/design-system/docs/nav", label: "Nav" }],
  },
  {
    name: "Feedback",
    links: [
      { href: "/design-system/docs/connection-status", label: "Connection status" },
      { href: "/design-system/docs/badge", label: "Badge" },
      { href: "/design-system/docs/progress", label: "Progress" },
      { href: "/design-system/docs/toggle-group", label: "Toggle group" },
    ],
  },
  {
    name: "Data visualization",
    links: [
      { href: "/design-system/docs/chart", label: "Chart" },
      { href: "/design-system/docs/sparkline", label: "Sparkline" },
    ],
  },
  {
    name: "Motion and animation",
    links: [{ href: "/design-system/docs/motion", label: "Pulse wave" }],
  },
  {
    name: "Examples",
    links: [
      {
        href: "/design-system/docs/examples/clinical-dashboard",
        label: "Clinical dashboard",
      },
      { href: "/design-system/docs/examples/forms", label: "Forms" },
      {
        href: "/design-system/docs/examples/sensor-states",
        label: "Sensor states",
      },
      {
        href: "/design-system/docs/examples/empty-loading",
        label: "Empty and loading",
      },
    ],
  },
] as const;

/** Top-level links outside the six component-doc categories. */
export const DOCS_TOP_LINKS = [
  { href: "/design-system/docs", label: "Introduction" },
  { href: "/design-system/docs/colors", label: "Colors" },
  { href: "/design-system/docs/typography", label: "Typography" },
] as const;
