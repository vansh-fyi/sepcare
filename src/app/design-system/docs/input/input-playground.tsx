"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Client island for Input's live error toggle (06-16 Task 1). The
 * surrounding `page.tsx` stays a Server Component so it can read
 * globals.css's live token values via `node:fs`.
 */
export function InputPlayground() {
  const [error, setError] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        variant="secondary"
        className="w-fit"
        onClick={() => setError((value) => !value)}
      >
        {error ? "Clear" : "Show"} error state
      </Button>
      <div className="w-full max-w-sm rounded-card-sm border border-border-subtle bg-bg p-8">
        <Input placeholder="Device ID" error={error} />
      </div>
    </div>
  );
}
