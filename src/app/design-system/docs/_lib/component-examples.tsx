"use client";

import { VitalDetailCard } from "@/components/patterns/vital-detail-card";
import { ConnectionStatusExample } from "./connection-status-example";
import { DeviceHistoryExample } from "./device-history-examples";
import { sampleVitalReadings } from "@/lib/examples/vital-readings";
import { StatusSummaryExample, StatusSummaryVariations } from "./status-summary-examples";
import { MotionExample, MotionVariations } from "./motion-examples";
import { useState } from "react";
import { Preview } from "@/components/docs/documentation";
import { Button } from "@/components/ui/button";
import { ButtonExample, ButtonVariations } from "./button-examples";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { BatteryIndicator } from "@/components/ui/battery-indicator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { NavBar } from "@/components/ui/nav-bar";
import { NavLink } from "@/components/ui/nav-link";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "@/components/ui/item";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Sparkline } from "@/components/ui/sparkline";
import { VitalsTrendChart } from "@/components/ui/vitals-trend-chart";
import {
  DeviceCard,
  StatusCard,
  VitalCard,
  InstructionCard,
} from "@/components/patterns/clinical-cards";
import type { ComponentName } from "./component-content";

export const SAMPLE_TREND = [
  118, 122, 119, 124, 121, 130, 123, 125, 120, 126, 124, 128,
].map((value) => ({ value }));
const SERIES = [
  { key: "perfusion", label: "Perfusion index", color: "var(--color-safe)" },
];
export function CardExample() {
  const [pattern, setPattern] = useState("device");
  const [deviceState, setDeviceState] = useState("healthy");
  const battery =
    deviceState === "medium" ? 50 : deviceState === "low" ? 10 : 90;
  const connected = deviceState !== "disconnected";
  const code = {
    device: `<DeviceCard\n  name="Device-SKU-1234"\n  identifier="Device ID: SKU-1234"\n  battery={${battery}}\n  connected={${connected}}\n/>`,
    status:
      '<StatusCard\n  status="safe"\n  title="Baby is resting safely"\n  description="Based on the latest available readings."\n/>',
    vitals:
      '<VitalCard\n  metric="pulse"\n  value="128"\n  unit="bpm"\n  data={readings}\n/>',
    instruction:
      '<InstructionCard\n  icon="ankleBand"\n  title="Check the band"\n  description="Follow the fitting instructions supplied with the device."\n/>',
  }[pattern]!;
  return (
    <Preview
      tone="canvas"
      code={
        'import { DeviceCard, StatusCard, VitalCard, InstructionCard } from "@/components/patterns/clinical-cards"\n\n' +
        code
      }
      caption="Sample device and readings."
      controls={
        <>
          <label>
            Pattern
            <select
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
            >
              <option value="device">Device</option>
              <option value="status">Status</option>
              <option value="vitals">Vital</option>
              <option value="instruction">Instruction</option>
            </select>
          </label>
          {pattern === "device" && (
            <label>
              Device state
              <select
                value={deviceState}
                onChange={(e) => setDeviceState(e.target.value)}
              >
                <option value="healthy">Healthy · 90%</option>
                <option value="medium">Medium · 50%</option>
                <option value="low">Low · 10%</option>
                <option value="disconnected">Disconnected · last 90%</option>
              </select>
            </label>
          )}
        </>
      }
    >
      <div className="docs-example-stack">
        {pattern === "device" && (
          <DeviceCard
            name="Device-SKU-1234"
            identifier="Device ID: SKU-1234"
            battery={battery}
            connected={connected}
          />
        )}
        {pattern === "status" && (
          <StatusCard
            status="safe"
            title="Baby is resting safely"
            description="Based on the latest available readings."
          />
        )}
        {pattern === "vitals" && (
          <div className="mx-auto w-40">
            <VitalCard
              metric="pulse"
              value="128"
              unit="bpm"
              data={SAMPLE_TREND}
            />
          </div>
        )}
        {pattern === "instruction" && (
          <InstructionCard
            icon="ankleBand"
            title="Check the band"
            description="Follow the fitting instructions supplied with the device."
          />
        )}
      </div>
    </Preview>
  );
}

