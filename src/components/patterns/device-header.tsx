import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";

export interface DeviceHeaderProps {
  onReadings?: () => void;
  readingsHref?: string;
  onSettings?: () => void;
  settingsHref?: string;
}

/** Shared app header: wordmark and navigation actions. */
export function DeviceHeader({ onReadings, onSettings, readingsHref, settingsHref }: DeviceHeaderProps) {
  const actionColors = {
    fill: "var(--color-device-header-action)",
    fillHover: "var(--color-device-header-action-hover)",
    fillActive: "var(--color-device-header-action-hover)",
    onFill: "var(--color-device-header-text)",
  };
  return (
    <header className="relative z-10 shrink-0 bg-device-header-surface px-6 py-5 text-device-header-text">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-3">
          <Wordmark size="lg" />
          <div className="flex gap-2">
            {(onReadings || readingsHref) && <Button
              colors={actionColors} radius="lg" aria-label="View readings"
              asChild={Boolean(readingsHref)} onClick={onReadings}
              icon={<Icon name="monitoring" size={22} />}
            >{readingsHref ? <Link href={readingsHref}><Icon name="monitoring" size={22} /></Link> : null}</Button>}
            {(onSettings || settingsHref) && <Button
              colors={actionColors} radius="lg" aria-label="Device settings"
              asChild={Boolean(settingsHref)} onClick={onSettings}
              icon={<Icon name="wearable" size={22} />}
            >{settingsHref ? <Link href={settingsHref}><Icon name="wearable" size={22} /></Link> : null}</Button>}
          </div>
        </div>
      </div>
    </header>
  );
}
