import { DocPage, DocSection, DocNote } from "@/components/docs/documentation";
import { CodeBlock } from "@/components/docs/code-block";
import { ColorChip } from "@/components/docs/color-chip";
import { Badge } from "@/components/ui/badge";
import { TokenSwatchGrid } from "../_lib/token-swatch";
import {
  groupSemanticColorTokens,
  parsePrimitiveRamps,
  readThemeBlock,
} from "../_lib/tokens";

export default function ColorsPage() {
  const theme = readThemeBlock();
  const ramps = parsePrimitiveRamps(theme);
  const groups = groupSemanticColorTokens(theme);
  return (
    <DocPage
      category="Foundations"
      title="Colors"
      description="Five color families define SepCare's palette. Semantic names give each color a job, so the same status or action looks consistent across screens."
      sections={[
        { id: "palette", title: "Palette" },
        { id: "roles", title: "Semantic roles" },
        { id: "status", title: "Clinical status" },
        { id: "usage", title: "Using color" },
      ]}
    >
      <div id="palette" className="scroll-mt-24">
        {ramps.map((ramp) => (
          <div className="docs-ramp" key={ramp.ramp}>
            <h3>{ramp.ramp}</h3>
            <div className="docs-ramp-steps">
              {ramp.steps.map((step) => (
                <ColorChip key={step.step} {...step} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="docs-description">Select a swatch to copy its hex value.</p>
      <DocSection
        id="roles"
        title="Semantic roles"
        description="Use these names in components. The values are read directly from the shared theme."
      >
        {groups.map((group) => (
          <div className="docs-section" key={group.title}>
            <h3 className="mb-2 text-sm font-semibold">{group.title}</h3>
            <TokenSwatchGrid tokens={group.tokens} />
          </div>
        ))}
      </DocSection>
      <DocSection
        id="status"
        title="Clinical status"
        description="Pair color with an icon and a clear label. A reader should be able to understand the status without distinguishing the hue."
      >
        <div className="flex flex-wrap gap-4">
          <Badge status="safe">Safe</Badge>
          <Badge status="caution">Needs attention</Badge>
          <Badge status="critical">Critical</Badge>
        </div>
        <DocNote>
          Blue identifies general actions and links. Pink also appears in the
          connection and navigation treatments from the Figma designs. Those
          controls are distinct from a clinical status message; their labels
          explain the action.
        </DocNote>
      </DocSection>
      <DocSection
        id="usage"
        title="Using color"
        description="Reference the role rather than choosing a palette step for each new screen."
      >
        <CodeBlock
          code={
            '<p className="text-text-secondary">Last synced a moment ago</p>\n<div className="bg-safe-soft text-safe-dark">Connected</div>\n\n// Charts use the same CSS variables.\nconst series = { color: "var(--color-safe)" }'
          }
        />
      </DocSection>
    </DocPage>
  );
}
