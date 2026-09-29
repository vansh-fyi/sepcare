"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Toggle as TogglePrimitive } from "radix-ui";

const toggleVariants = cva(
  "relative inline-flex items-center justify-center gap-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-[color,background-color,box-shadow] duration-[var(--duration-fast)] ease-out outline-none focus-visible:shadow-focus cursor-pointer disabled:pointer-events-none disabled:opacity-50 select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "text-toggle-text hover:text-text data-[state=off]:hover:bg-toggle-hover data-[state=on]:bg-toggle-active data-[state=on]:text-toggle-active-text",
        outline:
          "border border-border bg-transparent data-[state=off]:hover:bg-toggle-hover data-[state=on]:bg-toggle-active data-[state=on]:text-text-inverse data-[state=on]:border-transparent",
        brand:
          "text-text-secondary hover:text-text data-[state=off]:hover:bg-toggle-hover data-[state=on]:bg-brand-fill data-[state=on]:text-text-inverse",
      },
      size: {
        default: "h-8 px-3.5",
        sm: "h-7 px-2.5 text-xs",
        lg: "h-9 px-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
