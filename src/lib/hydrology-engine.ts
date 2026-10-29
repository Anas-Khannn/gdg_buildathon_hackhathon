import type {
  CatchmentBasin,
  BasinSimulationResult,
  FloodRiskLevel,
} from "@/types/simulation";

// 8 Verified Historical & Hydrological Catchments of Urban Peshawar
export const PESHAWAR_CATCHMENTS: CatchmentBasin[] = [
  {
    id: "shahi_katha",
    name: "Shahi Katha & Historic Walled City Core",
    nameUr: "شاہی کٹھہ و تاریخی فصیل دار شہر",
    namePs: "د شاهي کټه او تاریخي ښار زړه",
    description:
      "Mughal-era covered central drain canal draining Kohati Gate, Hashtnagri, Chowk Yadgar and historic bazaars. Extreme risk of commercial waterlogging when choked.",
    center: [34.0145, 71.574],
    polygonCoords: [
      [34.008, 71.562],
      [34.022, 71.564],
      [34.024, 71.584],
      [34.015, 71.589],
      [34.007, 71.579],
      [34.008, 71.562],
    ],
    elevationMeters: 315,
    areaKm2: 4.8,
    runoffCoefficient: 0.88, // Very dense roofs, asphalt bazaars
    baseCapacityM3s: 18.5,
    flowDirectionDeg: 65, // Northeast towards Budni
    criticalAssets: [
      "Kohati Wholesale Cloth Market",
      "Hashtnagri Main Bazar",
      "Chowk Yadgar Pedestrian Plaza",
      "Lady Reading Hospital (LRH) South Gate",
    ],
  },
  {
    id: "budni_nullah",
    name: "Budni Nullah & Charsadda Road Basin",
    nameUr: "بڈھنی نالہ و چارسدہ روڈ طاس",
    namePs: "د بډھنۍ خوړ او چارسدې سړک حوضه",
    description:
      "Natural stormwater receiving basin taking Khyber hill torrents down to Kabul River. Primary flood chokepoint of Northern Peshawar.",
    center: [34.045, 71.565],
    polygonCoords: [
      [34.028, 71.545],
      [34.058, 71.548],
      [34.065, 71.585],
      [34.038, 71.595],
      [34.028, 71.545],
    ],
    elevationMeters: 310,
    areaKm2: 9.2,
    runoffCoefficient: 0.72,
    baseCapacityM3s: 34.0,
    flowDirectionDeg: 45,
    criticalAssets: [
      "Charsadda Road Culvert Bridge",
      "Dalazak Residential Sector",
      "Peshawar Northern Bypass Interchanges",
      "Budni Storm Outfall Works",
    ],
  },
  {
    id: "gulbahar_gt",
    name: "Gulbahar & GT Road Corridor",
    nameUr: "گلبہار و جی ٹی روڈ راہداری",
    namePs: "د ګلبہار او جی ټي روډ دهلیز",
    description:
      "Low-lying commercial strip with major Pakistan Railways underpasses prone to sudden deep ponding and traffic paralyses.",
    center: [34.016, 71.598],
    polygonCoords: [
      [34.006, 71.582],
      [34.025, 71.588],
      [34.028, 71.615],
      [34.012, 71.618],
      [34.005, 71.595],
      [34.006, 71.582],
    ],
    elevationMeters: 318,
    areaKm2: 5.4,
    runoffCoefficient: 0.84,
    baseCapacityM3s: 19.0,
    flowDirectionDeg: 70,
    criticalAssets: [
      "Gulbahar Railway Underpass",
      "Nishtarabad Electronics Hub",
      "Peshawar City Bus Terminal",
      "Gulbahar Government College",
    ],
  },
  {
    id: "university_brt",
    name: "University Road & BRT Transit Spine",
    nameUr: "یونیورسٹی روڈ و بی آر ٹی کوریڈور",
    namePs: "د پوهنتون سړک او بی آر ټي دهلیز",
    description:
      "Vital commercial artery connecting Saddar to Hayatabad. Sunken BRT tracks and underpasses act as natural runoff collectors during cloudbursts.",
    center: [33.998, 71.492],
    polygonCoords: [
      [33.988, 71.468],
      [34.012, 71.475],
      [34.015, 71.522],
      [33.995, 71.528],
      [33.986, 71.485],
      [33.988, 71.468],
    ],
    elevationMeters: 338,
    areaKm2: 7.6,
    runoffCoefficient: 0.89, // Heavily asphalted & concrete
    baseCapacityM3s: 24.5,
    flowDirectionDeg: 80,
    criticalAssets: [
      "Aman Chowk BRT Underpass",
      "University of Peshawar Main Access",
      "Khyber Teaching Hospital (KTH) Front",
      "Tehkal Payan Storm Inflow",
    ],
  },
  {
    id: "saddar_cantonment",
    name: "Saddar Bazar & Cantonment Drainage",
    nameUr: "صدر بازار و کینٹ نکاسی آب",
    namePs: "د صدر بازار او کینټ د اوبو ایستلو سیستم",
    description:
      "Historic British-era brick culvert network. Commercial shopping zones flood when roadside gutters fill with discarded polythene bags.",
    center: [34.007, 71.542],
    polygonCoords: [
      [33.998, 71.525],
      [34.018, 71.528],
      [34.022, 71.558],
      [34.002, 71.562],
      [33.995, 71.538],
      [33.998, 71.525],
    ],
    elevationMeters: 332,
    areaKm2: 5.1,
    runoffCoefficient: 0.82,
    baseCapacityM3s: 21.0,
    flowDirectionDeg: 75,
    criticalAssets: [
      "Saddar Road Commercial Spine",
      "Gora Bazar Culvert Junction",
      "Peshawar Railway Station Yard",
      "State Life Building Underpass",
    ],
  },
  {
    id: "hayatabad_industrial",
    name: "Hayatabad Township & Industrial Estate",
    nameUr: "حیات آباد ٹاؤن شپ و صنعتی زون",
    namePs: "د حیات اباد ښارګوټی او صنعتي سیمه",
    description:
      "High elevation headwaters of Peshawar. Steep gradient generates rapid torrential velocity flowing eastwards toward University Town and Shahi Katha.",
    center: [33.985, 71.438],
    polygonCoords: [
      [33.965, 71.415],
      [34.005, 71.418],
      [34.015, 71.465],
      [33.975, 71.468],
      [33.965, 71.415],
    ],
    elevationMeters: 365,
    areaKm2: 12.8,
    runoffCoefficient: 0.76,
    baseCapacityM3s: 36.0,
    flowDirectionDeg: 85,
    criticalAssets: [
      "Hayatabad Phase 3 & 4 Storm Nullas",
      "Hayatabad Industrial Estate Effluent Channel",
      "Tatara Park Flood Retention Pond",
      "Hayatabad Medical Complex (HMC) Ingress",
    ],
  },
  {
    id: "bara_ringroad",
    name: "Bara River & Ring Road Southern Flank",
    nameUr: "دریائے باڑہ و رنگ روڈ جنوبی کنارہ",
    namePs: "د باړې سیند او جنوبي رنګ روډ څنډه",
    description:
      "Southern urban boundary receiving heavy agricultural silt and mud from the Bara basin. Silt-choked culverts regularly inundate Ring Road underpasses.",
    center: [33.978, 71.545],
    polygonCoords: [
      [33.962, 71.495],
      [33.992, 71.512],
      [33.995, 71.585],
      [33.968, 71.588],
      [33.958, 71.525],
      [33.962, 71.495],
    ],
    elevationMeters: 324,
    areaKm2: 8.5,
    runoffCoefficient: 0.68,
    baseCapacityM3s: 28.0,
    flowDirectionDeg: 60,
    criticalAssets: [
      "Rehman Baba Square Ring Road Culvert",
      "Pishtakhara Intersections",
      "Kohat Road Flyover Drainage Inlets",
      "Southern Agricultural Discharge Canal",
    ],
  },
  {
    id: "warsak_canal",
    name: "Warsak Road & Northern Canal Network",
    nameUr: "ورسک روڈ و شمالی نہری نظام",
    namePs: "د ورسک سړک او شمالي کانال شبکه",
    description:
      "Northwestern catchment intersecting the historic Warsak gravity canal and newly developing residential townships with unpaved secondary gullies.",
    center: [34.052, 71.495],
    polygonCoords: [
      [34.025, 71.465],
      [34.068, 71.472],
      [34.072, 71.535],
      [34.032, 71.538],
      [34.025, 71.465],
    ],
    elevationMeters: 348,
    areaKm2: 7.2,
    runoffCoefficient: 0.65,
    baseCapacityM3s: 25.0,
    flowDirectionDeg: 95,
    criticalAssets: [
      "Warsak Road Irrigation Siphon",
      "Army Public School Road Corridor",
      "Regi Lalma Storm Confluence",
      "Northern Gravity Feeder Canal",
    ],
  },
];

