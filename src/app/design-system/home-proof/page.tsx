import { Icon, type IconName } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { NavBar } from "@/components/ui/nav-bar";
import { Sparkline, type SparklinePoint } from "@/components/ui/sparkline";

/**
 * Home dashboard proof-of-concept page (D-14) — Figma node `266-9257`, Segue
 * 3.0. This is the phase's ultimate integration proof: it composes the D-12
 * component set built across Waves 1-5 (Card/Item from 06-07, Progress/
 * BatteryIndicator from 06-08, NavLink/NavBar from 06-10, Sparkline from
 * 06-15) into one real, Figma-verified, shippable-looking screen — not a new
 * primitive of its own besides the icon entries Task 1 added. Lives under
 * `src/app/design-system/*` alongside the other sample/proof pages (D-10)
 * — a design-system proof page, not a production route. No real
 * data-fetching layer; every value below is mock/local data defined in this
 * file.
 *
 * Per the D-15 mechanism, exact spacing/color/typography values for every
 * section come from `.planning/phases/06-design-system-tailwind-v4-tokens/
 * 06-FIGMA-EXTRACTS.md`'s "Home-screen node (06-20 — Home-proof page, D-14)"
 * section (this executor has no direct Figma MCP tool access — see that
 * file's own header note). **The second half of D-15 — screenshotting this
 * rendered page and visually diffing it against the Figma `get_screenshot`
 * output for node `266-9257` — is explicitly deferred to the orchestrator**
 * (this executor also has no browser/screenshot tool access); this plan's
 * own SUMMARY.md records that deferral rather than silently skipping it.
 *
 * Icon reuse (Task 1 cross-check against `icon.tsx`'s existing 40+ set,
 * before any new entry was added):
 * - `wearable` — reused for the device/smartwatch glyph (Figma
 *   `fluent:smartwatch-dot-20-regular`), both in the two header icon
 *   buttons and the larger device-row icon tile.
 * - `sort` — reused as-is for "Interface / Sorting Left"; only the -90deg
 *   rotation (a per-instance transform, not a new glyph) is Figma-specific.
 * - `check` — reused for the generic checkmark glyph (status chips, the
 *   Status Hero Card's icon tile, and Activity's status-word slot).
 * - `baby` / `ankleBand` — reused for `hugeicons:baby-02` / `uil:watch`
 *   respectively (Instructions rows 2 and 3).
 * - `bottleBaby` — the one genuine gap Task 1 hand-authored (Instructions
 *   row 1, `lucide-lab:bottle-baby`).
 *
 * Device status header (archetype-C icon buttons, node `266-9285`) reuses
 * `Button`'s existing `icon-filled` variant rather than hand-rolling a new
 * dark icon-button treatment.
 */

const PULSE_TREND: SparklinePoint[] = [
  { value: 118 },
  { value: 122 },
  { value: 120 },
  { value: 125 },
  { value: 130 },
  { value: 128 },
  { value: 132 },
  { value: 128 },
];

const TEMP_TREND: SparklinePoint[] = [
  { value: 98.2 },
  { value: 98.4 },
  { value: 98.3 },
  { value: 98.5 },
  { value: 98.6 },
  { value: 98.5 },
  { value: 98.7 },
  { value: 98.6 },
];

const INSTRUCTIONS: { icon: IconName; title: string; subtitle: string }[] = [
  {
    icon: "bottleBaby",
    title: "Continue Regular Feeding",
    subtitle: "Every 2–3 hours, on demand",
  },
  {
    icon: "baby",
    title: "Keep Baby Warm & Covered",
    subtitle: "Room between 26–28°C",
  },
  {
    icon: "ankleBand",
    title: "Keep Ankle Band On",
    subtitle: "Snug but not tight — check hourly",
  },
];

interface VitalStatCardProps {
  label: string;
  icon: IconName;
  gradient: string;
  data?: SparklinePoint[];
  value?: string;
  unit?: string;
  statusWord?: string;
}

/**
 * Vital Stat Card composition (Card Type Map #2, `card.DESIGN.md`, Figma
 * node `266-9344`) — deliberately not promoted to a shared `card.tsx`
 * export (card.DESIGN.md's own disposition deferred the Temp/Activity
 * tones to whichever plan built the real vitals row; this is that plan).
 * A full-bleed status-gradient `<div>` sharing `Card`'s `rounded-card p-4`
 * shell, not `Card` itself (no separate white surface). Activity's variant
 * swaps the sparkline+number slot for a status-icon+word slot per the
 * Figma extraction — not an identical layout to Pulse/Temp.
 */