function TextFieldExample({
  kind,
}: {
  kind: "input" | "field" | "label" | "textarea";
}) {
  const [invalid, setInvalid] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const id = `example-${kind}`;
  const isTextarea = kind === "textarea";
  const label = isTextarea
    ? "Care notes"
    : kind === "label"
      ? "Caregiver name"
      : "Device ID";
  const placeholder = isTextarea
    ? "Add an observation…"
    : kind === "label"
      ? "Enter a name"
      : "e.g. SKU-1234";
  const control = isTextarea
    ? `<Textarea id="${id}" rows={4}`
    : `<Input id="${id}"`;
  const code =
    kind === "label"
      ? `<div className="grid gap-2">\n  <Label htmlFor="${id}">${label}</Label>\n  <Input id="${id}" placeholder="${placeholder}"${disabled ? " disabled" : ""} />\n</div>`
      : `<Field${invalid ? " data-invalid" : ""}>\n  <FieldLabel htmlFor="${id}">${label}</FieldLabel>\n  ${control} placeholder="${placeholder}"\n    aria-describedby="${id}-help"${invalid ? " aria-invalid" : ""}${disabled ? " disabled" : ""} />\n  <${invalid ? "FieldError" : "FieldDescription"} id="${id}-help">\n    ${invalid ? "Enter a value before continuing." : isTextarea ? "Record an observation for the care team." : "Find this on the back of the band."}\n  </${invalid ? "FieldError" : "FieldDescription"}>\n</Field>`;
  return (
    <Preview
      code={code}
      controls={
        <>
          {kind !== "label" && (
            <label>
              <input
                type="checkbox"
                checked={invalid}
                onChange={(e) => setInvalid(e.target.checked)}
              />
              Error
            </label>
          )}
          <label>
            <input
              type="checkbox"
              checked={disabled}
              onChange={(e) => setDisabled(e.target.checked)}
            />
            Disabled
          </label>
        </>
      }
    >
      <div className="docs-example-stack">
        {kind === "label" ? (
          <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} placeholder={placeholder} disabled={disabled} />
          </div>
        ) : (
          <Field data-invalid={invalid || undefined}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {isTextarea ? (
              <Textarea
                id={id}
                rows={4}
                placeholder={placeholder}
                disabled={disabled}
                aria-invalid={invalid || undefined}
                aria-describedby={`${id}-help`}
              />
            ) : (
              <Input
                id={id}
                placeholder={placeholder}
                disabled={disabled}
                aria-invalid={invalid || undefined}
                aria-describedby={`${id}-help`}
              />
            )}
            {invalid ? (
              <FieldError id={`${id}-help`}>
                Enter a value before continuing.
              </FieldError>
            ) : (
              <FieldDescription id={`${id}-help`}>
                {isTextarea
                  ? "Record an observation for the care team."
                  : "Find this on the back of the band."}
              </FieldDescription>
            )}
          </Field>
        )}
      </div>
    </Preview>
  );
}

function SelectExample() {
  const [role, setRole] = useState("parent");
  return (
    <Preview
      code={`<Select defaultValue="${role}">\n  <SelectTrigger aria-label="Caregiver role">\n    <SelectValue />\n  </SelectTrigger>\n  <SelectContent>\n    <SelectItem value="parent">Parent</SelectItem>\n    <SelectItem value="asha">ASHA worker</SelectItem>\n    <SelectItem value="clinician">Clinician</SelectItem>\n  </SelectContent>\n</Select>`}
    >
      <div className="docs-example-stack">
        <Field>
          <FieldLabel htmlFor="example-role">Caregiver role</FieldLabel>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="example-role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="parent">Parent</SelectItem>
              <SelectItem value="asha">ASHA worker</SelectItem>
              <SelectItem value="clinician">Clinician</SelectItem>
            </SelectContent>
          </Select>
          <FieldDescription>
            Choose the view that fits your role.
          </FieldDescription>
        </Field>
      </div>
    </Preview>
  );
}

