import * as React from "react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/ui/nav-link";
import type { IconName } from "@/components/icon";
export interface NavBarTab {
  href: string;
  label: string;
  icon: IconName;
}
export const NAV_TABS: NavBarTab[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/vitals", label: "Vitals", icon: "heart" },
  { href: "/stats", label: "Stats", icon: "monitoring" },
  { href: "/settings", label: "Settings", icon: "settings" },
];
interface NavBarProps extends React.ComponentProps<"nav"> {
  currentRoute: string;
  tabs?: NavBarTab[];
  position?: "fixed" | "static";
  onTabChange?: (href: string) => void;
}
export function NavBar({
  currentRoute,
  tabs = NAV_TABS,
  position = "fixed",
  onTabChange,
  className,
  style,
  ...props
}: NavBarProps) {
  return (
    <nav
      data-slot="nav-bar"
      aria-label="Main navigation"
      className={cn(
        "flex items-center gap-2 rounded-t-[var(--radius-nav-bar)] bg-surface px-6 py-4 shadow-nav-bar",
        position === "fixed" && "fixed inset-x-0 bottom-0 z-30",
        className,
      )}
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom), 1rem)",
        ...style,
      }}
      {...props}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.href}
          {...tab}
          state={currentRoute === tab.href ? "active" : "inactive"}
          onClick={
            onTabChange
              ? (event) => {
                  event.preventDefault();
                  onTabChange(tab.href);
                }
              : undefined
          }
        />
      ))}
    </nav>
  );
}