function VitalStatCard({
  label,
  icon,
  gradient,
  data,
  value,
  unit,
  statusWord,
}: VitalStatCardProps) {
  return (
    <div
      className="flex flex-1 flex-col justify-between gap-3 rounded-card p-4 text-text-inverse"
      style={{ backgroundImage: gradient }}
    >
      <div className="flex items-center justify-between">
        <span className="text-caption font-semibold">{label}</span>
        <Icon name={icon} size={16} />
      </div>
      {data ? (
        <>
          <Sparkline data={data} color="var(--color-text-inverse)" />
          <p className="flex items-baseline gap-1 tabular-nums">
            <span className="text-vital-metric font-extrabold">{value}</span>
            <span className="text-[10px] font-medium">{unit}</span>
          </p>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 py-1">
          <Icon name="check" size={28} />
          <span className="text-caption font-bold">{statusWord}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Instruction Row Card composition (Card Type Map #2, `card.DESIGN.md`,
 * node `266-9387`) — `Card` unmodified, plus `Item`'s sub-parts
 * (`ItemMedia`/`ItemContent`/`ItemTitle`/`ItemDescription`) for the inner
 * icon-tile + text block, per this plan's explicit instruction. Uses only
 * the sub-parts (not the outer `<Item>` root) since `Card` already
 * supplies the row's own surface/padding/shadow — an outer `<Item>` would
 * double that padding, the same double-padding class of bug `card.tsx`'s
 * own `CardFooter` fix (06-07) already corrected once in this phase.
 */
function InstructionRow({
  icon,
  title,
  subtitle,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
}) {
  return (
    <Card className="flex items-center gap-4">
      <ItemMedia variant="icon">
        <Icon name={icon} size={20} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{subtitle}</ItemDescription>
      </ItemContent>
    </Card>
  );
}

export default function HomeProofPage() {
  return (
    <div
      className="min-h-screen pb-32"
      style={{ backgroundColor: "var(--color-page-canvas)" }}
    >
      {/* 1. Device status header (D-14 structural item 1) */}
      <header className="rounded-b-[var(--radius-header)] bg-neutral-800 px-5 pt-3 pb-6">
        <div
          aria-hidden="true"
          className="flex items-center justify-between text-caption font-medium text-text-inverse/90"
        >
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <Icon name="signal" size={14} />
            <Icon name="connected" size={14} />
            <Icon name="battery" size={14} />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-body text-text-inverse/80">
            <Icon name="calendar" size={16} />
            <span className="text-[14px]">Sun, 16 Aug 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="icon-filled" aria-label="Sort readings">
              <Icon name="sort" size={20} className="-rotate-90" />
            </Button>
            <Button variant="icon-filled" aria-label="Device settings">
              <Icon name="wearable" size={20} />
            </Button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div className="flex size-13 shrink-0 items-center justify-center rounded-card-sm bg-safe-dark">
            <Icon name="wearable" size={28} className="text-text-inverse" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xl font-bold text-text-inverse">
              Device-SKU-1234
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-icon-fill-dark px-2 py-1 text-[10px] font-medium text-text-inverse">
                <Icon name="check" size={12} />
                Monitor Active
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-icon-fill-dark px-2 py-1 text-[10px] font-medium text-text-inverse">
                <Icon name="check" size={12} />
                Wearable Connected
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-8 px-5 pt-6">
        {/* 2. Status hero card (D-14 structural item 2) */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-text-strong">
              Infant Status
            </h2>
            <Icon name="more" size={20} className="text-text-muted" />
          </div>
          <Card className="shadow-[0px_2px_8px_rgba(208,241,237,0.5)]">
            <div className="flex items-center gap-4">
              <div className="flex size-18 shrink-0 items-center justify-center rounded-card-sm bg-[image:var(--gradient-card-hero-icon)]">
                <Icon name="check" size={40} className="text-text-inverse" />
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle className="text-base">
                  Baby is Resting Safely.
                </CardTitle>
                <CardDescription className="text-sm text-text-hero-muted">
                  All vitals steady over the last hour.
                </CardDescription>
              </div>
            </div>
          </Card>
        </section>

        {/* 3. 3-column vitals row (D-14 structural item 3) */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-text-strong">Vitals</h2>
            <a href="#" className="text-sm font-semibold text-link">
              See All
            </a>
          </div>
          <div className="flex gap-1.5">
            <VitalStatCard
              label="Pulse"
              icon="heartRate"
              gradient="var(--gradient-metric-pulse)"
              data={PULSE_TREND}
              value="128"
              unit="bpm"
            />
            <VitalStatCard
              label="Temp"
              icon="temperature"
              gradient="var(--gradient-metric-temp)"
              data={TEMP_TREND}
              value="98.6"
              unit="°F"
            />
            <VitalStatCard
              label="Activity"
              icon="activity"
              gradient="var(--gradient-metric-activity)"
              statusWord="Healthy"
            />
          </div>
        </section>

        {/* 4. Instructions list (D-14 structural item 4) */}
        <section>
          <h2 className="mb-4 text-base font-bold text-text-strong">
            Instructions
          </h2>
          <div className="flex flex-col gap-3">
            {INSTRUCTIONS.map((instruction) => (
              <InstructionRow key={instruction.title} {...instruction} />
            ))}
          </div>
        </section>
      </main>

      {/*
        5. Bottom NavBar (D-14 structural item 5) — "Home" active per D-17.
        `currentRoute="/"` matches `NAV_TABS`'s own real href ("Home"), not
        this proof page's actual route — this page simulates the production
        Home screen (mock data throughout), so it renders NavBar exactly as
        it would when a real user is on the app's actual Home route.
      */}
      <NavBar currentRoute="/" />
    </div>
  );
}
