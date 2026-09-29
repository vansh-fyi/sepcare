"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
export default function EmptyLoadingPage() {
  const [progress, setProgress] = useState(35);
  return (
    <PageShell
      title="Empty and loading states"
      description="Keep the card's space available while content changes. An empty state explains what happens next; a known loading value shows progress."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="min-h-52">
          <CardHeader>
            <CardTitle className="text-base">No readings yet</CardTitle>
            <CardDescription>
              The device has not sent any readings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-text-secondary">
              Keep the band connected. Readings will appear here when they
              arrive.
            </p>
          </CardContent>
        </Card>
        <Card className="min-h-52">
          <CardHeader>
            <CardTitle className="text-base">
              {progress === 100 ? "Sync complete" : "Syncing device"}
            </CardTitle>
            <CardDescription>Uploading stored readings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} aria-label="Sync progress" />
            <p className="text-xs tabular-nums text-text-secondary">
              {progress}% complete
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="self-start"
              onClick={() =>
                setProgress((value) =>
                  value === 100 ? 0 : Math.min(100, value + 25),
                )
              }
            >
              {progress === 100 ? "Restart example" : "Advance example"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
