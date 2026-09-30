import { DEVICE } from "@/lib/fixtures/device";
import { CaregiverHeader, CaregiverNav } from "./_components/chrome";

export default function CaregiverLayout({ children }: LayoutProps<"/caregiver">) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page-canvas">
      <CaregiverHeader deviceName={DEVICE.name} battery={DEVICE.battery} connected={DEVICE.connected} />
      <p className="shrink-0 px-4 py-2 text-center text-xs text-text-secondary">Prototype · Static sample data · No live monitoring</p>
      <main className="min-h-0 flex-1 overflow-y-auto pb-[calc(7rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-6xl p-4 md:p-6">{children}</div>
      </main>
      <CaregiverNav />
    </div>
  );
}
