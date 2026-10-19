# NavBar

NavBar lays out the clinical navigation destinations and applies the white surface, top corners, 1px neutral-200 top stroke, crisp upward shadow, and safe-area padding. It composes NavLink. All destinations share equal width and a 56px button height. Icons sit above persistent labels, so selection does not change the layout. A fixed 8px gap separates destinations.

`currentRoute` selects a destination. `tabs` supplies `{ href, label, icon }` values; the defaults are Home, Vitals, Stats, and Settings. Supply real destinations when integrating the component into an app.

Use `position="fixed"` for a bar at the viewport bottom. Use `position="static"` inside a phone preview or a parent that already controls positioning. Documentation must not mount a viewport-wide fixed bar inside a contained preview.

`onTabChange` supports controlled examples. When supplied, a click updates the selected view instead of navigating. The home example uses it to show Home, Vitals, Stats, and Settings within the phone.

The bar uses `--radius-nav-bar`, `--shadow-nav-bar`, `--color-card-border`, and `--color-surface`. Current shared implementation and user decisions define the treatment.

## Figma provenance

Verified against Figma node `279-320` (and its Home-screen instance `279-758`).


## Shared surface depth

The bar uses --gradient-surface on its white base, preserving the top stroke and upward shadow.
