<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# shadcn/ui and cn are also newer than your training data

This project's design system (Phase 6) uses the shadcn/ui CLI and the `cn` npm package, both of which have changed meaningfully since typical training cutoffs — do not pattern-match to older versions or adjacent tools.

The `shadcn` CLI's defaults and flags shift across versions — this project discovered mid-session that CLI 4.21.0 no longer defaults to a Radix base, it now defaults to Base UI, so `-b radix` must be passed explicitly on every `add`/`init` invocation; before running any `shadcn` CLI command, or writing code against a shadcn-generated component, check the current docs at ui.shadcn.com and/or the installed CLI's own `--help` output rather than assuming past behavior.

The `cn` package (github.com/shadcn-ui/cn, npm package `cn`) is a very new package — ownership of the npm name transferred to the shadcn-ui org starting at v0.2.0 (September 2026), replacing the older `clsx`+`tailwind-merge` combo shadcn projects used to hand-roll; training data likely predates this package's existence under this ownership entirely, or worse, pattern-matches it to the unrelated 2013 "Chuck Norris jokes" CLI that previously held the same npm name; before assuming anything about `cn`'s API, check its actual npm page/README or the installed package's shipped type declarations rather than assuming it behaves like `clsx`/`tailwind-merge`.

Before writing code against any dependency installed or upgraded recently in this project (check `package.json`'s git history if unsure), verify current usage against the package's own shipped types/docs/README rather than relying on potentially-stale training data — the same principle the Next.js block above establishes, generalized to this project's newly-adopted packages.
