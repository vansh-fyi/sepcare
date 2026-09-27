"use client";

import { useState } from "react";
import { NavLink } from "@/components/ui/nav-link";
import { NavBar, NAV_TABS } from "@/components/ui/nav-bar";

/**
 * Live Navigation docs route (06-17 Task 2) — NavLink and NavBar are
 * hand-authored (no shadcn equivalent), Figma-verified against nodes
 * 279-220/279-320. Both previews below intercept clicks (`preventDefault` +
 * local state) so this page can render live, clickable instances of
 * components whose real `href`s point at actual app routes, without ever
 * navigating away from the docs site.
 */
export default function DesignSystemDocsNavPage() {
  const [linkActive, setLinkActive] = useState(true);
  const [currentRoute, setCurrentRoute] = useState<string>(NAV_TABS[0].href);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          Navigation
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          <code className="text-caption">NavLink</code> and{" "}
          <code className="text-caption">NavBar</code> are hand-authored (no
          shadcn equivalent exists for this archetype) and Figma-verified
          against nodes 279-220 (link) and 279-320/279-758 (bar).
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-semibold text-text">NavLink</h2>
        <p className="max-w-2xl text-body text-text-secondary">
          Click the pill to toggle its{" "}
          <code className="text-caption">active</code> /{" "}
          <code className="text-caption">inactive</code> state.
        </p>
        <div className="flex w-fit justify-center rounded-card-sm border border-border-subtle bg-bg p-8">
          <NavLink
            href="#"
            icon="home"
            label="Home"
            state={linkActive ? "active" : "inactive"}
            onClick={(event) => {
              event.preventDefault();
              setLinkActive((value) => !value);
            }}
          />
        </div>
        <p className="text-caption text-text-muted">
          Active vs. inactive never differs by color alone &mdash;
          background fill, border, icon color, label presence (label only
          renders when active), and the indicator bar below the pill all
          change together (Badge&rsquo;s multi-modal rule).
        </p>
      </section>

      <section className="flex flex-col gap-4 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">NavBar</h2>
        <p className="max-w-2xl text-body text-text-secondary">
          Click any tab to change which one is active. The preview intercepts
          the click, so this demo never actually leaves the docs page.
        </p>
        <div className="relative h-36 rounded-card bg-bg">
          <NavBar
            currentRoute={currentRoute}
            className="!absolute"
            onClick={(event) => {
              const anchor = (event.target as HTMLElement).closest("a");
              if (!anchor) return;
              event.preventDefault();
              const href = anchor.getAttribute("href");
              if (href) setCurrentRoute(href);
            }}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-card-sm border border-border bg-surface p-6">
        <h2 className="text-heading font-semibold text-text">
          Why does the active tab look like a health alert?
        </h2>
        <p className="max-w-2xl text-body text-text-secondary">
          This is intentional &mdash; not a bug to &ldquo;fix&rdquo; to blue.
          <strong className="font-bold text-text"> D-17</strong> (locked,
          06-CONTEXT.md) resolved a tension the original research flagged:
          the Home-screen design shows the bottom nav&rsquo;s active tab in
          the same pink/red hue that D-04 otherwise reserves exclusively for
          Critical health status. The user&rsquo;s explicit call was to match
          the screenshot and Figma nav bar node (279-320) exactly.{" "}
          <em>Navigation-selected-state</em> and{" "}
          <em>critical-health-status</em> are treated as two different
          semantic dimensions &mdash; location vs. health &mdash; and both
          are explicitly permitted to use the same hue. Do not recolor this
          to blue in a future pass; it is a deliberate choice, not an
          oversight.
        </p>
      </section>

      <section className="flex flex-col gap-2 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">Usage notes</h2>
        <ul className="flex flex-col gap-2 text-body text-text-secondary">
          <li>
            Every <code className="text-caption">NavLink</code> enforces a{" "}
            <code className="text-caption">min-h-11 min-w-11</code> (44&times;
            44px) touch target &mdash; the pill itself is 44px tall by shape,
            and <code className="text-caption">min-w-11</code> guards the
            width floor too (in practice <code className="text-caption">
              flex-1
            </code>{" "}
            inside <code className="text-caption">NavBar</code> already
            stretches each link well past 44px wide).
          </li>
          <li>
            The active link carries{" "}
            <code className="text-caption">aria-current=&quot;page&quot;</code>{" "}
            so assistive technology announces which tab is currently
            selected.
          </li>
          <li>
            <code className="text-caption">NavBar</code> always derives the
            active tab from its <code className="text-caption">
              currentRoute
            </code>{" "}
            prop (e.g. <code className="text-caption">usePathname()</code>)
            &mdash; never hardcode which tab is active.
          </li>
        </ul>
      </section>
    </div>
  );
}
