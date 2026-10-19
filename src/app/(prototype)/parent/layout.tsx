import { ClinicalScreen } from "@/components/patterns/clinical-screen";
import { DeviceHeader } from "@/components/patterns/device-header";

export default function ParentLayout({ children }: LayoutProps<"/parent">) {
  return <ClinicalScreen header={<DeviceHeader settingsHref="/parent/device" />}
    notice="Prototype · Static sample data · No live monitoring">{children}</ClinicalScreen>;
}
