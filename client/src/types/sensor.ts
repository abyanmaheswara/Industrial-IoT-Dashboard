export type SensorType = "temperature" | "pressure" | "vibration" | "power" | "humidity";
export type SensorStatus = "normal" | "warning" | "critical";

export interface SensorData {
  id: string;
  name: string;
  type: SensorType;
  value: number;
  unit: string;
  timestamp: number;
  status: SensorStatus;
  // AI Metrics
  health?: number;
  isAnomaly?: boolean;
  zScore?: string;
}
