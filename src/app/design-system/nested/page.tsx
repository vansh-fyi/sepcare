import { Button } from "@/components/ui/button";

/**
 * Sample page 3's seed (D-02/D-10). Task 2's tracer proof that a single
 * compiled token (--color-brand-fill) renders through a real Radix-based
 * shadcn Button on a real App Router route. Fully built out into the
 * nested-composition sample page (Buttons/Inputs inside a Card inside a
 * page layout) by Plan 06-04.
 */
export default function NestedDesignSystemPage() {
  return (
    <div>
      <Button className="bg-brand-fill text-white">Sync Now</Button>
    </div>
  );
}
