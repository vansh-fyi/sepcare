import Link from "next/link";
import { DocPage, DocSection, Preview } from "@/components/docs/documentation";
import { CodeBlock } from "@/components/docs/code-block";
import {
  DeviceCard,
  StatusCard,
  VitalCard,
  InstructionCard,
} from "@/components/patterns/clinical-cards";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { DOCS_COMPONENT_CATEGORIES } from "./_lib/categories";

const PULSE = [118, 122, 119, 124, 121, 130, 123, 125, 120, 126, 124, 128].map(
  (value) => ({ value }),
);
const TEMPERATURE = [98.2, 98.4, 98.3, 98.5, 98.6, 98.5, 98.7, 98.6].map(
  (value) => ({ value }),
);

export default function IntroductionPage() {
  return (
    <DocPage
      title="SepCare design system"
      category="Introduction"
      description="The components behind SepCare's caregiver and clinical screens. Explore the visual language, try each control, and use the same patterns in the app."
      sections={[
        { id: "in-context", title: "In context" },
        { id: "start-building", title: "Start building" },
        { id: "components", title: "Components" },
      ]}
    >
      <div id="in-context" className="scroll-mt-24">
        <Preview
          tone="canvas"
          caption="Sample data. These are the shared components used in the home example."
          code={
            'import { DeviceCard, StatusCard, VitalCard } from "@/components/patterns/clinical-cards"\n\n<StatusCard\n  status="safe"\n  title="Baby is resting safely"\n  description="Based on the latest available readings, baby is healthy."\n/>\n<DeviceCard name="Device-SKU-1234" identifier="Device ID: SKU-1234" battery={90} />\n<VitalCard metric="pulse" value="128" unit="bpm" data={readings} />'
          }
        >
          <div className="docs-overview-board">
            <div className="docs-overview-column">
              <StatusCard
                status="safe"
                title="Baby is resting safely"
                description="Based on the latest available readings, baby is healthy."
              />
              <DeviceCard
                name="Device-SKU-1234"
                identifier="Device ID: SKU-1234"
                battery={90}
              />
              <InstructionCard
                icon="ankleBand"
                title="Check the band"
                description="Follow the fitting instructions supplied with the device."
              />
            </div>
            <div className="docs-overview-column">
              <div className="docs-overview-vitals">
                <VitalCard metric="pulse" value="128" unit="bpm" data={PULSE} />
                <VitalCard
                  metric="temperature"
                  value="98.6"
                  unit="°F"
                  data={TEMPERATURE}
                />
              </div>
              <Button asChild variant="primary" tone="neutral">
                <Link href="/design-system/docs/button">
                  <Icon name="signal" size={18} />
                  Explore buttons
                </Link>
              </Button>
              <p className="text-xs leading-relaxed text-text-secondary">
                White surfaces, soft shadows, and color with a specific role.
                The components carry those choices into every screen.
              </p>
            </div>
          </div>
        </Preview>
      </div>
      <DocSection
        id="start-building"
        title="Start with the shared components"
        description="Import a component from the project and supply its content. Its spacing, type, colors, and interaction states are already defined."
      >
        <CodeBlock
          code={
            'import { Button } from "@/components/ui/button"\nimport { DeviceCard } from "@/components/patterns/clinical-cards"\n\n<DeviceCard name="Device-SKU-1234" identifier="Device ID: SKU-1234" battery={90} />\n<Button variant="primary" tone="neutral">Connect device</Button>'
          }
        />
        <div className="docs-link-list">
          <Link href="/design-system/docs/colors">
            Color roles <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/design-system/docs/typography">
            Type and hierarchy <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/design-system/docs/card">
            Clinical card patterns <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/design-system/docs/examples/clinical-dashboard">
            Home example <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </DocSection>
      <DocSection
        id="components"
        title="Components"
        description="Each page includes a working preview, usage examples, and the props you can change."
      >
        <div className="docs-link-list">
          {DOCS_COMPONENT_CATEGORIES.filter(
            (group) => group.name !== "Examples",
          )
            .flatMap((group) => group.links)
            .map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
        </div>
      </DocSection>
    </DocPage>
  );
}
