import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-semibold outline-none focus-visible:shadow-focus transition-[color,background-color,box-shadow,filter,transform] duration-[var(--duration-fast)] ease-out active:translate-y-px disabled:opacity-50 disabled:pointer-events-none aria-disabled:pointer-events-none aria-disabled:opacity-50 cursor-pointer select-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[color:var(--button-fill)] text-[color:var(--button-on-fill)] hover:bg-[color:var(--button-fill-hover)] active:bg-[color:var(--button-fill-active)]",
        secondary:
          "border border-[color:var(--button-border)] bg-[color:var(--button-surface)] text-[color:var(--button-text)] hover:bg-[color:var(--button-surface-hover)]",
        tertiary:
          "bg-transparent text-[color:var(--button-text)] hover:bg-[color:var(--button-surface-hover)]",
      },
      size: {
        sm: "h-9 px-3.5 text-xs data-[icon-only=true]:w-9 data-[icon-only=true]:p-0",
        default:
          "h-11 px-5 text-sm data-[icon-only=true]:w-11 data-[icon-only=true]:p-0",
        lg: "h-12 px-6 text-base data-[icon-only=true]:w-12 data-[icon-only=true]:p-0",
      },
      radius: {
        sm: "rounded-cta",
        default: "rounded-btn",
        lg: "rounded-card-sm",
        full: "rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "default", radius: "default" },
  },
);
export type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;
export type ButtonSize = NonNullable<
  VariantProps<typeof buttonVariants>["size"]
>;
export type ButtonRadius = NonNullable<
  VariantProps<typeof buttonVariants>["radius"]
>;
export type ButtonTone = "brand" | "coral" | "critical" | "neutral";
export interface ButtonColors {
  fill?: string;
  fillHover?: string;
  fillActive?: string;
  onFill?: string;
  surface?: string;
  surfaceHover?: string;
  text?: string;
  border?: string;
}
const COLOR_ROLES = {
  fill: "fill",
  fillHover: "fill-hover",
  fillActive: "fill-active",
  onFill: "on-fill",
  surface: "surface",
  surfaceHover: "surface-hover",
  text: "text",
  border: "border",
} as const;
export interface ButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  tone?: ButtonTone;
  colors?: ButtonColors;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  asChild?: boolean;
  loading?: boolean;
}

function Button({
  className,
  variant = "primary",
  tone = "neutral",
  size = "default",
  radius = "default",
  colors,
  icon,
  iconPosition = "start",
  asChild = false,
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const hasText = React.Children.toArray(children).some((child) =>
    typeof child === "string" ? child.trim().length > 0 : true,
  );
  const iconOnly = Boolean(icon) && !hasText;
  const colorStyle = Object.fromEntries(
    Object.entries(COLOR_ROLES).map(([key, role]) => [
      `--button-${role}`,
      colors?.[key as keyof ButtonColors] ??
        `var(--color-button-${tone}-${role})`,
    ]),
  ) as React.CSSProperties;
  const sharedProps = {
    "data-slot": "button",
    "data-variant": variant,
    "data-tone": tone,
    "data-size": size,
    "data-icon-only": iconOnly || undefined,
    "aria-busy": loading || undefined,
    className: cn(buttonVariants({ variant, size, radius }), className),
    style: { ...colorStyle, ...style },
  };
  if (asChild) {
    return (
      <Slot.Root
        {...sharedProps}
        aria-disabled={disabled || loading || undefined}
        tabIndex={disabled || loading ? -1 : undefined}
        {...props}
      >
        {children}
      </Slot.Root>
    );
  }
  return (
    <button
      {...sharedProps}
      data-loading={loading || undefined}
      disabled={disabled || loading}
      {...props}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center gap-2",
          loading && "opacity-0",
        )}
      >
        {iconPosition === "start" && icon}
        {children}
        {iconPosition === "end" && icon}
      </span>
      {loading && (
        <span
          aria-hidden="true"
          className="absolute inline-flex size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin [animation-duration:var(--duration-slow)]"
        />
      )}
    </button>
  );
}
export { Button, buttonVariants };
