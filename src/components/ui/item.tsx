import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

import { Separator } from "@/components/ui/separator"

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn("group/item-group flex flex-col", className)}
      {...props}
    />
  )
}

function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn("my-0", className)}
      {...props}
    />
  )
}

/**
 * Restyled from the shadcn scaffold (06-07 Task 3) — every stock semantic
 * token (`bg-muted`, `bg-accent`, `border-ring`, `ring-ring`) that this
 * project's `@theme` block doesn't declare has been replaced with a real
 * project token. Focus-visible follows Input's existing convention
 * (`border-border-focus` + `shadow-focus` as a box-shadow, not a ring
 * utility) rather than inventing a second focus-ring mechanism.
 */
const itemVariants = cva(
  "group/item flex flex-wrap items-center rounded-md border border-transparent text-sm transition-colors duration-[var(--duration-fast)] outline-none focus-visible:border-border-focus focus-visible:shadow-focus [a]:transition-colors [a]:hover:bg-bg",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-border",
        muted: "bg-bg",
      },
      size: {
        default: "gap-4 p-4",
        sm: "gap-2.5 px-4 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Item({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      className={cn(itemVariants({ variant, size, className }))}
      {...props}
    />
  )
}

/**
 * `icon` variant sized 48px/`rounded-16` with a flat neutral fill, matching
 * the icon-tile pattern Figma node `266-9387` (Instruction Row Card, relayed
 * via `06-FIGMA-EXTRACTS.md`) shows for the Home screen's instruction rows —
 * same `--color-icon-tile-neutral` token `card.DESIGN.md` uses for the
 * equivalent tile inside the Instruction Row Card composition, kept
 * consistent across both primitives rather than re-deriving a second value.
 */
const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:translate-y-0.5 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "size-12 rounded-card-sm border border-border bg-icon-tile-neutral [&_svg:not([class*='size-'])]:size-5",
        image:
          "size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function ItemMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        "flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none",
        className
      )}
      {...props}
    />
  )
}

/**
 * 14px Bold, `--color-text-strong` (neutral-800) — Figma-verified against
 * node `266-9387`'s rendered instruction-row title ("Continue Regular
 * Feeding"), the same real value `card.DESIGN.md`'s `CardTitle` restyle
 * uses, kept identical since both primitives render the same instruction-row
 * content depending on which composition a later plan picks.
 */
function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        "flex w-fit items-center gap-2 text-sm leading-snug font-bold text-text-strong",
        className
      )}
      {...props}
    />
  )
}

/**
 * 12px Regular, `--color-text-subtle` (neutral-400) — Figma-verified against
 * the same node `266-9387` instruction-row subtitle. Uses the project's
 * `text-caption` token (0.75rem, identical computed size to Tailwind's
 * default `text-xs` but paired with the token's own declared line-height)
 * rather than the stock shadcn muted-foreground color role this project's
 * theme doesn't declare.
 */
function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        "line-clamp-2 text-caption leading-normal font-normal text-balance text-text-subtle",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-brand",
        className
      )}
      {...props}
    />
  )
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
    />
  )
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
    />
  )
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
}
