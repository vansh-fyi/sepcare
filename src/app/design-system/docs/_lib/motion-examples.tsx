"use client";

import { useState } from "react";
import { Preview } from "@/components/docs/documentation";
import { PulseWave, type PulseWaveProps } from "@/components/motion/pulse-wave";
import { StatusCard } from "@/components/patterns/clinical-cards";
import { DeviceHeader } from "@/components/patterns/device-header";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function MotionExample() {
  const [emoji, setEmoji] = useState(true);
  const [size, setSize] = useState<NonNullable<PulseWaveProps["size"]>>("md");
  const [tone, setTone] = useState<NonNullable<PulseWaveProps["tone"]>>("safe");
  const [active, setActive] = useState(true);
  const code = `import { PulseWave } from "@/components/motion/pulse-wave";\n\n<PulseWave emoji={${emoji}} size="${size}" tone="${tone}" active={${active}} />`;

  return (
    <Preview
      code={code}
      caption="Decorative status motion, not a measured heartbeat. Reduced motion always takes precedence."
      controls={
        <>
          <ToggleGroup
            type="single"
            value={emoji ? "emoji" : "no-emoji"}
            size="sm"
            aria-label="Show emoji"
            onValueChange={(v) => {
              if (v) setEmoji(v === "emoji");
            }}
          >
            <ToggleGroupItem value="emoji">Emoji</ToggleGroupItem>
            <ToggleGroupItem value="no-emoji">No emoji</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="single" value={size} size="sm" aria-label="Wave size" onValueChange={(v) => { if (v) setSize(v as typeof size); }}>
            <ToggleGroupItem value="sm">SM</ToggleGroupItem><ToggleGroupItem value="md">MD</ToggleGroupItem><ToggleGroupItem value="lg">LG</ToggleGroupItem><ToggleGroupItem value="xl">XL</ToggleGroupItem>
          </ToggleGroup>
          <label>
            Tone{" "}
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as typeof tone)}
            >
              {["safe", "caution", "critical", "neutral"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <ToggleGroup
            type="single"
            value={active ? "playing" : "still"}
            size="sm"
            aria-label="Motion playback"
            onValueChange={(v) => {
              if (v) setActive(v === "playing");
            }}
          >
            <ToggleGroupItem value="playing">Playing</ToggleGroupItem>
            <ToggleGroupItem value="still">Still</ToggleGroupItem>
          </ToggleGroup>
        </>
      }
    >
      <div className="flex min-h-36 items-center justify-center gap-4">
        <PulseWave emoji={emoji} size={size} tone={tone} active={active} />
        <span className="text-sm text-text-secondary">
          {!active || tone === "neutral" ? "Still" : tone === "safe" ? "Slow · 6 seconds" : tone === "caution" ? "Brisk · 2.5 seconds" : "Fast · 1.2 seconds"}
        </span>
      </div>
    </Preview>
  );
}

export function MotionVariations() {
  const [destination, setDestination] = useState("");
  return (
    <div className="grid gap-6">
      <Preview
        tone="canvas"
        caption="Sample health status. The face stays still and has no filled circle behind it."
        code={
          'import { StatusCard } from "@/components/patterns/clinical-cards";\n\n<StatusCard status="safe" title="Baby is resting safely" description="Based on the latest available readings." />'
        }
      >
        <div className="w-full max-w-md">
          <StatusCard
            status="safe"
            title="Baby is resting safely"
            description="Based on the latest available readings."
          />
        </div>
      </Preview>
      <Preview
        code={
          'import { useState } from "react";\nimport { DeviceHeader } from "@/components/patterns/device-header";\n\nconst [destination, setDestination] = useState("");\n\n<DeviceHeader deviceName="Device-SKU-1234" battery={90} connected onReadings={() => setDestination("Stats")} onSettings={() => setDestination("Settings")} />'
        }
        caption="Sample device. Header actions update this demonstration only."
      >
        <div className="w-full max-w-md">
          <DeviceHeader
            deviceName="Device-SKU-1234"
            battery={90}
            onReadings={() => setDestination("Stats")}
            onSettings={() => setDestination("Settings")}
          />
          {destination && (
            <p role="status" className="mt-3 text-sm">
              Selected: {destination}
            </p>
          )}
        </div>
      </Preview>
    </div>
  );
}
