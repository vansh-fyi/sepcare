"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
export default function FormExamplePage() {
  const [saved, setSaved] = useState(false);
  return (
    <PageShell
      title="Device setup form"
      description="A complete form built from Card, Field, Input, Select, and Button. This example keeps its values in the browser."
    >
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Set up a device</CardTitle>
          <CardDescription>
            Add the identifier printed on the band.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-6"
            onSubmit={(event) => {
              event.preventDefault();
              setSaved(true);
            }}
            onChange={() => setSaved(false)}
          >
            <Field>
              <FieldLabel htmlFor="device-id">Device ID</FieldLabel>
              <Input
                id="device-id"
                name="device"
                placeholder="e.g. SKU-1234"
                required
                aria-describedby="device-help"
              />
              <FieldDescription id="device-help">
                Find this on the back of the band.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="device-region">Support region</FieldLabel>
              <Select name="region" defaultValue="south">
                <SelectTrigger id="device-region" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="south">South India</SelectItem>
                  <SelectItem value="north">North India</SelectItem>
                  <SelectItem value="west">West India</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="flex gap-3">
              <Button type="submit" variant="primary" tone="neutral">
                Save device
              </Button>
              <Button
                type="reset"
                variant="secondary"
                onClick={() => setSaved(false)}
              >
                Reset
              </Button>
            </div>
            <p role="status" className="min-h-5 text-xs text-safe-dark">
              {saved ? "Saved for this example. No data was sent." : ""}
            </p>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  );
}
