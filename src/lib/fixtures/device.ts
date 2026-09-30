import type { ClinicalStatus } from "@/components/patterns/clinical-cards";

export const DEVICE_ID = "nb-001";

export interface DeviceProfile {
  id: string;
  name: string;
  battery: number;
  connected: boolean;
  lastSyncedAt: number;
  sensorContact: ClinicalStatus;
}

/** Static sample captured at module load, not a live device or clock. Replace with device telemetry when wiring the backend. */
export const DEVICE: DeviceProfile = {
  id: DEVICE_ID,
  name: "SepCare Armband — NICU Bay 4",
  battery: 76,
  connected: true,
  lastSyncedAt: Date.now() - 30_000,
  sensorContact: "safe",
};
