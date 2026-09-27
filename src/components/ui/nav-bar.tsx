import * as React from "react"
import { cn } from "@/lib/utils"
import { NavLink } from "@/components/ui/nav-link"
import type { IconName } from "@/components/icon"

/**
 * NavBar — hand-authored fixed-bottom tab bar (no shadcn equivalent),
 * Figma-verified against node `279-320` (and its Home-screen instance
 * `279-758` inside `266-9257`, per nav-bar.DESIGN.md). Composes exactly 4
 * `NavLink` instances; exactly one is ever "active" at a time, driven by
 * `currentRoute` rather than hardcoded.
 *
 * Icon keys below cross-check the Figma tab set (Home/Vitals/Stats/
 * Settings) against the existing `icon.tsx` set — all 4 matched an
 * existing key, so no new icon.tsx entry or second icon-library import was
 * needed (see nav-bar.DESIGN.md's cross-check table).
 */
export interface NavBarTab {
  href: string
  label: string
  icon: IconName
}

const NAV_TABS: NavBarTab[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/vitals", label: "Vitals", icon: "monitoring" },
  { href: "/stats", label: "Stats", icon: "history" },
  { href: "/settings", label: "Settings", icon: "settings" },
]

interface NavBarProps extends Omit<React.ComponentProps<"nav">, "className"> {
  /** The app's current route (e.g. from `usePathname()`) — determines which single NavLink renders `state="active"`. */
  currentRoute: string
  className?: string
}

function NavBar({ currentRoute, className, ...props }: NavBarProps) {
  return (
    <nav
      data-slot="nav-bar"
      className={cn(
        "fixed inset-x-0 bottom-0 flex items-center gap-1 rounded-t-[var(--radius-nav-bar)] bg-surface px-9 py-4 shadow-nav-bar",
        className
      )}
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1rem)" }}
      {...props}
    >
      {NAV_TABS.map((tab) => (
        <NavLink
          key={tab.href}
          href={tab.href}
          icon={tab.icon}
          label={tab.label}
          state={currentRoute === tab.href ? "active" : "inactive"}
        />
      ))}
    </nav>
  )
}

export { NavBar, NAV_TABS }
