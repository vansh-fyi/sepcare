"use client";

import { useEffect, useState } from "react";
import { DeviceHeader } from "@/components/patterns/device-header";
import { DeviceDetails } from "@/components/patterns/device-details";
import { ClinicalScreen, ClinicalMetricGrid } from "@/components/patterns/clinical-screen";
import { HomeOverview } from "@/components/patterns/home-overview";
import { TrendTimeScale } from "@/components/patterns/trend-time-scale";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/ui/nav-bar";
import { VitalDetailCard, VITAL_DETAILS } from "@/components/patterns/vital-detail-card";
import type { ClinicalStatus } from "@/components/patterns/clinical-cards";
import { sampleVitalReadings } from "@/lib/examples/vital-readings";
import { clinicalScenario } from "@/lib/examples/clinical-scenarios";
import { DEVICE } from "@/lib/fixtures/device";

const PULSE = [118, 122, 119, 124, 121, 130, 123, 125, 120, 126, 124, 128];
const CRITICAL_PULSE = [140, 110, 85, 70, 62, 58, 55, 55.2];

export default function HomeExamplePage() {
  const [status, setStatus] = useState<ClinicalStatus>("safe");
  const [route, setRoute] = useState("/");
  const [hours, setHours] = useState("4");
  useEffect(() => {
    const receiveStatus = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (event.data?.type !== "sepcare-preview-status" || !["safe", "caution", "critical"].includes(event.data.status)) return;
      setStatus(event.data.status as ClinicalStatus);
    };
    window.addEventListener("message", receiveStatus);
    if (window.parent !== window) window.parent.postMessage({ type: "sepcare-preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", receiveStatus);
  }, []);
  const scenario = clinicalScenario(status);
  const pulse = (status === "critical" ? CRITICAL_PULSE : PULSE).map(value => ({ value }));
  return <ClinicalScreen
    header={<DeviceHeader onReadings={() => setRoute("/stats")} onSettings={() => setRoute("/settings")} />}
    navigation={<NavBar className="shrink-0" currentRoute={route} position="static" onTabChange={setRoute} />}
  >
    {route === "/" && <HomeOverview status={status}
      seeAll={<Button variant="tertiary" size="sm" onClick={() => setRoute("/vitals")}>See all</Button>}
      vitals={{
        pulse: { value: status === "critical" ? "55.2" : "128", unit: "bpm", data: pulse, status: scenario.vitalStates[1] },
        temperature: { value: status === "critical" ? "96.5" : "98.6", unit: "°F", status: scenario.vitalStates[0] },
        activity: { value: scenario.vitalStates[5] === "critical" ? "Alert" : "Healthy", status: scenario.vitalStates[5] },
      }} />}
    {route === "/settings" && <DeviceDetails device={{ ...DEVICE, battery: scenario.battery, sensorContact: status }} />}
    {(route === "/stats" || route === "/vitals") && <>
      {route === "/stats" && <TrendTimeScale value={hours} onValueChange={setHours} />}
      <section aria-label={route === "/stats" ? "Vital trends" : "Vitals"}>
        <ClinicalMetricGrid>
          {VITAL_DETAILS.map((metric, index) => <VitalDetailCard key={metric.title} {...metric}
            status={scenario.vitalStates[index]} description={scenario.descriptions[index]}
            chart={route === "/stats" ? {
              data: sampleVitalReadings(Number(hours)), xKey: "time", timeAxis: true,
              series: [{ key: "value", label: metric.title, color: `var(--color-${scenario.vitalStates[index]})`, domain: [94, 100], showDots: false }],
            } : undefined} />)}
        </ClinicalMetricGrid>
      </section>
    </>}
  </ClinicalScreen>;
}
