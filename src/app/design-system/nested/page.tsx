import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/**
 * D-10 sample page 3 (DSYS-02/DSYS-03) — completed. Nests an Input and two
 * Buttons inside a Card inside the page layout, proving Card/Input/Button
 * token classes all cascade correctly three layers deep on a real route.
 * Originally seeded by Plan 06-01's tracer (a single Button proving one
 * compiled token rendered through a real Radix-based shadcn Button); the
 * tracer's manual `bg-brand-fill text-white` override is replaced here by
 * the `primary` variant now that Button carries its own restyled contract
 * (Plan 06-03).
 */
export default function NestedDesignSystemPage() {
  return (
    <div className="p-8">
      <Card className="max-w-md">
        <CardHeader>
          <h2 className="text-heading font-semibold text-text">
            Device Sync
          </h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
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
    </div>
  );
}
