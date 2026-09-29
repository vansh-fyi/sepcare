"use client";

import { useEffect, useState } from "react";
import { InfantStatusCard } from "@/components/patterns/status-summary-cards";
import { DeviceHeader } from "@/components/patterns/device-header";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NavBar } from "@/components/ui/nav-bar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import {
  VitalDetailCard,
  VITAL_DETAILS,
} from "@/components/patterns/vital-detail-card";
import {
  DeviceCard,
  StatusCard,
  VitalCard,
  InstructionCard,
  type ClinicalStatus,
} from "@/components/patterns/clinical-cards";
import { sampleVitalReadings } from "@/lib/examples/vital-readings";
import { clinicalScenario } from "@/lib/examples/clinical-scenarios";
import { cn } from "@/lib/utils";

const PULSE = [118, 122, 119, 124, 121, 130, 123, 125, 120, 126, 124, 128];
const TEMP = [98.2, 98.4, 98.3, 98.5, 98.6, 98.5, 98.7, 98.6];
const CRITICAL_PULSE = [140, 110, 85, 70, 62, 58, 55, 55.2];
const COPY = {
  safe: {
    title: "Baby is resting safely",
    description: "Based on the latest available readings.",
  },
  caution: {
    title: "Needs attention",
    description: "Review the readings and contact the care team.",
  },
  critical: {
    title: "Take baby to hospital",
    description: "Contact emergency care now.",
  },
};

