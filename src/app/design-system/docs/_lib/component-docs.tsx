import {
  DocPage,
  DocSection,
  DocNote,
  PropsTable,
} from "@/components/docs/documentation";
import { CodeBlock } from "@/components/docs/code-block";
import { COMPONENT_CONTENT, type ComponentName } from "./component-content";
import { ComponentExample, ComponentVariations } from "./component-examples";
import { TokenSwatchGrid } from "./token-swatch";
import { getExactToken, readThemeBlock } from "./tokens";

export function ComponentDocs({ name }: { name: ComponentName }) {
  const content = COMPONENT_CONTENT[name];
  const theme = readThemeBlock();
  return (
    <DocPage
      category={name === "motion" ? "Motion and animation" : "Components"}
      title={content.title}
      description={content.description}
      sections={[
        { id: "preview", title: "Preview" },
        { id: "usage", title: "Usage" },
        { id: "examples", title: name === "button" ? "Variants" : "Examples" },
        { id: "api", title: "API reference" },
        { id: "tokens", title: "Design tokens" },
      ]}
    >
      <div id="preview" className="scroll-mt-24">
        <ComponentExample name={name} />
      </div>
      <DocSection id="usage" title="Usage">
        <CodeBlock code={content.usage} />
        <DocNote>{content.guidance}</DocNote>
      </DocSection>
      <DocSection
        id="examples"
        title={
          name === "button"
            ? "Variants"
            : name === "card"
              ? "Build a card"
              : "Examples"
        }
      >
        <ComponentVariations name={name} />
      </DocSection>
      <DocSection
        id="api"
        title="API reference"
        description={
          name === "status-summary"
            ? "InfantStatusCard is a composition. Its supported props are listed below."
            : name === "motion"
            ? "PulseWave is the motion primitive; DeviceHeader is a shared composition. Their supported props are listed below."
            : "Standard element props and className pass through to the underlying control."
        }
      >
        <PropsTable rows={content.props} />
      </DocSection>
      <DocSection
        id="tokens"
        title="Design tokens"
        description="These values come from the shared theme. Change the token to update every component that uses it."
      >
        <TokenSwatchGrid
          tokens={content.tokens.map((token) => ({
            name: token,
            value: getExactToken(theme, token),
          }))}
        />
      </DocSection>
    </DocPage>
  );
}
