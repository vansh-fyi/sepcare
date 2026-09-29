import type { ReactNode } from "react";
import { CodeBlock, CopyButton } from "./code-block";

export interface DocHeading {
  id: string;
  title: string;
}

export function DocPage({
  title,
  description,
  category = "Components",
  sections = [],
  outline = true,
  children,
}: {
  title: string;
  description: string;
  category?: string;
  sections?: DocHeading[];
  outline?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="docs-page" data-wide={!outline || undefined}>
      <article className="docs-article" tabIndex={0} aria-label={title}>
        <header className="docs-page-header">
          <p className="docs-eyebrow">{category}</p>
          <h1>{title}</h1>
          <p className="docs-lead">{description}</p>
        </header>
        {children}
      </article>
      {outline && (
        <aside className="docs-outline" aria-label="On this page">
          <div>
            <p>On this page</p>
            <nav>
              {sections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>
                  {section.title}
                </a>
              ))}
            </nav>
            <a
              className="docs-outline-link"
              href="/design-system/docs/examples/clinical-dashboard"
            >
              Explore examples <span aria-hidden="true">↗</span>
            </a>
          </div>
        </aside>
      )}
    </div>
  );
}

export function DocSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="docs-section">
      <h2>
        <a href={`#${id}`}>
          {title}
          <span aria-hidden="true">#</span>
        </a>
      </h2>
      {description && <p className="docs-description">{description}</p>}
      {children}
    </section>
  );
}

export function Preview({
  children,
  code,
  controls,
  caption,
  tone = "plain",
}: {
  children: ReactNode;
  code: string;
  controls?: ReactNode;
  caption?: string;
  tone?: "plain" | "canvas";
}) {
  return (
    <div className="docs-example">
      {controls && <div className="docs-example-controls">{controls}</div>}
      <div className="docs-preview" data-tone={tone}>
        {children}
      </div>
      {caption && <p className="docs-example-caption">{caption}</p>}
      <div className="docs-example-source">
        <details>
          <summary>
            <span aria-hidden="true">&lt;/&gt;</span> View code
          </summary>
          <CodeBlock code={code} embedded />
        </details>
        <CopyButton text={code} />
      </div>
    </div>
  );
}

export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};
export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="docs-table-wrap">
      <table className="docs-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type / default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>
                <code>{row.name}</code>
              </td>
              <td>
                <code>{row.type}</code>
                {row.default && (
                  <span className="docs-prop-default">
                    Default: {row.default}
                  </span>
                )}
              </td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DocNote({ children }: { children: ReactNode }) {
  return <aside className="docs-note">{children}</aside>;
}
