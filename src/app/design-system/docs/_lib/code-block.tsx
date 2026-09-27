/**
 * Shared usage-notes code renderer (06-16) — every Actions & Forms docs
 * route's Correct/Incorrect usage section renders through this module
 * instead of dumping raw `.DESIGN.md` markdown into a `<pre>` tag (the exact
 * anti-pattern D-13/06-PATTERNS.md rejected in the pre-06-11 docs page).
 *
 * `lines` is a real array of individually-authored code lines (lifted from
 * the component's own DESIGN.md, not a markdown string blob) — each line
 * renders as its own `<span>` so structure stays JSX, never `<pre>{raw}</pre>`.
 */
export function CodeBlock({ lines }: { lines: string[] }) {
  return (
    <div className="flex flex-col gap-0.5 overflow-x-auto rounded-card-sm border border-border-subtle bg-bg p-4 font-mono text-caption text-text">
      {lines.map((line, index) => (
        <span key={index} className="whitespace-pre">
          {line.length > 0 ? line : " "}
        </span>
      ))}
    </div>
  );
}
