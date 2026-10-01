import { DeviceDetails } from "@/components/patterns/device-details";
import { DEVICE } from "@/lib/fixtures/device";

export default function CaregiverSettings({}: PageProps<"/caregiver/settings">) {
  return (
    <div className="flex flex-col gap-6">
      <DeviceDetails device={DEVICE} />
    </div>
  );
}
