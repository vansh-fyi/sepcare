"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Icon } from "@/components/icon";

/**
 * Live Card docs route (06-17 Task 1) — renders all 6 resolved rows of
 * `card.DESIGN.md`'s Card Type Map (06-07) as their actual composition, not
 * a bare `Card` repeated 6 times. Each row below matches that table's
 * "Composition" column exactly, including which tokens it introduced.
 *
 * The whole page is a client component (matching `docs/layout.tsx`'s own
 * pattern) purely for the "layout never changes" toggle demo below — the 6
 * Card Type Map rows themselves are static live markup, no state of their
 * own besides the one real `Progress` bar (already a `"use client"` leaf).
 */

function LayoutNeverChangesDemo() {
  const [populated, setPopulated] = useState(true);

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="secondary"
        className="w-fit"
        onClick={() => setPopulated((value) => !value)}
      >
        Toggle {populated ? "empty" : "populated"} state
      </Button>
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>Recent Readings</CardTitle>
        </CardHeader>
        <CardContent>
          {populated ? (
            <p className="text-body text-text-secondary">
              72 bpm &middot; 36.6&deg;C &middot; Normal
            </p>
          ) : (
            <p className="text-body text-text-secondary">
              No readings yet. Vitals will appear here once the device starts
              sending data.
            </p>
          )}
        </CardContent>
      </Card>
      <p className="max-w-sm text-caption text-text-muted">
        <code className="text-caption">Card</code> &rarr;{" "}
        <code className="text-caption">CardHeader</code> &rarr;{" "}
        <code className="text-caption">CardContent</code> never changes shape
        between states &mdash; only <code className="text-caption">CardContent</code>
        &rsquo;s children swap.
      </p>
    </div>
  );
}

function LayoutNeverChangesViolation() {
  return (
    <div className="flex max-w-sm flex-col gap-2 rounded-card-sm border border-dashed border-critical bg-critical-soft p-4">
      <span className="w-fit rounded-md bg-critical px-2 py-1 text-caption font-semibold text-text-inverse">
        &#10007; Extra wrapper only exists for the loading case
      </span>
      <div className="rounded-card-sm border border-dashed border-critical p-2">
        <Card>
          <CardContent>
            <div className="h-4 w-24 animate-pulse rounded bg-bg" />
          </CardContent>
        </Card>
      </div>
      <p className="text-caption text-text-muted">
        Wrapping <code className="text-caption">Card</code> in a one-off{" "}
        <code className="text-caption">div</code> only when loading makes
        Card&rsquo;s own DOM branch on content state &mdash; the violation
        card.DESIGN.md warns against.
      </p>
    </div>
  );
}

