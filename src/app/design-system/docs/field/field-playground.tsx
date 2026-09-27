"use client";

import { useState } from "react";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Client island for Field's live error-state toggle (06-16 Task 2) — Field
 * is the canonical label+control+help+error composition every other new
 * form field's docs page (Select/Textarea/Checkbox/RadioGroup/Switch) links
 * to instead of re-explaining. The surrounding `page.tsx` stays a Server
 * Component so it can read globals.css's live token values via `node:fs`.
 */
export function FieldPlayground() {
  const [showError, setShowError] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        variant="secondary"
        className="w-fit"
        onClick={() => setShowError((value) => !value)}
      >
        {showError ? "Clear" : "Show"} error state
      </Button>
      <Field data-invalid={showError} className="max-w-sm">
        <FieldLabel htmlFor="field-demo-device-id">Device ID</FieldLabel>
        <Input
          id="field-demo-device-id"
          placeholder="e.g. nb-001"
          aria-invalid={showError}
        />
        {showError ? (
          <FieldError>Enter a valid device ID.</FieldError>
        ) : (
          <FieldDescription>
            The armband&rsquo;s paired device identifier.
          </FieldDescription>
        )}
      </Field>
    </div>
  );
}
