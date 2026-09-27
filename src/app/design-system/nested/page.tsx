import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/icon";
import { Input } from "@/components/ui/input";
import { NavLink } from "@/components/ui/nav-link";
import { PageShell } from "@/components/page-shell";

/**
 * D-10 sample page 3 (DSYS-02/DSYS-03) — completed. Nests an Input and two
 * Buttons inside a Card inside the page layout, proving Card/Input/Button
 * token classes all cascade correctly three layers deep on a real route.
 * Originally seeded by Plan 06-01's tracer (a single Button proving one
 * compiled token rendered through a real Radix-based shadcn Button); the
 * tracer's manual `bg-brand-fill text-white` override is replaced here by
 * the `primary` variant now that Button carries its own restyled contract
 * (Plan 06-03).
 *
 * The "Figma-verified Button archetypes" block below (06-06) is additive —
 * it does not touch the original Device Sync card — and exists so the
 * orchestrator has a real rendered instance of each new/reconciled Button
 * variant to screenshot-diff against Figma per the D-15 mechanism (see
 * button.DESIGN.md's "Figma extraction" section; this executor has no
 * browser/screenshot tool, so that comparison happens after this file lands).
 */
export default function NestedDesignSystemPage() {
  return (
    <PageShell
      title="Nested composition"
      description="Button and Input rendered inside Card inside the page layout — proving the token set cascades correctly three layers deep."
    >
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <h2 className="text-heading font-semibold text-text">
            Device Sync
          </h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="device-id"
              className="text-label font-semibold text-text"
            >
              Device ID
            </label>
            <Input id="device-id" placeholder="nb-001" />
          </div>
          <div className="flex gap-3">
            <Button variant="primary">Sync Now</Button>
            <Button variant="secondary">Cancel</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mx-auto mt-6 max-w-md">
        <CardHeader>
          <h2 className="text-heading font-semibold text-text">
            Figma-verified Button archetypes (06-06)
          </h2>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button variant="cta">
            <Icon name="signal" className="size-5" />
            Connect Device
          </Button>
          <Button variant="cta-critical">
            <Icon name="phone" className="size-5" />
            Call Ambulance
          </Button>
          <Button variant="icon-outline" aria-label="Back">
            <Icon name="back" className="size-6" />
          </Button>
          <Button variant="icon-filled" aria-label="Sort">
            <Icon name="sort" className="size-6" />
          </Button>
        </CardContent>
      </Card>

      <Card className="mx-auto mt-6 max-w-md">
        <CardHeader>
          <h2 className="text-heading font-semibold text-text">
            NavLink states (06-10)
          </h2>
        </CardHeader>
        <CardContent className="flex flex-wrap items-start gap-4 bg-bg p-4">
          <NavLink href="#" icon="home" label="Home" state="active" />
          <NavLink href="#" icon="monitoring" label="Vitals" state="inactive" />
        </CardContent>
      </Card>
    </PageShell>
  );
}
