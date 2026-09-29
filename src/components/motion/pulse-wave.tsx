import { Icon, type IconName } from "@/components/icon";
import { cn } from "@/lib/utils";
import styles from "./pulse-wave.module.css";

export interface PulseWaveProps {
  emoji?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "safe" | "caution" | "critical" | "neutral";
  active?: boolean;
  className?: string;
}
const FACES = {
  safe: "moodSmileBeam",
  caution: "moodEmpty",
  critical: "moodSadSquint",
  neutral: "moodSleep",
} satisfies Record<NonNullable<PulseWaveProps["tone"]>, IconName>;

/** Decorative motion; always pair with a visible status label. */
export function PulseWave({ emoji = false, size = "md", tone = "safe", active = true, className }: PulseWaveProps) {
  return (
    <span aria-hidden="true" data-slot="pulse-wave" data-size={size} data-emoji={emoji} data-tone={tone} data-active={active && tone !== "neutral"} className={cn(styles.wave, className)}>
      <span className={styles.ring} />
      <span className={styles.ring} />
      {emoji ? <span className={styles.center}><Icon name={FACES[tone]} /></span> : <span data-slot="pulse-dot" className={styles.dot} />}
    </span>
  );
}
