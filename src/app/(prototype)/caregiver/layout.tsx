import { ClinicalScreen } from "@/components/patterns/clinical-screen";
import { CaregiverHeader, CaregiverNav } from "./_components/chrome";

export default function CaregiverLayout({ children }: LayoutProps<"/caregiver">) {
  return <ClinicalScreen header={<CaregiverHeader />} navigation={<CaregiverNav />}
    notice="Prototype · Static sample data · No live monitoring">{children}</ClinicalScreen>;
}
