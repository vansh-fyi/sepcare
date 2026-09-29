"use client";
import { Button } from "@/components/ui/button";
export default function DocumentationError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-12">
      <h1 className="font-heading text-heading-page font-bold">
        This page could not load
      </h1>
      <p className="mb-6 mt-3 text-sm text-text-secondary">
        Try loading the documentation again.
      </p>
      <Button variant="secondary" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
