"use client";

import { useState } from "react";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/icon";

/**
 * Client island for Button's live variant/loading picker (06-16 Task 1).
 * The surrounding `page.tsx` stays a Server Component so it can read
 * globals.css's live token values via `node:fs` — this file only holds the
 * interactive state (a real `Select`, not a plain HTML `<select>`, per the
 * plan's own instruction). No entrance animation plays on mount
 * (emil-animations principle 8) — only the picker's own hover/press color
 * transition, already baked into `Select`/`Button`.
 */
const VARIANT_OPTIONS: Array<{
  value: ButtonVariant;
  label: string;
  iconOnly?: boolean;
}> = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "tertiary", label: "Tertiary" },
  { value: "critical", label: "Critical" },
  { value: "cta", label: "CTA" },
  { value: "cta-critical", label: "CTA Critical" },
  { value: "icon-outline", label: "Icon Outline", iconOnly: true },
  { value: "icon-filled", label: "Icon Filled", iconOnly: true },
];

function previewContent(variant: ButtonVariant) {
  switch (variant) {
    case "cta":
      return (
        <>
          <Icon name="signal" className="size-5" />
          Connect Device
        </>
      );
    case "cta-critical":
      return (
        <>
          <Icon name="phone" className="size-5" />
          Call Ambulance
        </>
      );
    case "critical":
      return "Call Clinician";
    case "tertiary":
      return "View Details →";
    default:
      return "Sync Now";
  }
}

export function ButtonPlayground() {
  const [variant, setVariant] = useState<ButtonVariant>("primary");
  const [loading, setLoading] = useState(false);
  const selected = VARIANT_OPTIONS.find((option) => option.value === variant)!;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <Field className="w-48">
          <FieldLabel htmlFor="button-variant-picker">Variant</FieldLabel>
          <Select
            value={variant}
            onValueChange={(value) => setVariant(value as ButtonVariant)}
          >
            <SelectTrigger id="button-variant-picker">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VARIANT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setLoading((value) => !value)}
        >
          {loading ? "Disable" : "Enable"} loading state
        </Button>
      </div>

      <div className="flex w-full items-center justify-center rounded-card-sm border border-border-subtle bg-bg p-8">
        {selected.iconOnly ? (
          <Button
            variant={variant}
            loading={loading}
            aria-label="Connect device"
          >
            <Icon name="signal" className="size-6" />
          </Button>
        ) : (
          <Button variant={variant} loading={loading}>
            {previewContent(variant)}
          </Button>
        )}
      </div>
    </div>
  );
}
