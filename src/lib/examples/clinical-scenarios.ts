import type { ClinicalStatus } from "@/components/patterns/clinical-cards";

/** Deliberate preview fixtures, not a clinical classification algorithm. */
export function clinicalScenario(status: ClinicalStatus) {
  const vitalStates: ClinicalStatus[] = status === "safe"
    ? Array(6).fill("safe")
    : status === "critical"
      ? Array(6).fill("critical")
      : ["caution", "caution", "safe", "safe", "safe", "critical"];
  return {
    battery: status === "safe" ? 90 : status === "caution" ? 40 : 15,
    slowInternet: status === "caution",
    vitalStates,
    descriptions: vitalStates.map((tone) => ({
      safe: "Readings are stable.",
      caution: "Changes detected. Review this vital.",
      critical: "Significant changes detected. Contact the care team.",
    })[tone]),
  };
}