// Point-in-polygon helper algorithm (Ray casting)
export function isPointInPolygon(
  point: [number, number],
  polygon: [number, number][]
): boolean {
  const [lat, lng] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect =
      yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Distance between two points in km (Haversine)
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find closest catchment basin for a report
export function matchReportToCatchment(
  lat: number,
  lng: number,
  areaName?: string | null
): CatchmentBasin {
  const point: [number, number] = [lat, lng];

  // 1. First test geometric polygon inclusion
  for (const basin of PESHAWAR_CATCHMENTS) {
    if (isPointInPolygon(point, basin.polygonCoords)) {
      return basin;
    }
  }

  // 2. Name-based match fallback
  if (areaName) {
    const lower = areaName.toLowerCase();
    if (lower.includes("hayatabad")) return PESHAWAR_CATCHMENTS[5];
    if (lower.includes("budni") || lower.includes("charsadda")) return PESHAWAR_CATCHMENTS[1];
    if (lower.includes("gulbahar") || lower.includes("nishtar")) return PESHAWAR_CATCHMENTS[2];
    if (lower.includes("university") || lower.includes("tehkal") || lower.includes("kth")) return PESHAWAR_CATCHMENTS[3];
    if (lower.includes("saddar") || lower.includes("cantt")) return PESHAWAR_CATCHMENTS[4];
    if (lower.includes("kohati") || lower.includes("hashtnagri") || lower.includes("yadgar")) return PESHAWAR_CATCHMENTS[0];
    if (lower.includes("ring") || lower.includes("rehman") || lower.includes("bara")) return PESHAWAR_CATCHMENTS[6];
    if (lower.includes("warsak")) return PESHAWAR_CATCHMENTS[7];
  }

  // 3. Fallback to nearest basin centroid
  let closestBasin = PESHAWAR_CATCHMENTS[0];
  let minDistance = Infinity;

  for (const basin of PESHAWAR_CATCHMENTS) {
    const dist = haversineKm(lat, lng, basin.center[0], basin.center[1]);
    if (dist < minDistance) {
      minDistance = dist;
      closestBasin = basin;
    }
  }

  return closestBasin;
}

export interface ReportInputForSim {
  id: string;
  lat: number;
  lng: number;
  type: string;
  severity: string;
  status: string;
  areaName?: string | null;
}

/**
 * Hydrological Runoff & Inundation Simulation Engine
 * Uses the standard Rational Method:
 *   Q_peak = (C * I * A) / 360  (m^3/sec)
 * where:
 *   C = Runoff Coefficient (0.60 - 0.89)
 *   I = Rainfall Intensity (mm/hr)
 *   A = Catchment Area (Hectares = km^2 * 100)
 */
export function simulateCatchmentBasins(
  rainMmPerHour: number,
  activeReports: ReportInputForSim[],
  mitigatedBasinIds: Set<string> = new Set()
): {
  basinResults: BasinSimulationResult[];
  totalRunoffMillionLiters: number;
  criticalBasinsCount: number;
  cityRiskIndex: number;
} {
  // Aggregate active blockages by catchment basin
  const basinMap = new Map<
    string,
    { blockages: number; dangers: number }
  >();

  PESHAWAR_CATCHMENTS.forEach((b) => {
    basinMap.set(b.id, { blockages: 0, dangers: 0 });
  });

  activeReports.forEach((rep) => {
    if (rep.status === "verified_fixed") return;
    const matched = matchReportToCatchment(rep.lat, rep.lng, rep.areaName);
    const curr = basinMap.get(matched.id) || { blockages: 0, dangers: 0 };
    if (
      rep.type === "blocked_drain" ||
      rep.type === "garbage_in_drain" ||
      rep.type === "standing_water"
    ) {
      curr.blockages += 1;
    }
    if (rep.severity === "danger" || rep.type === "open_manhole") {
      curr.dangers += 1;
    }
    basinMap.set(matched.id, curr);
  });

  let grandTotalRunoffM3 = 0;
  let criticalCount = 0;
  let weightedRiskSum = 0;

  const basinResults: BasinSimulationResult[] = PESHAWAR_CATCHMENTS.map(
    (basin) => {
      const stats = basinMap.get(basin.id) || { blockages: 0, dangers: 0 };
      const isMitigated = mitigatedBasinIds.has(basin.id);

      // Effective blockages (if mitigated by user's what-if clean action, blockages drop to 0)
      const effectiveBlockages = isMitigated ? 0 : stats.blockages;

      // Rational Method Peak Storm Runoff:
      // A_hectares = basin.areaKm2 * 100
      const areaHectares = basin.areaKm2 * 100;
      const runoffVolumeM3s =
        (basin.runoffCoefficient * rainMmPerHour * areaHectares) / 360;

      // Million Liters per hour = m^3/s * 3600 seconds * 1000 liters / 1,000,000 = m^3/s * 3.6
      const runoffMillionLitersPerHour = runoffVolumeM3s * 3.6;
      grandTotalRunoffM3 += runoffVolumeM3s;

      // Baseline discharge capacity is degraded by 14% per active uncleaned blockage, capped at 75% degradation
      const blockageDegradationPct = Math.min(
        0.75,
        effectiveBlockages * 0.14
      );
      const effectiveCapacityM3s =
        basin.baseCapacityM3s * (1 - blockageDegradationPct);

      // Capacity deficit = excess stormwater that cannot drain
      const capacityDeficitM3s = Math.max(
        0,
        runoffVolumeM3s - effectiveCapacityM3s
      );

      // Estimate surface ponding depth in centimeters:
      // Function of capacity deficit, basin topography factor, and duration
      // High density flat basins (like Shahi Katha) pond faster than hilly Hayatabad
      const pondingMultiplier =
        basin.id === "shahi_katha" || basin.id === "gulbahar_gt"
          ? 1.4
          : basin.id === "budni_nullah" || basin.id === "university_brt"
          ? 1.2
          : 0.9;

      let inundationDepthCm = 0;
      if (rainMmPerHour > 0) {
        if (capacityDeficitM3s > 0) {
          const deficitRatio = Math.min(2.2, capacityDeficitM3s / basin.baseCapacityM3s);
          inundationDepthCm = Math.round(
            deficitRatio * 16 * pondingMultiplier + (rainMmPerHour * 0.25)
          );
        } else {
          // Normal localized puddles under clean capacity
          inundationDepthCm = Math.round(
            Math.min(12, (rainMmPerHour / 50) * 8 * (1 + effectiveBlockages * 0.15))
          );
        }
      }

      // Add penalty for unaddressed open manholes / danger spots
      if (stats.dangers > 0 && !isMitigated) {
        inundationDepthCm += stats.dangers * 3;
      }

      const inundationDepthInches = Math.round((inundationDepthCm / 2.54) * 10) / 10;

      // Time to ponding (minutes until street is impassable to bikes/rickshaws)
      let timeToPondingMinutes = 999;
      if (rainMmPerHour >= 10) {
        if (capacityDeficitM3s > 0) {
          timeToPondingMinutes = Math.max(
            8,
            Math.round(45 / (1 + capacityDeficitM3s * 0.35 + effectiveBlockages * 0.5))
          );
        } else {
          timeToPondingMinutes = Math.max(
            35,
            Math.round(120 / (1 + effectiveBlockages * 0.3))
          );
        }
      }

      // Determine Risk Level
      let riskLevel: FloodRiskLevel = "safe";
      if (inundationDepthCm > 35 || (inundationDepthCm > 25 && stats.dangers > 0)) {
        riskLevel = "catastrophic";
      } else if (inundationDepthCm >= 18) {
        riskLevel = "severe";
      } else if (inundationDepthCm >= 8) {
        riskLevel = "minor";
      } else {
        riskLevel = "safe";
      }

      if (riskLevel === "severe" || riskLevel === "catastrophic") {
        criticalCount++;
      }

      const basinWeight = basin.areaKm2;
      const riskScore =
        riskLevel === "catastrophic"
          ? 100
          : riskLevel === "severe"
          ? 70
          : riskLevel === "minor"
          ? 35
          : 10;
      weightedRiskSum += riskScore * basinWeight;

      // Water averted if mitigated
      let waterAvertedLitersPerHour = 0;
      if (isMitigated && stats.blockages > 0) {
        const fullCapacity = basin.baseCapacityM3s;
        const diffM3s = fullCapacity * Math.min(0.75, stats.blockages * 0.14);
        waterAvertedLitersPerHour = Math.round(diffM3s * 3600 * 1000);
      }

      return {
        basin,
        activeBlockagesCount: stats.blockages,
        dangerHazardsCount: stats.dangers,
        runoffVolumeM3s: Math.round(runoffVolumeM3s * 10) / 10,
        runoffMillionLitersPerHour: Math.round(runoffMillionLitersPerHour * 10) / 10,
        dischargeCapacityM3s: basin.baseCapacityM3s,
        effectiveCapacityM3s: Math.round(effectiveCapacityM3s * 10) / 10,
        capacityDeficitM3s: Math.round(capacityDeficitM3s * 10) / 10,
        inundationDepthCm,
        inundationDepthInches,
        timeToPondingMinutes,
        riskLevel,
        isMitigated,
        waterAvertedLitersPerHour,
      };
    }
  );

  const totalArea = PESHAWAR_CATCHMENTS.reduce((sum, b) => sum + b.areaKm2, 0);
  const cityRiskIndex = Math.min(100, Math.round(weightedRiskSum / totalArea));

  return {
    basinResults,
    totalRunoffMillionLiters: Math.round(grandTotalRunoffM3 * 3.6),
    criticalBasinsCount: criticalCount,
    cityRiskIndex,
  };
}
