"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";

export function CopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }
  return (
    <button
      type="button"
      className="docs-copy"
      onClick={copy}
      aria-label={status === "copied" ? "Copied" : "Copy code"}
    >
      <Icon name={status === "copied" ? "check" : "copy"} size={14} />
      <span aria-live="polite">
        {status === "copied"
          ? "Copied"
          : status === "error"
            ? "Select code to copy"
            : "Copy"}
      </span>
    </button>
  );
}

function highlight(line: string) {
  if (line.trimStart().startsWith("//"))
    return <span className="docs-code-comment">{line}</span>;
  return line
    .split(
      /("[^"\n]*"|'[^'\n]*'|\b(?:import|from|export|const|return|function|true|false)\b|(?<=<\/?)[A-Z][\w.]*)/g,
    )
    .map((part, index) => {
      const kind = /^['"]/.test(part)
        ? "string"
        : /^(import|from|export|const|return|function|true|false)$/.test(part)
          ? "keyword"
          : /^[A-Z][\w.]*$/.test(part)
            ? "tag"
            : undefined;
      return (
        <span key={index} className={kind ? `docs-code-${kind}` : undefined}>
          {part}
        </span>
      );
    });
}

export function CodeBlock({
  code,
  lines,
  filename,
  embedded = false,
}: {
  code?: string;
  lines?: string[];
  filename?: string;
  embedded?: boolean;
}) {
  const source = code ?? lines?.join("\n") ?? "";
  return (
    <div className="docs-code" data-embedded={embedded || undefined}>
      {!embedded && (
        <div className="docs-code-header">
          <span>{filename ?? "tsx"}</span>
          <CopyButton text={source} />
        </div>
      )}
      <pre tabIndex={0} aria-label={filename ?? "Code example"}>
        <code>
          {source.split("\n").map((line, index) => (
            <span className="docs-code-line" key={index}>
              <span className="docs-line-number" aria-hidden="true">
                {index + 1}
              </span>
              <span>{highlight(line)}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
