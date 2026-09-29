"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";

import { toggleVariants } from "@/components/ui/toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
});

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 1,
  style,
  fit = "content",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    fit?: "content" | "equal";
  }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-fit={fit}
      data-spacing={spacing}
      className={cn(
        "group/toggle-group inline-flex items-center rounded-input bg-toggle-surface p-1",
        fit === "equal" &&
          "w-full [&>[data-slot=toggle-group-item]]:min-w-0 [&>[data-slot=toggle-group-item]]:flex-1 [&>[data-slot=toggle-group-item]]:px-1",
        className,
      )}
      style={{ gap: `${spacing * 0.25}rem`, ...style }}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
