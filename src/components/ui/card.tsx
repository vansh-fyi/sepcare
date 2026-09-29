import * as React from "react"
import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("rounded-card bg-surface shadow-card p-4", className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 mb-4 has-data-[slot=card-action]:grid-cols-[1fr_auto]", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-sm font-bold leading-tight text-text-strong", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-xs leading-normal text-text-subtle", className)}
      {...props}
    />
  )
}

// No confirmed Figma node in this plan's card family shows a rendered CardAction
// slot's own content (e.g. an icon/button in the header corner) — the grid
// placement below is the pre-existing compositional contract and is kept
// as-is; not Figma-verified in this pass, unlike Title/Description/Footer.
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  // Rule 1 bug fix (06-07 Task 1): the stock scaffold's own px-6 double-counted
  // against Card's own p-4 wrapper padding (Card already insets every child on
  // all sides — unlike stock shadcn's Card, which has no built-in horizontal
  // padding of its own). Dropped px-6/pt-6 -> pt-4 to match Card's real inset.
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center [.border-t]:pt-4", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
