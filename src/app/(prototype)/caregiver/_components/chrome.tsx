"use client";

import { usePathname, useRouter } from "next/navigation";
import { DeviceHeader } from "@/components/patterns/device-header";
import { NavBar, type NavBarTab } from "@/components/ui/nav-bar";

const TABS: NavBarTab[] = [
  { href: "/caregiver", label: "Home", icon: "home" },
  { href: "/caregiver/vitals", label: "Vitals", icon: "heart" },
  { href: "/caregiver/stats", label: "Stats", icon: "monitoring" },
  { href: "/caregiver/settings", label: "Settings", icon: "settings" },
];

export function CaregiverNav() {
  return <NavBar tabs={TABS} currentRoute={usePathname()} position="static" className="shrink-0" />;
}

export function CaregiverHeader() {
  const router = useRouter();
  return <DeviceHeader onReadings={() => router.push("/caregiver/stats")} onSettings={() => router.push("/caregiver/settings")} />;
}