export default function HomeExamplePage() {
  const [status, setStatus] = useState<ClinicalStatus>("safe");
  const [route, setRoute] = useState("/");
  const [hours, setHours] = useState("4");
  const [reminders, setReminders] = useState(true);
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    const receiveStatus = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent
      )
        return;
      if (
        event.data?.type !== "sepcare-preview-status" ||
        !["safe", "caution", "critical"].includes(event.data.status)
      )
        return;
      setStatus(event.data.status as ClinicalStatus);
      setFeedback("");
    };
    window.addEventListener("message", receiveStatus);
    if (window.parent !== window)
      window.parent.postMessage(
        { type: "sepcare-preview-ready" },
        window.location.origin,
      );
    return () => window.removeEventListener("message", receiveStatus);
  }, []);
  const scenario = clinicalScenario(status);
  const pulse = (status === "critical" ? CRITICAL_PULSE : PULSE).map(
    (value) => ({ value }),
  );
  const title =
    route === "/vitals"
      ? "Vitals"
      : route === "/stats"
        ? "Stats"
        : route === "/settings"
          ? "Settings"
          : "Infant status";
  function demoAction() {
    setFeedback("Example only. No call was placed.");
  }
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page-canvas">
      <div
        className={cn(
          "relative mx-auto flex w-full min-h-0 flex-1 flex-col overflow-hidden bg-page-canvas",
          status === "critical" && "bg-critical-soft",
        )}
      >
        <DeviceHeader
          deviceName="Device-SKU-1234"
          battery={scenario.battery}
          slowInternet={scenario.slowInternet}
          onReadings={() => setRoute("/stats")}
          onSettings={() => setRoute("/settings")}
        />
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <section>
              {route !== "/" && (
                <h2 className="mb-3 text-sm font-semibold text-text-strong">
                  {title}
                </h2>
              )}
              {route === "/" && (
                <InfantStatusCard
                  infant={{ status, ...COPY[status] }}
                  onCallAmbulance={demoAction}
                />
              )}
              {route === "/settings" && (
                <div className="grid gap-4">
                  <DeviceCard
                    name="Device-SKU-1234"
                    identifier="Device ID: SKU-1234"
                    battery={scenario.battery}
                  />
                  <Card>
                    <Field orientation="horizontal">
                      <div className="flex-1">
                        <FieldLabel htmlFor="home-reminders">
                          Care reminders
                        </FieldLabel>
                        <FieldDescription className="mt-1">
                          Reminders about your care routine.
                        </FieldDescription>
                      </div>
                      <Switch
                        id="home-reminders"
                        checked={reminders}
                        onCheckedChange={setReminders}
                      />
                    </Field>
                  </Card>
                </div>
              )}
            </section>
            {(route === "/stats" || route === "/vitals") && (
              <>
                <DeviceCard
                  name="Device-SKU-1234"
                  identifier="Device ID: SKU-1234"
                  battery={scenario.battery}
                />
                {route === "/vitals" && (
                  <section>
                    <h2 className="mb-3 text-sm font-semibold">
                      Infant Status
                    </h2>
                    <StatusCard
                      status={status}
                      {...COPY[status]}
                    />
                  </section>
                )}
                {route === "/stats" && (
                  <section className="flex flex-col items-center gap-3">
                    <h2 className="text-sm font-semibold">Select Time Scale</h2>
                    <ToggleGroup
                      type="single"
                      value={hours}
                      onValueChange={(value) => {
                        if (value) setHours(value);
                      }}
                      aria-label="Time scale"
                      size="sm"
                      fit="equal"
                    >
                      {["2", "4", "6", "8", "10", "12", "24"].map((value) => (
                        <ToggleGroupItem key={value} value={value}>
                          {value}H
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </section>
                )}
                <section>
                  <h2 className="mb-3 text-sm font-semibold">Vitals</h2>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {VITAL_DETAILS.map((metric, index) => (
                      <VitalDetailCard
                        key={metric.title}
                        {...metric}
                        status={scenario.vitalStates[index]}
                        description={scenario.descriptions[index]}
                        chart={
                          route === "/stats"
                            ? {
                                data: sampleVitalReadings(Number(hours)),
                                xKey: "time",
                                timeAxis: true,
                                series: [
                                  {
                                    key: "value",
                                    label: metric.title,
                                    color: `var(--color-${scenario.vitalStates[index]})`,
                                    domain: [94, 100],
                                    showDots: false,
                                  },
                                ],
                              }
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </section>
              </>
            )}
            {route === "/" && (
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Vitals</h2>
                  <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() => setRoute("/vitals")}
                  >
                    See all
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <VitalCard
                    metric="pulse"
                    value={status === "critical" ? "55.2" : "128"}
                    unit="bpm"
                    data={pulse}
                    status={scenario.vitalStates[1]}
                  />
                  <VitalCard
                    metric="temperature"
                    value={status === "critical" ? "96.5" : "98.6"}
                    unit="°F"
                    data={TEMP.map((value) => ({ value }))}
                    status={scenario.vitalStates[0]}
                  />
                  <VitalCard
                    metric="activity"
                    value={scenario.vitalStates[5] === "critical" ? "Alert" : "Healthy"}
                    status={scenario.vitalStates[5]}
                  />
                </div>
              </section>
            )}
            {route === "/" && (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-text-strong">
                  Instructions
                </h2>
                <div className="grid gap-3">
                  {status === "critical" ? (
                    <>
                      <InstructionCard
                        icon="phone"
                        title="Contact the care team"
                        description="Follow the emergency instructions from your care team."
                      />
                    </>
                  ) : status === "caution" ? (
                    <InstructionCard
                      icon="phone"
                      title="Review changes with the care team"
                      description="Check the highlighted vitals and contact your care team."
                    />
                  ) : (
                    <>
                      <InstructionCard
                        icon="bottleBaby"
                        title="Continue regular feeding"
                        description="Follow the feeding plan from your care team."
                      />
                      <InstructionCard
                        icon="baby"
                        title="Keep baby warm and covered"
                        description="Follow your care team's instructions."
                      />
                      <InstructionCard
                        icon="ankleBand"
                        title="Keep the ankle band on"
                        description="Check the fit using the device instructions."
                      />
                    </>
                  )}
                </div>
              </section>
            )}
          </div>
        </main>
        {feedback && (
          <p
            role="status"
            className="shrink-0 bg-surface px-4 py-2 text-xs text-text-secondary"
          >
            {feedback}
          </p>
        )}
        <NavBar
          className="shrink-0"
          currentRoute={route}
          position="static"
          onTabChange={setRoute}
        />
      </div>
    </div>
  );
}
