import type { ClinicalStatus } from "@/components/patterns/clinical-cards";

export const RISK_STATUS_MAP = {
  green: "safe",
  amber: "caution",
  red: "critical",
} as const;

export function mapRiskStatus(status: keyof typeof RISK_STATUS_MAP): ClinicalStatus {
  return RISK_STATUS_MAP[status];
}

export const STATUS_LABEL: Record<ClinicalStatus, string> = {
  safe: "Safe",
  caution: "Caution",
  critical: "Critical",
};
