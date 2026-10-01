import { DeviceSelectList } from "@/components/patterns/device-select-list";
import { DEVICE } from "@/lib/fixtures/device";

export default function ParentDevices({}: PageProps<"/parent/device">) {
  return (
    <section className="space-y-4" aria-labelledby="select-device">
      <h1 id="select-device" className="font-heading text-xl font-bold">Select Device</h1>
      <DeviceSelectList devices={[DEVICE]} hrefFor={(device) => `/parent/device/${device.id}`} />
    </section>
  );
}