function SelectionExample({
  kind,
}: {
  kind: "checkbox" | "switch" | "radio-group";
}) {
  const [checked, setChecked] = useState(true);
  const [role, setRole] = useState("parent");
  const [disabled, setDisabled] = useState(false);
  const source =
    kind === "radio-group"
      ? `<RadioGroup defaultValue="${role}" aria-label="Caregiver role"${disabled ? " disabled" : ""}>\n  ${["parent", "asha", "clinician"].map((value) => `<Field orientation="horizontal">\n    <RadioGroupItem id="role-${value}" value="${value}" />\n    <FieldLabel htmlFor="role-${value}">${value === "asha" ? "ASHA worker" : value === "parent" ? "Parent" : "Clinician"}</FieldLabel>\n  </Field>`).join("\n  ")}\n</RadioGroup>`
      : `<Field orientation="horizontal">\n  <${kind === "checkbox" ? "Checkbox" : "Switch"} id="reminders"${checked ? " defaultChecked" : ""}${disabled ? " disabled" : ""} />\n  <FieldLabel htmlFor="reminders">Care reminders</FieldLabel>\n</Field>`;
  return (
    <Preview
      code={source}
      controls={
        <label>
          <input
            type="checkbox"
            checked={disabled}
            onChange={(e) => setDisabled(e.target.checked)}
          />
          Disabled
        </label>
      }
    >
      <div className="docs-example-stack">
        {kind === "radio-group" ? (
          <RadioGroup
            value={role}
            onValueChange={setRole}
            disabled={disabled}
            aria-label="Caregiver role"
          >
            {["parent", "asha", "clinician"].map((value) => (
              <Field orientation="horizontal" key={value}>
                <RadioGroupItem id={`example-role-${value}`} value={value} />
                <FieldLabel htmlFor={`example-role-${value}`}>
                  {value === "asha"
                    ? "ASHA worker"
                    : value === "parent"
                      ? "Parent"
                      : "Clinician"}
                </FieldLabel>
              </Field>
            ))}
          </RadioGroup>
        ) : (
          <Field orientation="horizontal">
            {kind === "checkbox" ? (
              <Checkbox
                id="example-reminders-checkbox"
                checked={checked}
                onCheckedChange={(value) => setChecked(value === true)}
                disabled={disabled}
              />
            ) : (
              <Switch
                id="example-reminders-switch"
                checked={checked}
                onCheckedChange={setChecked}
                disabled={disabled}
              />
            )}
            <div className="grid gap-1">
              <FieldLabel htmlFor={`example-reminders-${kind}`}>
                Care reminders
              </FieldLabel>
              <FieldDescription>
                Receive reminders about your care routine.
              </FieldDescription>
            </div>
          </Field>
        )}
      </div>
    </Preview>
  );
}

function ProgressExample() {
  const [level, setLevel] = useState(72);
  const [charging, setCharging] = useState(false);
  return (
    <Preview
      code={`<Progress value={${level}} aria-label="Sync progress" />\n<BatteryIndicator level={${level}}${charging ? " charging" : ""} />`}
      controls={
        <>
          <label>
            Level{" "}
            <input
              type="range"
              min="0"
              max="100"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
            />
            <output>{level}%</output>
          </label>
          <label>
            <input
              type="checkbox"
              checked={charging}
              onChange={(e) => setCharging(e.target.checked)}
            />
            Charging
          </label>
        </>
      }
    >
      <div className="docs-example-stack">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Sync progress</span>
          <span className="tabular-nums">{level}%</span>
        </div>
        <Progress value={level} aria-label="Sync progress" />
        <div className="mt-4 flex items-center justify-between text-xs text-text-secondary">
          <span>Battery</span>
          <BatteryIndicator level={level} charging={charging} />
        </div>
      </div>
    </Preview>
  );
}

