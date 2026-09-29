"use client";
import { useState } from "react";
import {
  Button,
  type ButtonVariant,
  type ButtonSize,
  type ButtonTone,
  type ButtonRadius,
} from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { Preview } from "@/components/docs/documentation";

interface ExampleOptions {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  radius?: ButtonRadius;
  text?: boolean;
  icon?: boolean;
  iconPosition?: "start" | "end";
  loading?: boolean;
  disabled?: boolean;
}
function source({
  variant = "primary",
  tone = "neutral",
  size = "default",
  radius = "default",
  text = true,
  icon = false,
  iconPosition = "start",
  loading = false,
  disabled = false,
}: ExampleOptions) {
  const props = [`variant="${variant}"`];
  if (tone !== "neutral") props.push(`tone="${tone}"`);
  if (size !== "default") props.push(`size="${size}"`);
  if (radius !== "default") props.push(`radius="${radius}"`);
  if (icon) props.push('icon={<Icon name="signal" size={18} />}');
  if (icon && iconPosition !== "start") props.push('iconPosition="end"');
  if (!text) props.push('aria-label="Connect device"');
  if (loading) props.push("loading");
  if (disabled) props.push("disabled");
  return `<Button\n  ${props.join("\n  ")}${text ? "\n>\n  Connect device\n</Button>" : "\n/>"}`;
}
function ExampleButton({
  text = true,
  icon = false,
  ...options
}: ExampleOptions) {
  return (
    <Button
      {...options}
      icon={icon ? <Icon name="signal" size={18} /> : undefined}
      aria-label={!text ? "Connect device" : undefined}
    >
      {text ? "Connect device" : undefined}
    </Button>
  );
}
export function ButtonExample() {
  const [variant, setVariant] = useState<ButtonVariant>("primary");
  const [tone, setTone] = useState<ButtonTone>("neutral");
  const [size, setSize] = useState<ButtonSize>("default");
  const [radius, setRadius] = useState<ButtonRadius>("default");
  const [text, setText] = useState(true);
  const [icon, setIcon] = useState(false);
  const [iconPosition, setIconPosition] = useState<"start" | "end">("start");
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const options = {
    variant,
    tone,
    size,
    radius,
    text,
    icon,
    iconPosition,
    loading,
    disabled,
  };
  return (
    <Preview
      code={source(options)}
      controls={
        <>
          <label>
            Variant
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value as ButtonVariant)}
            >
              {["primary", "secondary", "tertiary"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Color
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as ButtonTone)}
            >
              {["brand", "coral", "critical", "neutral"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Size
            <select
              value={size}
              onChange={(e) => setSize(e.target.value as ButtonSize)}
            >
              {["sm", "default", "lg"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Corners
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value as ButtonRadius)}
            >
              {["sm", "default", "lg", "full"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={text}
              onChange={(e) => {
                setText(e.target.checked);
                if (!e.target.checked) setIcon(true);
              }}
            />
            Text
          </label>
          <label>
            <input
              type="checkbox"
              checked={icon}
              disabled={!text}
              onChange={(e) => setIcon(e.target.checked)}
            />
            Icon
          </label>
          {icon && text && (
            <label>
              Icon position
              <select
                value={iconPosition}
                onChange={(e) =>
                  setIconPosition(e.target.value as "start" | "end")
                }
              >
                <option value="start">Start</option>
                <option value="end">End</option>
              </select>
            </label>
          )}
          <label>
            <input
              type="checkbox"
              checked={loading}
              onChange={(e) => setLoading(e.target.checked)}
            />
            Loading
          </label>
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
      <ExampleButton {...options} />
    </Preview>
  );
}
export function ButtonVariations() {
  return (
    <div className="grid gap-8">
      {(["primary", "secondary", "tertiary"] as const).map((variant) => (
        <div className="docs-variant" key={variant}>
          <h3 className="capitalize">{variant}</h3>
          <Preview
            code={
              source({ variant, icon: true }) +
              "\n\n" +
              source({ variant, icon: true, text: false })
            }
          >
            <div className="docs-example-row">
              <ExampleButton variant={variant} icon />
              <ExampleButton variant={variant} icon text={false} />
            </div>
          </Preview>
          <p>
            {variant === "primary"
              ? "Filled, with optional text. Removing the text produces an icon-filled button."
              : variant === "secondary"
                ? "A surface with a border stroke, no shadow, and optional text. Removing the text produces the secondary icon button."
                : "A transparent surface for a low-emphasis action, with or without text."}
          </p>
        </div>
      ))}
      <div className="docs-variant">
        <h3>Change color, keep the variant</h3>
        <Preview
          code={
            '<Button tone="neutral" icon={<Icon name="signal" size={18} />}>Connect device</Button>\n<Button tone="critical" icon={<Icon name="phone" size={18} />}>Call ambulance</Button>'
          }
        >
          <div className="docs-example-row">
            <Button tone="neutral" icon={<Icon name="signal" size={18} />}>
              Connect device
            </Button>
            <Button tone="critical" icon={<Icon name="phone" size={18} />}>
              Call ambulance
            </Button>
          </div>
        </Preview>
      </div>
      <div className="docs-variant">
        <h3>Rounded secondary</h3>
        <Preview
          code={
            '<Button variant="secondary" tone="neutral" radius="full">Device list</Button>'
          }
        >
          <Button variant="secondary" tone="neutral" radius="full">
            Device list
          </Button>
        </Preview>
      </div>
      <div className="docs-variant">
        <h3>Supply semantic color tokens</h3>
        <p>
          Override the button’s color roles for a specific context. The base
          palette stays unchanged.
        </p>
        <Preview
          code={
            '<Button\n  colors={{\n    fill: "var(--color-safe)",\n    fillHover: "var(--color-safe-dark)",\n    fillActive: "var(--color-safe-dark)",\n    onFill: "var(--color-text-inverse)",\n  }}\n>\n  Confirm connection\n</Button>'
          }
        >
          <Button
            colors={{
              fill: "var(--color-safe)",
              fillHover: "var(--color-safe-dark)",
              fillActive: "var(--color-safe-dark)",
              onFill: "var(--color-text-inverse)",
            }}
          >
            Confirm connection
          </Button>
        </Preview>
      </div>
    </div>
  );
}
