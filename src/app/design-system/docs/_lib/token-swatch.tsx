import type { CSSProperties, ReactNode } from "react";

/**
 * Shared live-token swatch renderer (06-16) — every Actions & Forms docs
 * route's "tokens this component consumes" section renders through this one
 * module instead of re-implementing per-token-kind swatch logic 9 times.
 *
 * The visual sample always references the CSS custom property **by name**
 * (`var(--token-name)`), never by its parsed text value — a token's
 * right-hand side can itself be a nested `var(...)` reference (e.g.
 * `--color-border-focus: var(--color-blue-400);`), and letting the browser
 * resolve that chain natively is simpler and more correct than re-resolving
 * it in JS. The caption text below the swatch shows the real, live-parsed
 * value string (via `getExactToken`) so the page still proves it pulled a
 * live value, not a hardcoded copy.
 */
export interface TokenSwatchValue {
  name: string;
  value: string;
}

export function TokenSwatch({ name, value }: TokenSwatchValue) {
  const cssVar = `var(${name})`;
  let swatch: ReactNode = null;

  if (name.startsWith("--radius-")) {
    const style: CSSProperties = { borderRadius: cssVar };
    swatch = (
      <div
        className="size-16 shrink-0 border border-border-subtle bg-surface"
        style={style}
      />
    );
  } else if (name.startsWith("--shadow-")) {
    const style: CSSProperties = { boxShadow: cssVar };
    swatch = (
      <div className="size-16 shrink-0 rounded-card-sm bg-surface" style={style} />
    );
  } else if (name.startsWith("--gradient-")) {
    const style: CSSProperties = { backgroundImage: cssVar };
    swatch = (
      <div
        className="size-16 shrink-0 rounded-card-sm border border-border-subtle"
        style={style}
      />
    );
  } else if (name.startsWith("--color-")) {
    const style: CSSProperties = { background: cssVar };
    swatch = (
      <div
        className="size-16 shrink-0 rounded-card-sm border border-border-subtle"
        style={style}
      />
    );
  } else if (name.startsWith("--text-") && !name.includes("--line-height")) {
    const style: CSSProperties = { fontSize: cssVar };
    swatch = (
      <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-card-sm border border-border-subtle bg-surface">
        <span className="text-text" style={style}>
          Ag
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {swatch}
      <div className="flex flex-col">
        <code className="text-caption font-semibold text-text">{name}</code>
        <span className="text-caption text-text-muted">{value}</span>
      </div>
    </div>
  );
}

export function TokenSwatchGrid({ tokens }: { tokens: TokenSwatchValue[] }) {
  return (
    <div className="flex flex-wrap gap-6">
      {tokens.map((token) => (
        <TokenSwatch key={token.name} {...token} />
      ))}
    </div>
  );
}
