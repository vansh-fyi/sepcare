import { ExampleBrowser } from "@/components/docs/example-browser";

export default function ExamplePage() {
  return (
    <ExampleBrowser
      title="Clinical dashboard"
      description="Explore Home, Vitals, Stats, and Settings with sample readings."
      source="/design-system/home-proof"
      clinical
    />
  );
}
