import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { ContentTileRow } from "./content-tile-row";
import { DEVICE_STATE, getDeviceState } from "@/lib/device-state";

/** Shared device tile states for cards and the clinical header. */
export function DeviceTileRow({
  connected = true,
  battery,
  children,
  className,
}: {
  connected?: boolean;
  battery?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <ContentTileRow
      className={className}
      tileClassName={DEVICE_STATE[getDeviceState(connected, battery)].tile}
      tile={<Icon name="wearable" />}
    >
      {children}
    </ContentTileRow>
  );
}
