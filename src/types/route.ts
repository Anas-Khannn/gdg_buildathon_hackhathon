export type CommuteMode = "bike" | "car" | "walk";

export interface SafeRouteLocation {
  name: string;
  nameUr?: string;
  namePs?: string;
  lat: number;
  lng: number;
}

export interface HazardOnRoute {
  id: string;
  type: string;
  severity: "ankle" | "knee" | "danger" | "fixed";
  lat: number;
  lng: number;
  distanceMeters: number;
  areaName?: string;
  complaintText?: string;
}

export interface RouteGeometry {
  coordinates: [number, number][]; // [lat, lng] pairs
  distanceKm: number;
  durationMinutes: number;
}

export interface SafeRouteResponse {
  success: boolean;
  start: SafeRouteLocation;
  end: SafeRouteLocation;
  mode: CommuteMode;
  directRoute: RouteGeometry & {
    hazards: HazardOnRoute[];
  };
  safeRoute: RouteGeometry & {
    avoidedHazardsCount: number;
    dangerHazardsCount: number;
  };
  aiAdvisory: {
    status: "safe" | "caution" | "critical";
    headlineEn: string;
    headlineUr: string;
    headlinePs: string;
    detailsEn: string;
    detailsUr: string;
    detailsPs: string;
  };
  radarHazards: {
    id: string;
    lat: number;
    lng: number;
    type: string;
    severity: string;
    distanceMeters?: number;
  }[];
}
