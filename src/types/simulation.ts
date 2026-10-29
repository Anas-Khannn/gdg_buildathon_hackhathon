export type FloodRiskLevel = "safe" | "minor" | "severe" | "catastrophic";

export interface CatchmentBasin {
  id: string;
  name: string;
  nameUr: string;
  namePs: string;
  description: string;
  center: [number, number]; // [lat, lng]
  polygonCoords: [number, number][]; // [lat, lng] polygon vertices
  elevationMeters: number;
  areaKm2: number;
  runoffCoefficient: number; // 0.0 - 1.0 (impervious surface factor)
  baseCapacityM3s: number; // Baseline clean drain discharge capacity in m3/sec
  criticalAssets: string[]; // Key hospitals, roads, markets, BRT stations
  flowDirectionDeg: number; // Hydrological natural gradient angle
}

export interface BasinSimulationResult {
  basin: CatchmentBasin;
  activeBlockagesCount: number;
  dangerHazardsCount: number;
  runoffVolumeM3s: number;
  runoffMillionLitersPerHour: number;
  dischargeCapacityM3s: number;
  effectiveCapacityM3s: number;
  capacityDeficitM3s: number;
  inundationDepthCm: number;
  inundationDepthInches: number;
  timeToPondingMinutes: number;
  riskLevel: FloodRiskLevel;
  isMitigated: boolean;
  waterAvertedLitersPerHour?: number;
}

export interface WSSPZoneDirective {
  zone: string;
  location: string;
  action: string;
  actionUr: string;
  actionPs: string;
  urgency: "immediate" | "high" | "medium";
  equipment: string;
  assetsProtected: string;
}

export interface SimulationAIAdvisory {
  summaryEn: string;
  summaryUr: string;
  summaryPs: string;
  wsspDirectives: WSSPZoneDirective[];
  citizenAdvisoryEn: string;
  citizenAdvisoryUr: string;
  citizenAdvisoryPs: string;
  mosqueBroadcastScriptUr: string;
  mosqueBroadcastScriptPs: string;
}

export interface SimulationResponse {
  success: boolean;
  timestamp: string;
  rainMmPerHour: number;
  scenarioName: string;
  isLiveWeather: boolean;
  totalRunoffMillionLiters: number;
  criticalBasinsCount: number;
  cityRiskIndex: number; // 0 - 100
  totalBlockedDrainsCount: number;
  mitigatedBasinsCount: number;
  basinResults: BasinSimulationResult[];
  aiAdvisory: SimulationAIAdvisory;
}

