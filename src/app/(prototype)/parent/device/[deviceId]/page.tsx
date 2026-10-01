import Link from "next/link";
import { DeviceDetails } from "@/components/patterns/device-details";
import { Button } from "@/components/ui/button";
import { DEVICE } from "@/lib/fixtures/device";

export default async function ParentDevice({ params }: PageProps<"/parent/device/[deviceId]">) {
  const { deviceId } = await params;
  if (deviceId !== DEVICE.id) {
    return (
      <div className="space-y-4">
        <p>Something went wrong loading this device&apos;s data. Try again.</p>
        <Button asChild><Link href="/parent/device">Try again</Link></Button>
      </div>
    );
  }
  return <DeviceDetails device={DEVICE} />;
}
