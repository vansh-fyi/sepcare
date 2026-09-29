import type { CSSProperties } from "react";
export interface TokenSwatchValue {
  name: string;
  value: string;
}
export function TokenSwatch({ name, value }: TokenSwatchValue) {
  const cssVar = `var(${name})`;
  const style: CSSProperties = name.startsWith("--radius-")
    ? {
        borderRadius: cssVar,
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
      }
    : name.startsWith("--shadow-")
      ? { boxShadow: cssVar, background: "var(--color-surface)" }
      : name.startsWith("--gradient-")
        ? { backgroundImage: cssVar }
        : name.startsWith("--color-")
          ? { background: cssVar }
          : { background: "var(--color-bg)" };
  return (
    <div className="docs-token">
      <div className="docs-token-sample" style={style} />
      <div className="docs-token-copy">
        <code>{name}</code>
        <small>{value}</small>
      </div>
    </div>
  );
}
export function TokenSwatchGrid({ tokens }: { tokens: TokenSwatchValue[] }) {
  return (
    <div className="docs-token-list">
      {tokens.map((token) => (
        <TokenSwatch key={token.name} {...token} />
      ))}
    </div>
  );
}