export default function DesignSystemDocsCardPage() {
  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-page font-bold text-text text-balance">
          Card
        </h1>
        <p className="max-w-2xl text-body text-text-secondary">
          Card has no variants &mdash; every Card looks the same
          (<code className="text-caption">rounded-card bg-surface shadow-card
          p-4</code>). Figma revealed 6 genuinely distinct card types built on
          top of that one shell; none collapse into a shared variant prop.
          Figma-verified against nodes 266-9387/266-9344 (base surface) plus
          266-9323, 203-13605, 203-13559, and 203-11669 (the 4 type-map rows).
        </p>
      </header>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-heading font-semibold text-text">
            The &ldquo;layout never changes&rdquo; rule
          </h2>
          <p className="max-w-2xl text-body text-text-secondary">
            Card&rsquo;s structural nesting (
            <code className="text-caption">Card &gt; CardHeader? &gt; CardContent</code>
            ) must stay identical across empty, loading, and populated
            states &mdash; only the children passed into{" "}
            <code className="text-caption">CardContent</code> differ.
          </p>
        </div>
        <div className="flex flex-wrap gap-6">
          <LayoutNeverChangesDemo />
          <LayoutNeverChangesViolation />
        </div>
      </section>

      <section className="flex flex-col gap-8 border-t border-border-subtle pt-8">
        <h2 className="text-heading font-semibold text-text">
          Card Type Map &mdash; all 6 rows
        </h2>

        {/* Row 1 — Status Hero Card (266-9323): composition */}
        <div className="flex flex-col gap-3">
          <h3 className="text-body font-semibold text-text">
            1. Status Hero Card
          </h3>
          <div className="flex w-fit rounded-card-sm border border-border-subtle bg-bg p-8">
            <Card className="max-w-sm shadow-[0px_2px_8px_rgba(208,241,237,0.5)]">
              <CardContent className="flex-row items-center gap-4">
                <div className="flex size-[72px] shrink-0 items-center justify-center rounded-card-sm bg-[image:var(--gradient-card-hero-icon)]">
                  <Icon name="safe" size={32} className="text-text-inverse" />
                </div>
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-base">
                    Baby is Resting Safely
                  </CardTitle>
                  <CardDescription className="text-sm text-text-hero-muted">
                    All vitals are within normal range.
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="text-caption text-text-muted">
            Figma node 266-9323 &mdash; composition: 72px icon tile on{" "}
            <code className="text-caption">--gradient-card-hero-icon</code>,{" "}
            <code className="text-caption">CardTitle</code> at{" "}
            <code className="text-caption">text-base</code>, a one-off
            green-tinted shadow (not promoted to a token, since no other card
            type shares it).
          </p>
        </div>

        {/* Row 2 — Instruction Row Card (266-9387): the base primitive itself */}
        <div className="flex flex-col gap-3">
          <h3 className="text-body font-semibold text-text">
            2. Instruction Row Card
          </h3>
          <div className="flex w-fit rounded-card-sm border border-border-subtle bg-bg p-8">
            <Card className="max-w-sm">
              <CardContent className="flex-row items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-card-sm bg-icon-tile-neutral">
                  <Icon name="baby" size={20} className="text-text" />
                </div>
                <div className="flex flex-col gap-1">
                  <CardTitle>Continue Regular Feeding</CardTitle>
                  <CardDescription>
                    Keep baby&rsquo;s room between 26&ndash;28&deg;C.
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="text-caption text-text-muted">
            Figma node 266-9387 &mdash; the base primitive itself, unmodified.
            This is the exact composition Task 1&rsquo;s restyle was tuned
            against: default <code className="text-caption">Card</code> + a
            48px icon tile on{" "}
            <code className="text-caption">--color-icon-tile-neutral</code>.
            The same content also composes as an{" "}
            <a
              href="/design-system/docs/item"
              className="underline underline-offset-4 hover:text-brand"
            >
              Item row
            </a>{" "}
            &mdash; which shape a real instruction list uses is still open,
            per item.DESIGN.md.
          </p>
        </div>

        {/* Row 3 — Vital Stat Card (266-9344): composition, deliberately not a new component */}
        <div className="flex flex-col gap-3">
          <h3 className="text-body font-semibold text-text">
            3. Vital Stat Card (Pulse)
          </h3>
          <div className="flex w-fit rounded-card-sm border border-border-subtle bg-bg p-8">
            <div className="flex max-w-xs flex-col gap-3 rounded-card bg-[image:var(--gradient-metric-pulse)] p-4">
              <div className="flex items-center gap-2 text-text-inverse">
                <Icon name="pulse" size={18} />
                <span className="text-body font-semibold">Pulse</span>
              </div>
              <svg
                viewBox="0 0 76 26"
                className="h-[26px] w-[76px] text-text-inverse"
                aria-hidden="true"
              >
                <polyline
                  points="0,20 10,14 20,18 30,6 40,12 50,4 60,10 76,2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex items-baseline gap-1 text-text-inverse">
                <span className="text-[21px] font-extrabold tabular-nums">
                  72
                </span>
                <span className="text-[10px] font-medium">bpm</span>
              </div>
            </div>
          </div>
          <p className="text-caption text-text-muted">
            Figma node 266-9344 &mdash; a plain{" "}
            <code className="text-caption">div</code>, not{" "}
            <code className="text-caption">Card</code> (no separate white
            surface &mdash; the whole card is the gradient), on{" "}
            <code className="text-caption">--gradient-metric-pulse</code>.
            Deliberately not promoted to a <code className="text-caption">CardMetric</code>{" "}
            export: only the Pulse tone&rsquo;s exact gradient was extracted
            (Temp/Activity follow &ldquo;the same pattern&rdquo; without exact
            stops), so a 3-tone component would either fabricate two
            gradients or ship incomplete &mdash; deferred to whichever plan
            builds the real vitals row. The wavy line above is a placeholder
            shape for the 76&times;26px sparkline slot &mdash; the real{" "}
            <code className="text-caption">Sparkline</code> component ships
            in a later plan and drops into this exact slot.
          </p>
        </div>

        {/* Row 4 — Metric Row Card (203-13605): duplicate of row 2 with swapped tokens */}
        <div className="flex flex-col gap-3">
          <h3 className="text-body font-semibold text-text">
            4. Metric Row Card
          </h3>
          <div className="flex w-fit rounded-card-sm border border-border-subtle bg-bg p-8">
            <Card className="max-w-sm">
              <CardContent className="flex-row items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-card-sm bg-icon-tile-green">
                  <Icon name="activity" size={20} className="text-text" />
                </div>
                <div className="flex flex-col gap-1">
                  <CardTitle>Perfusion Index</CardTitle>
                  <CardDescription className="text-text-muted">
                    Normal &mdash; 96%
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="text-caption text-text-muted">
            Figma node 203-13605 &mdash; identical shape to row 2, with two
            swapped tokens: icon tile on{" "}
            <code className="text-caption">--color-icon-tile-green</code>{" "}
            instead of neutral, and a description color that happens to be an
            exact match to the existing{" "}
            <code className="text-caption">--color-text-muted</code> (unlike
            row 2&rsquo;s, which needed the new{" "}
            <code className="text-caption">--color-text-subtle</code>).
          </p>
        </div>

        {/* Row 5 — Device Status Card, no progress (203-13559) */}
        <div className="flex flex-col gap-3">
          <h3 className="text-body font-semibold text-text">
            5. Device Status Card (no progress)
          </h3>
          <div className="flex w-fit rounded-card-sm border border-border-subtle bg-bg p-8">
            <Card className="max-w-sm shadow-card-device">
              <CardContent className="flex-row items-center gap-4">
                <div className="flex size-[72px] shrink-0 items-center justify-center rounded-card-sm bg-[image:var(--gradient-card-device-icon)]">
                  <Icon name="wearable" size={32} className="text-text-inverse" />
                </div>
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-xl">Device Status</CardTitle>
                  <CardDescription>
                    Paired with{" "}
                    <strong className="font-bold text-text">SKU-1234</strong>
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="text-caption text-text-muted">
            Figma node 203-13559 &mdash; 72px icon tile on{" "}
            <code className="text-caption">--gradient-card-device-icon</code>{" "}
            (vertical, not diagonal like the CTA-button gradients),{" "}
            <code className="text-caption">CardTitle</code> at{" "}
            <code className="text-caption">text-xl</code>, an inline bolded
            SKU segment, and{" "}
            <code className="text-caption">--shadow-card-device</code> (Figma
            authored this one directly against a token, not an rgba literal).
          </p>
        </div>

        {/* Row 6 — Device Status Card, with progress (203-11669) */}
        <div className="flex flex-col gap-3">
          <h3 className="text-body font-semibold text-text">
            6. Device Status Card (with progress)
          </h3>
          <div className="flex w-fit rounded-card-sm border border-border-subtle bg-bg p-8">
            <Card className="max-w-sm shadow-card-device">
              <CardContent className="flex-row items-center gap-4">
                <div className="flex size-[72px] shrink-0 items-center justify-center rounded-card-sm bg-[image:var(--gradient-card-device-icon)]">
                  <Icon name="wearable" size={32} className="text-text-inverse" />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">Device Status</CardTitle>
                    <Icon name="edit" size={20} className="text-text-muted" />
                  </div>
                  <CardDescription>
                    Syncing from{" "}
                    <strong className="font-bold text-text">SKU-1234</strong>
                  </CardDescription>
                  <Progress value={62} />
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="text-caption text-text-muted">
            Figma node 203-11669 &mdash; same base as row 5, plus an
            edit-pencil icon beside the title and a percentage-driven
            horizontal bar (the real{" "}
            <code className="text-caption">Progress</code> primitive). This
            resolves D-16&rsquo;s open question: the bar is a generic{" "}
            <code className="text-caption">progress</code> indicator, not a
            battery glyph &mdash; none of the 6 card nodes show an actual
            battery.
          </p>
        </div>
      </section>
    </div>
  );
}
