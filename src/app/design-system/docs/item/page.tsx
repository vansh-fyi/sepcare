import { Fragment } from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Icon, type IconName } from "@/components/icon";

/**
 * Live Item docs route (06-17 Task 1) — `Item` is the canonical row/list-item
 * primitive (item.DESIGN.md), Figma-verified against node 266-9257's
 * instruction-list region. Renders a real 4-row instruction list matching
 * the Home-screen pattern, plus a second row demonstrating the
 * `ItemActions` slot.
 */

const INSTRUCTIONS: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "baby",
    title: "Continue Regular Feeding",
    description: "Keep baby’s room between 26–28°C.",
  },
  {
    icon: "temperature",
    title: "Monitor Skin Contact",
    description: "Skin-to-skin contact helps regulate temperature.",
  },
  {
    icon: "movement",
    title: "Track Gentle Movement",
    description:
      "Light activity is normal — watch for prolonged stillness.",
  },
  {
    icon: "breathing",
    title: "Watch Breathing Pattern",
    description: "Steady, even breaths are expected during sleep.",
  },
];

export default function DesignSystemDocsItemPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          Item
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          The shadcn <code className="text-caption">item</code> registry
          component, restyled to this project&rsquo;s token layer. It is the
          canonical row/list-item primitive &mdash; every instruction row or
          settings-style row composes from <code className="text-caption">
            Item
          </code>
          , never a hand-rolled <code className="text-caption">div</code> row.
          Figma-verified against node 266-9257 (the Home screen&rsquo;s
          instruction-list region).
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading font-semibold text-text">
          Instruction list
        </h2>
        <p className="max-w-2xl text-body text-text-secondary">
          One <code className="text-caption">Item</code> per instruction,
          grouped in an <code className="text-caption">ItemGroup</code> for
          consistent spacing, separated by{" "}
          <code className="text-caption">ItemSeparator</code>.
        </p>
        <ItemGroup className="max-w-md rounded-card border border-border-subtle bg-surface">
          {INSTRUCTIONS.map((instruction, index) => (
            <Fragment key={instruction.title}>
              <Item>
                <ItemMedia variant="icon">
                  <Icon name={instruction.icon} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{instruction.title}</ItemTitle>
                  <ItemDescription>{instruction.description}</ItemDescription>
                </ItemContent>
              </Item>
              {index < INSTRUCTIONS.length - 1 && <ItemSeparator />}
            </Fragment>
          ))}
        </ItemGroup>
      </section>

      <section className="flex flex-col gap-4 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">
          Row with actions
        </h2>
        <p className="max-w-2xl text-body text-text-secondary">
          <code className="text-caption">ItemActions</code> renders a trailing
          slot for a control the row itself does not own &mdash; here, an
          edit affordance.
        </p>
        <Item variant="outline" className="max-w-md">
          <ItemMedia variant="icon">
            <Icon name="settings" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Notification Preferences</ItemTitle>
            <ItemDescription>
              Choose when caregivers are alerted.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Icon name="edit" className="text-text-muted" />
          </ItemActions>
        </Item>
      </section>

      <section className="flex flex-col gap-2 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">
          Item vs. a bespoke row
        </h2>
        <p className="max-w-2xl text-body text-text-secondary">
          Reach for <code className="text-caption">Item</code> whenever
          content is icon + title + description(+actions) in a row &mdash;
          which covers instruction rows, settings rows, and list-item cards.
          Do not hand-roll a competing <code className="text-caption">
            flex
          </code>{" "}
          row for that shape; <code className="text-caption">Item</code>{" "}
          already exists precisely so this pattern is never re-invented per
          page. The one open question is composition, not primitive choice:
          card.DESIGN.md&rsquo;s real Figma extraction found the Home
          screen&rsquo;s instruction row (node 266-9387) is itself a
          self-contained{" "}
          <a
            href="/design-system/docs/card"
            className="underline underline-offset-4 hover:text-brand"
          >
            Card
          </a>{" "}
          &mdash; so the real instruction list may end up as a vertical stack
          of individually-carded rows (<code className="text-caption">
            Card
          </code>{" "}
          per instruction), not literally one{" "}
          <code className="text-caption">Card</code> wrapping many{" "}
          <code className="text-caption">Item</code> rows as shown above.
          Either shape is ready today &mdash; <code className="text-caption">
            Item
          </code>
          &rsquo;s own typography stays Figma-grounded regardless of which a
          later plan picks.
        </p>
      </section>
    </div>
  );
}
