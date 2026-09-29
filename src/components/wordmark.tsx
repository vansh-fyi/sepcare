import { cn } from "@/lib/utils";

/** Shared spelling and typography; larger size for clinical headers. */
export function Wordmark({ size = "default" }: { size?: "default" | "lg" }) {
  return (
    <span
      className={cn(
        "font-heading font-bold tracking-[-0.7px] whitespace-nowrap",
        size === "lg" ? "text-[21px]" : "text-[19px]",
      )}
    >
      SepCare
    </span>
  );
}