function ToggleExample() {
  const [range, setRange] = useState("day");
  return (
    <Preview
      code={`<ToggleGroup type="single" defaultValue="${range}" aria-label="Time range">\n  <ToggleGroupItem value="hour">Hour</ToggleGroupItem>\n  <ToggleGroupItem value="day">Day</ToggleGroupItem>\n  <ToggleGroupItem value="week">Week</ToggleGroupItem>\n  <ToggleGroupItem value="month">Month</ToggleGroupItem>\n</ToggleGroup>`}
    >
      <ToggleGroup
        type="single"
        value={range}
        onValueChange={(value) => {
          if (value) setRange(value);
        }}
        aria-label="Time range"
      >
        {["hour", "day", "week", "month"].map((value) => (
          <ToggleGroupItem key={value} value={value}>
            {value[0].toUpperCase() + value.slice(1)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Preview>
  );
}

function NavExample() {
  const [route, setRoute] = useState("/");
  return (
    <Preview
      tone="canvas"
      code={`<NavBar currentRoute="${route}" position="static" />`}
    >
      <div className="w-full max-w-[390px] overflow-x-auto">
        <NavBar
          className="min-w-[300px]"
          currentRoute={route}
          position="static"
          onTabChange={setRoute}
        />
      </div>
    </Preview>
  );
}

function ChartExample({ small = false }: { small?: boolean }) {
  const [empty, setEmpty] = useState(false);
  const [summary, setSummary] = useState(false);
  const [status, setStatus] = useState<"safe" | "caution" | "critical" | "unavailable">("safe");
  return (
    <Preview
      tone="canvas"
      code={
        small
          ? `<VitalCard metric="pulse" value="128" unit="bpm" data={${empty ? "[]" : "readings"}} />`
          : status === "unavailable" ? `<VitalDetailCard title="Cardiac Autonomic" icon="pulse" description="Not yet available — awaiting device support." status="unavailable" />`
          : summary ? `<VitalDetailCard title="Thermoregulation" icon="temperature" description="Latest temperature reading." status="${status}" value="${empty ? "—" : "36.8"}" unit="°C" />`
          : `<VitalDetailCard
  title="Thermoregulation"
  icon="temperature"
  description="${status === "safe" ? "Readings are stable." : "Review the highlighted changes."}"
  status="${status}"
  chart={{ data: ${empty ? "[]" : "readings"}, xKey: "time", timeAxis: true, series: [{ key: "value", label: "Thermoregulation", color: "var(--color-safe)", domain: [94, 100], showDots: false }] }}
/>`
      }
      caption="Sample readings for the component preview."
      controls={
        <>
          <label>
            <input
              type="checkbox"
              checked={empty}
              onChange={(e) => setEmpty(e.target.checked)}
            />
            Empty data
          </label>
          {!small && (
            <label>
              <input type="checkbox" checked={summary} onChange={event => setSummary(event.target.checked)} />
              Summary only
            </label>
          )}
          {!small && (
            <label>
              Status{" "}
              <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
                <option value="safe">Safe</option>
                <option value="caution">Caution</option>
                <option value="critical">Critical</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </label>
          )}
        </>
      }
    >
      {small ? (
        <div className="w-44">
          <VitalCard
            metric="pulse"
            value="128"
            unit="bpm"
            data={empty ? [] : SAMPLE_TREND}
          />
        </div>
      ) : (
        <div className="w-full min-w-0">
          <VitalDetailCard
            status={status}
            title={status === "unavailable" ? "Cardiac Autonomic" : "Thermoregulation"}
            icon={status === "unavailable" ? "pulse" : "temperature"}
            description={summary ? "Latest temperature reading." : status === "safe" ? "Readings are stable." : "Review the highlighted changes."}
            value={summary ? empty ? "—" : "36.8" : undefined}
            unit={summary ? "°C" : undefined}
            chart={status === "unavailable" || summary ? undefined : {
              data: empty ? [] : sampleVitalReadings(4),
              xKey: "time",
              timeAxis: true,
              series: [
                {
                  key: "value",
                  label: "Thermoregulation",
                  color: "var(--color-safe)",
                  domain: [94, 100],
                  showDots: false,
                },
              ],
            }}
          />
        </div>
      )}
    </Preview>
  );
}

function ItemExample() {
  return (
    <Preview
      tone="canvas"
      code={
        '<InstructionCard\n  icon="ankleBand"\n  title="Check the band"\n  description="Follow the fitting instructions supplied with the device."\n/>\n<InstructionCard\n  icon="connected"\n  title="Keep the device connected"\n  description="Check the connection indicator before reviewing readings."\n/>'
      }
    >
      <div className="docs-example-stack">
        <InstructionCard
          icon="ankleBand"
          title="Check the band"
          description="Follow the fitting instructions supplied with the device."
        />
        <InstructionCard
          icon="connected"
          title="Keep the device connected"
          description="Check the connection indicator before reviewing readings."
        />
      </div>
    </Preview>
  );
}

export function ComponentExample({ name }: { name: ComponentName }) {
  if (name === "connection-status") return <ConnectionStatusExample />;
  if (name === "risk-timeline" || name === "device-select-list" || name === "device-details") return <DeviceHistoryExample name={name} />;
  switch (name) {
    case "status-summary":
      return <StatusSummaryExample />;
    case "motion":
      return <MotionExample />;
    case "button":
      return <ButtonExample />;
    case "card":
      return <CardExample />;
    case "input":
    case "field":
    case "label":
    case "textarea":
      return <TextFieldExample kind={name} />;
    case "select":
      return <SelectExample />;
    case "checkbox":
    case "switch":
    case "radio-group":
      return <SelectionExample kind={name} />;
    case "progress":
      return <ProgressExample />;
    case "toggle-group":
      return <ToggleExample />;
    case "nav":
      return <NavExample />;
    case "chart":
      return <ChartExample />;
    case "sparkline":
      return <ChartExample small />;
    case "item":
      return <ItemExample />;
    case "badge":
      return (
        <Preview
          code={
            '<Badge status="safe">Connected</Badge>\n<Badge status="caution">Needs attention</Badge>\n<Badge status="critical">Critical</Badge>'
          }
        >
          <div className="docs-example-row">
            <Badge status="safe">Connected</Badge>
            <Badge status="caution">Needs attention</Badge>
            <Badge status="critical">Critical</Badge>
          </div>
        </Preview>
      );
  }
}

export function ComponentVariations({ name }: { name: ComponentName }) {
  if (name === "risk-timeline") return <p>Use Empty history in the preview to inspect the no-records state. Status rows retain the supplied order.</p>;
  if (name === "device-select-list") return <p>Use No devices to inspect the empty state. A populated list shows only the devices supplied by its caller.</p>;
  if (name === "device-details") return <p>Toggle Connected to compare the neutral connection action and last-known battery presentation. Sensor contact remains independent.</p>;
  if (name === "connection-status") return <p>Choose Live, Stale, or Reconnecting in the preview. Without an override, freshness follows the supplied timestamp.</p>;
  if (name === "status-summary") return <StatusSummaryVariations />;
  if (name === "motion") return <MotionVariations />;
  if (name === "button") return <ButtonVariations />;
  if (name === "card")
    return (
      <Preview
        tone="canvas"
        code={
          '<Card>\n  <CardHeader>\n    <CardTitle>Device connection</CardTitle>\n    <CardDescription>Pair a band to receive readings.</CardDescription>\n  </CardHeader>\n  <CardContent><p>Keep the band nearby during setup.</p></CardContent>\n  <CardFooter><Button variant="primary" tone="neutral">Connect device</Button></CardFooter>\n</Card>'
        }
      >
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Device connection</CardTitle>
            <CardDescription>Pair a band to receive readings.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">
              Keep the band nearby during setup.
            </p>
          </CardContent>
          <CardFooter className="mt-6">
            <Button variant="primary" tone="neutral">
              Connect device
            </Button>
          </CardFooter>
        </Card>
      </Preview>
    );
  if (name === "badge")
    return (
      <Preview
        code={
          '<Badge status="neutral">Sample data</Badge>\n<Badge status="brand">New device</Badge>'
        }
      >
        <div className="docs-example-row">
          <Badge status="neutral">Sample data</Badge>
          <Badge status="brand">New device</Badge>
        </div>
      </Preview>
    );
  if (name === "nav")
    return (
      <Preview
        code={
          '<NavLink href="/vitals" icon="monitoring" label="Vitals" state="active" />\n<NavLink href="/settings" icon="settings" label="Settings" state="inactive" />'
        }
      >
        <div className="docs-example-row">
          <NavLink
            href="#examples"
            icon="monitoring"
            label="Vitals"
            state="active"
          />
          <NavLink
            href="#examples"
            icon="settings"
            label="Settings"
            state="inactive"
          />
        </div>
      </Preview>
    );
  if (name === "item")
    return (
      <Preview
        code={
          '<Item variant="outline">\n  <ItemContent>\n    <ItemTitle>Care reminders</ItemTitle>\n    <ItemDescription>Receive reminders about your care routine.</ItemDescription>\n  </ItemContent>\n  <ItemActions><Switch aria-label="Care reminders" defaultChecked /></ItemActions>\n</Item>'
        }
      >
        <Item variant="outline" className="w-full max-w-sm flex-nowrap">
          <ItemContent>
            <ItemTitle>Care reminders</ItemTitle>
            <ItemDescription>
              Receive reminders about your care routine.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Switch aria-label="Care reminders" defaultChecked />
          </ItemActions>
        </Item>
      </Preview>
    );
  if (name === "sparkline")
    return (
      <Preview
        code={
          '<div className="w-64">\n  <p>Recent pulse readings</p>\n  <Sparkline data={readings} height={48} />\n</div>'
        }
      >
        <div className="w-64">
          <p className="mb-4 text-sm">Recent pulse readings</p>
          <Sparkline data={SAMPLE_TREND} height={48} />
        </div>
      </Preview>
    );
  if (name === "chart")
    return (
      <Preview
        code={'<VitalsTrendChart data={[]} xKey="time" series={series} />'}
      >
        <VitalsTrendChart data={[]} xKey="time" series={SERIES} />
      </Preview>
    );
  if (name === "progress")
    return (
      <Preview
        tone="canvas"
        code={
          '<DeviceCard name="Device-SKU-1234" identifier="Device ID: SKU-1234" battery={90} />'
        }
      >
        <div className="docs-example-stack">
          <DeviceCard
            name="Device-SKU-1234"
            identifier="Device ID: SKU-1234"
            battery={90}
          />
        </div>
      </Preview>
    );
  if (name === "toggle-group")
    return (
      <Preview
        code={
          '<ToggleGroup type="multiple" variant="outline" aria-label="Visible readings">\n  <ToggleGroupItem value="pulse">Pulse</ToggleGroupItem>\n  <ToggleGroupItem value="temp">Temp</ToggleGroupItem>\n</ToggleGroup>'
        }
      >
        <ToggleGroup
          type="multiple"
          variant="outline"
          aria-label="Visible readings"
        >
          <ToggleGroupItem value="pulse">Pulse</ToggleGroupItem>
          <ToggleGroupItem value="temp">Temp</ToggleGroupItem>
        </ToggleGroup>
      </Preview>
    );
  if (name === "input")
    return (
      <Preview
        code={
          '<Input aria-label="Device ID" defaultValue="SKU-1234" disabled />'
        }
      >
        <div className="docs-example-stack">
          <Input aria-label="Device ID" defaultValue="SKU-1234" disabled />
        </div>
      </Preview>
    );
  if (name === "label")
    return (
      <Preview
        code={
          '<Field orientation="horizontal">\n  <Switch id="label-reminders" defaultChecked />\n  <Label htmlFor="label-reminders">Care reminders</Label>\n</Field>'
        }
      >
        <Field orientation="horizontal" className="w-auto">
          <Switch id="label-reminders" defaultChecked />
          <Label htmlFor="label-reminders">Care reminders</Label>
        </Field>
      </Preview>
    );
  if (name === "textarea")
    return (
      <Preview
        code={
          '<Field>\n  <FieldLabel htmlFor="observation">Observation</FieldLabel>\n  <Textarea id="observation" rows={4} maxLength={500} aria-describedby="observation-help" />\n  <FieldDescription id="observation-help">Up to 500 characters.</FieldDescription>\n</Field>'
        }
      >
        <div className="docs-example-stack">
          <Field>
            <FieldLabel htmlFor="observation">Observation</FieldLabel>
            <Textarea
              id="observation"
              rows={4}
              maxLength={500}
              aria-describedby="observation-help"
            />
            <FieldDescription id="observation-help">
              Up to 500 characters.
            </FieldDescription>
          </Field>
        </div>
      </Preview>
    );
  if (name === "checkbox")
    return (
      <Preview
        code={
          '<Field orientation="horizontal">\n  <Checkbox id="partial-selection" checked="indeterminate" />\n  <FieldLabel htmlFor="partial-selection">Some readings selected</FieldLabel>\n</Field>'
        }
      >
        <Field orientation="horizontal" className="w-auto">
          <Checkbox id="partial-selection" checked="indeterminate" />
          <FieldLabel htmlFor="partial-selection">
            Some readings selected
          </FieldLabel>
        </Field>
      </Preview>
    );
  if (name === "switch")
    return (
      <Preview
        code={
          '<Field orientation="horizontal">\n  <Switch id="small-switch" size="sm" defaultChecked />\n  <FieldLabel htmlFor="small-switch">Care reminders</FieldLabel>\n</Field>'
        }
      >
        <Field orientation="horizontal" className="w-auto">
          <Switch id="small-switch" size="sm" defaultChecked />
          <FieldLabel htmlFor="small-switch">Care reminders</FieldLabel>
        </Field>
      </Preview>
    );
  if (name === "select")
    return (
      <Preview
        code={
          '<Select disabled>\n  <SelectTrigger aria-label="Device" className="w-full">\n    <SelectValue placeholder="No devices available" />\n  </SelectTrigger>\n</Select>'
        }
      >
        <div className="docs-example-stack">
          <Select disabled>
            <SelectTrigger aria-label="Device" className="w-full">
              <SelectValue placeholder="No devices available" />
            </SelectTrigger>
          </Select>
        </div>
      </Preview>
    );
  if (name === "radio-group")
    return (
      <Preview
        code={
          '<RadioGroup defaultValue="day" orientation="horizontal" aria-label="Report range" className="flex gap-6">\n  <Field orientation="horizontal">\n    <RadioGroupItem id="range-day" value="day" />\n    <FieldLabel htmlFor="range-day">Day</FieldLabel>\n  </Field>\n  <Field orientation="horizontal">\n    <RadioGroupItem id="range-week" value="week" />\n    <FieldLabel htmlFor="range-week">Week</FieldLabel>\n  </Field>\n</RadioGroup>'
        }
      >
        <RadioGroup
          defaultValue="day"
          orientation="horizontal"
          aria-label="Report range"
          className="flex gap-6"
        >
          <Field orientation="horizontal">
            <RadioGroupItem id="range-day" value="day" />
            <FieldLabel htmlFor="range-day">Day</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem id="range-week" value="week" />
            <FieldLabel htmlFor="range-week">Week</FieldLabel>
          </Field>
        </RadioGroup>
      </Preview>
    );
  return <FormCompositionExample />;
}

function FormCompositionExample() {
  const [saved, setSaved] = useState(false);
  return (
    <Preview
      code={
        '<form onSubmit={handleSubmit}>\n  <Field>\n    <FieldLabel htmlFor="caregiver-name">Caregiver name</FieldLabel>\n    <Input id="caregiver-name" name="caregiver" required />\n  </Field>\n  <Button type="submit">Save caregiver</Button>\n</form>'
      }
    >
      <form
        className="docs-example-stack"
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <Field>
          <FieldLabel htmlFor="caregiver-name">Caregiver name</FieldLabel>
          <Input
            id="caregiver-name"
            name="caregiver"
            placeholder="Enter a name"
            required
            onChange={() => setSaved(false)}
          />
        </Field>
        <Button type="submit" className="justify-self-start">
          Save caregiver
        </Button>
        <p role="status" className="min-h-5 text-xs text-safe-dark">
          {saved ? "Saved for this example. No data was sent." : ""}
        </p>
      </form>
    </Preview>
  );
}
