import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/icon";

const navLinkVariants = cva(
  "group inline-flex min-h-11 min-w-0 flex-1 flex-col items-stretch rounded-cta outline-none focus-visible:shadow-focus",
  {
    variants: { state: { active: "", inactive: "" } },
    defaultVariants: { state: "inactive" },
  },
);
export type NavLinkState = NonNullable<
  VariantProps<typeof navLinkVariants>["state"]
>;
interface NavLinkProps extends Omit<
  React.ComponentProps<typeof Link>,
  "className"
> {
  icon: IconName;
  label: string;
  state: NavLinkState;
  className?: string;
}
export function NavLink({
  icon,
  label,
  state,
  className,
  ...props
}: NavLinkProps) {
  const active = state === "active";
  return (
    <Link
      data-slot="nav-link"
      data-state={state}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(navLinkVariants({ state }), className)}
      {...props}
    >
      <span
        className={cn(
          "inline-flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-cta px-1 transition-[background-color,box-shadow] duration-[var(--duration-fast)]",
          active
            ? "bg-nav-active text-text-inverse"
            : "bg-surface text-text-muted shadow-control group-hover:bg-bg group-hover:text-text-secondary",
        )}
      >
        <Icon name={icon} size={20} />
        <span className="max-w-full truncate text-caption font-semibold">
          {label}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "mt-1 h-[5px] rounded-full",
          active ? "bg-nav-indicator" : "bg-bg",
        )}
      />
    </Link>
  );
}
export { navLinkVariants };
