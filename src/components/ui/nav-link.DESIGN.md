# NavLink

NavLink renders a destination in the clinical bottom navigation. The active destination has an icon, a label, a solid dark neutral pill, and a matching indicator. Inactive destinations show the same icon and label arrangement on a surface defined by the shared control shadow.

The link always has an accessible name through `aria-label`. The active link also has `aria-current="page"`. Every destination has equal width and a 56px button height, with its icon above a persistent label. An 8px gap separates destinations. The indicator follows the full width of its own button.

Use `icon`, `label`, `href`, and `state`. NavBar supplies these for a complete navigation row. NavLink owns its padding and focus appearance.

The selected surface uses `--color-nav-active`; its indicator uses `--color-nav-indicator`. Both alias neutral-800. The selected button is shadowless; inactive items retain the shared control shadow. Keep the full-width indicator below the active tab.

Live examples are at `/design-system/docs/nav`.

## Figma provenance

Verified against Figma node `279-220`.
