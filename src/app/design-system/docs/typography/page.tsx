import { DocPage, DocSection } from "@/components/docs/documentation";
import { CodeBlock } from "@/components/docs/code-block";
import { readThemeBlock, resolveTypographyRoles } from "../_lib/tokens";

export default function TypographyPage() {
  const roles = resolveTypographyRoles(readThemeBlock());
  return (
    <DocPage
      category="Foundations"
      title="Typography"
      description="Plus Jakarta Sans gives headings and key readings their shape. Inter keeps labels, controls, and longer text clear at small sizes."
      sections={[
        { id: "families", title: "Font families" },
        { id: "scale", title: "Type scale" },
        { id: "usage", title: "Using type" },
      ]}
    >
      <div id="families" className="scroll-mt-24">
        <div className="docs-font-specimen">
          <span className="docs-font-name">
            Plus Jakarta Sans · Headings and key readings
          </span>
          <p className="docs-font-sample font-heading font-semibold">
            Device details
          </p>
          <p className="font-heading text-text-muted">
            Aa Bb Cc Dd Ee Ff Gg &nbsp; 0123456789
          </p>
        </div>
        <div className="docs-font-specimen">
          <span className="docs-font-name">
            Inter · Body, labels, and controls
          </span>
          <p className="docs-font-sample font-sans">
            Last synced two minutes ago.
          </p>
          <p className="font-sans text-text-muted">
            Aa Bb Cc Dd Ee Ff Gg &nbsp; 0123456789
          </p>
        </div>
      </div>
      <DocSection
        id="scale"
        title="Clinical type scale"
        description="These samples use the same size tokens as the clinical components. Choose a role based on the content's place in the screen."
      >
        {roles.map((role) => (
          <div className="docs-type-row" key={role.id}>
            <p
              className={`${role.className} ${["display", "heading-page", "heading", "heading-card", "vital-metric"].includes(role.id) ? "font-heading" : "font-sans"} text-text`}
            >
              {role.sample}
            </p>
            <div className="docs-type-meta">
              <span>{role.label}</span>
              <span>{role.sizeValue}</span>
              <span>{role.weightLabel}</span>
              <span>Line height {role.lineHeightValue}</span>
            </div>
          </div>
        ))}
      </DocSection>
      <DocSection
        id="usage"
        title="Using type"
        description="Keep numeric readings aligned with tabular figures. Let supporting text wrap, and use weight to separate a label from its value."
      >
        <CodeBlock
          code={
            '<h1 className="font-heading text-heading-page font-bold">Device details</h1>\n<p className="text-body text-text-secondary">Review the latest readings.</p>\n<p className="font-heading text-vital-metric font-bold tabular-nums">128</p>'
          }
        />
      </DocSection>
    </DocPage>
  );
}
