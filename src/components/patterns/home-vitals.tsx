import { VitalCard, type VitalCardProps } from "./clinical-cards";

type MetricSummary = Omit<VitalCardProps, "metric" | "className" | "trendHeight">;

export interface HomeVitalsProps {
  pulse: MetricSummary;
  temperature: MetricSummary;
  activity: MetricSummary;
}

/** Featured pulse trend beside two stacked metric summaries. */
export function HomeVitals({ pulse, temperature, activity }: HomeVitalsProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] grid-rows-2 gap-3 md:grid-cols-3 md:grid-rows-1">
      <VitalCard {...pulse} metric="pulse" trendHeight={88} className="row-span-2 md:row-span-1" />
      <VitalCard {...temperature} metric="temperature" />
      <VitalCard {...activity} metric="activity" />
    </div>
  );
}
