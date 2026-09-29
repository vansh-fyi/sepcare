"use client";

import { Wordmark } from "@/components/wordmark";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/icon";
import { DOCS_COMPONENT_CATEGORIES, DOCS_TOP_LINKS } from "./_lib/categories";
import "@/components/docs/docs.css";

const GROUPS = [
  { name: "Getting started", links: DOCS_TOP_LINKS },
  ...DOCS_COMPONENT_CATEGORIES,
];
const LINKS = GROUPS.flatMap((group) =>
  group.links.map((link) => ({ ...link, group: group.name })),
);

function DocumentationNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Documentation">
      {GROUPS.map((group) => (
        <div className="docs-nav-group" key={group.name}>
          <h2>{group.name}</h2>
          {group.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              onClick={onNavigate}
            >
              {link.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

export default function DesignSystemDocsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const searchDialog = useRef<HTMLDialogElement>(null);
  const mobileDialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const results = LINKS.filter((link) =>
    `${link.label} ${link.group}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (searchDialog.current?.open) searchDialog.current.close();
        else searchDialog.current?.showModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="docs-root">
      <a className="docs-skip" href="#documentation-content">
        Skip to content
      </a>
      <header className="docs-header">
        <div className="docs-header-inner">
          <button
            className="docs-mobile-trigger"
            aria-label="Open navigation"
            onClick={() => mobileDialog.current?.showModal()}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="var(--icon-stroke-width, 2.25)"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link className="docs-logo" href="/design-system/docs">
            <span className="docs-logo-mark">
              <Icon name="pulse" size={19} />
            </span>
            <Wordmark />
          </Link>
          <nav className="docs-header-nav" aria-label="Main navigation">
            <Link
              href="/design-system/docs"
              aria-current={
                pathname === "/design-system/docs" ? "page" : undefined
              }
            >
              Introduction
            </Link>
            <Link
              href="/design-system/docs/button"
              aria-current={
                ![
                  "/design-system/docs",
                  "/design-system/docs/examples",
                  "/design-system/docs/colors",
                  "/design-system/docs/typography",
                ].includes(pathname) &&
                !pathname.startsWith("/design-system/docs/examples")
                  ? "page"
                  : undefined
              }
            >
              Components
            </Link>
            <Link
              href="/design-system/docs/colors"
              aria-current={
                [
                  "/design-system/docs/colors",
                  "/design-system/docs/typography",
                ].includes(pathname)
                  ? "page"
                  : undefined
              }
            >
              Foundations
            </Link>
            <Link
              href="/design-system/docs/examples/clinical-dashboard"
              aria-current={
                pathname.startsWith("/design-system/docs/examples")
                  ? "page"
                  : undefined
              }
            >
              Examples
            </Link>
          </nav>
          <button
            className="docs-search-trigger"
            onClick={() => searchDialog.current?.showModal()}
            aria-label="Search documentation"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="var(--icon-stroke-width, 2.25)"
              aria-hidden="true"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 5 5" />
            </svg>
            <span>Search documentation…</span>
            <kbd>⌘ K</kbd>
          </button>
        </div>
      </header>
      <div className="docs-workspace">
        <aside className="docs-sidebar">
          <DocumentationNav />
        </aside>
        <main
          id="documentation-content"
          key={pathname}
          className="docs-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
      <dialog
        ref={searchDialog}
        className="docs-dialog"
        aria-label="Search documentation"
        onClick={(event) => {
          if (event.target === event.currentTarget)
            searchDialog.current?.close();
        }}
      >
        <div className="docs-search-field">
          <input
            autoFocus
            aria-label="Search pages"
            placeholder="Search components and foundations…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button
            className="docs-dialog-close"
            onClick={() => searchDialog.current?.close()}
            aria-label="Close search"
          >
            Esc
          </button>
        </div>
        <div className="docs-search-results">
          {results.length ? (
            results.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  searchDialog.current?.close();
                  setQuery("");
                }}
              >
                <span>{link.label}</span>
                <small>{link.group}</small>
              </Link>
            ))
          ) : (
            <p>No pages found for “{query}”. Try a component name.</p>
          )}
        </div>
      </dialog>
      <dialog
        ref={mobileDialog}
        className="docs-dialog docs-mobile-dialog"
        aria-label="Documentation navigation"
      >
        <button
          className="docs-dialog-close"
          onClick={() => mobileDialog.current?.close()}
        >
          Close
        </button>
        <DocumentationNav onNavigate={() => mobileDialog.current?.close()} />
      </dialog>
    </div>
  );
}
