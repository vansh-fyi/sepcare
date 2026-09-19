# frontend-design — Agent Instructions

This directory holds the static HTML/CSS/JS design prototype for SepCare, built ahead of the eventual Next.js port on `main`.

## Structure conventions

- **One HTML file per page/screen.** Each screen of the app (dashboard, details, settings, etc.) gets its own standalone `.html` file at the top level of this directory (e.g. `index.html`, `details.html`). Do not combine multiple screens into one file behind JS-driven view switching.
- **Reusable components live in shared files, not copy-pasted markup.** Shared UI pieces (header, status bar, cards, nav) should be factored so their styling and behavior are defined once and referenced from every page that uses them, not duplicated inline per page.
- **CSS is centralized.** All component and page styles go in `components.css` (or additional dedicated stylesheets if the file grows too large to navigate) — never inline `<style>` blocks in a page.
- **JavaScript is centralized and external, not inline.** Do not add `<script>...</script>` blocks with logic directly inside HTML files. Behavior (clock updates, interactions, state) belongs in separate `.js` file(s), linked via `<script src="...">`. Existing inline scripts in `index.html` and `details.html` are legacy and should be migrated out into shared JS files as pages are touched.

## Adding a new page

1. Create a new `.html` file for the page.
2. Reuse existing component markup/classes from `components.css` — don't reinvent styling for things that already exist (header, cards, etc.).
3. Link `components.css` and the shared JS file(s) rather than writing new inline styles/scripts.
4. Keep page-specific JS in its own small module file if it doesn't belong in the shared script.
