import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageShell } from "@/components/page-shell";

/**
 * D-10 sample page 3 (DSYS-02/DSYS-03), rebuilt against the expanded D-12
 * component set (06-19). Nests an Input and two Buttons inside a Card inside
 * the page layout, proving Card/Input/Button token classes all cascade
 * correctly three layers deep on a real route. Originally seeded by Plan
 * 06-01's tracer (a single Button proving one compiled token rendered
 * through a real Radix-based shadcn Button); the tracer's manual
 * `bg-brand-fill text-white` override is replaced here by the `primary`
 * variant now that Button carries its own restyled contract (Plan 06-03).
 *
 * A second nested composition below proves the expanded form-field set
 * cascades correctly too — Card > CardContent > Field > Select nests four
 * layers deep, not just Card > CardContent > Input/Button.
 *
 * The temporary "Figma-verified Button archetypes" (06-06), "NavLink
 * states" (06-10), and fixed `NavBar` (06-10) blocks that were mounted here
 * for the orchestrator's deferred D-15 screenshot-diff pass have been
 * removed (06-19 consolidation) — those component families now have their
 * own dedicated docs-site routes (`/design-system/docs/button`,
 * `/design-system/docs/nav`) as the canonical live-preview destination, so
 * this page no longer needs to carry ad-hoc scaffolding for them.
 */
export default function NestedDesignSystemPage() {
  return (
    <PageShell
      title="Nested composition"
      description="Button, Input, and the expanded form-field set rendered inside Card inside the page layout — proving the token set cascades correctly three-plus layers deep."
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
            Device region (Field + Select, 06-19)
          </h2>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="device-region">Device region</FieldLabel>
            <Select>
              <SelectTrigger id="device-region" className="w-full">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-south">India — South</SelectItem>
                <SelectItem value="in-north">India — North</SelectItem>
                <SelectItem value="in-west">India — West</SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription>
              Used to route device-support requests only.
            </FieldDescription>
          </Field>
        </CardContent>
      </Card>
    </PageShell>
  );
}
