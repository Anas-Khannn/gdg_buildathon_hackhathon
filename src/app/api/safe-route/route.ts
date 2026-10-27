import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reports, areas } from "@/db/schema";
import { ne, and, eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CommuteMode, SafeRouteLocation, HazardOnRoute, SafeRouteResponse } from "@/types/route";

// Haversine distance calculation in meters
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
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

// Distance from point (pLat, pLng) to line segment (aLat, aLng) -> (bLat, bLng) in meters
function pointToSegmentDistanceMeters(
  pLat: number,
  pLng: number,
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): number {
  const x = pLng;
  const y = pLat;
  const x1 = aLng;
  const y1 = aLat;
  const x2 = bLng;
  const y2 = bLat;

  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx: number;
  let yy: number;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  return haversineMeters(pLat, pLng, yy, xx);
}

// Minimum distance from point to polyline
function minDistanceToPolyline(
  lat: number,
  lng: number,
  polyline: [number, number][]
): number {
  let minDistance = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const d = pointToSegmentDistanceMeters(
      lat,
      lng,
      polyline[i][0],
      polyline[i][1],
      polyline[i + 1][0],
      polyline[i + 1][1]
    );
    if (d < minDistance) minDistance = d;
  }
  return minDistance;
}

// Fetch polyline from OSRM with reliable timeout and fallback
async function fetchOsrmPolyline(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  viaWaypoints: { lat: number; lng: number }[] = []
): Promise<{ coordinates: [number, number][]; distanceKm: number; durationMinutes: number }> {
  try {
    const points = [start, ...viaWaypoints, end];
    const coordString = points.map((p) => `${p.lng},${p.lat}`).join(";");
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        // OSRM returns [lng, lat], convert to [lat, lng]
        const coords: [number, number][] = route.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]]
        );
        return {
          coordinates: coords,
          distanceKm: parseFloat((route.distance / 1000).toFixed(2)),
          durationMinutes: Math.round(route.duration / 60) || 1,
        };
      }
    }
  } catch {
    // Fallback to geometric interpolation if OSRM is offline or timed out
  }

  // Fallback linear/spline interpolation between waypoints
  const allPoints = [start, ...viaWaypoints, end];
  const coordinates: [number, number][] = [];
  let totalMeters = 0;

  for (let i = 0; i < allPoints.length - 1; i++) {
    const p1 = allPoints[i];
    const p2 = allPoints[i + 1];
    const segDist = haversineMeters(p1.lat, p1.lng, p2.lat, p2.lng);
    totalMeters += segDist;

    const steps = Math.max(8, Math.round(segDist / 120));
    for (let s = 0; s <= steps; s++) {
      if (i > 0 && s === 0) continue;
      const t = s / steps;
      const lat = p1.lat + (p2.lat - p1.lat) * t;
      const lng = p1.lng + (p2.lng - p1.lng) * t;
      coordinates.push([lat, lng]);
    }
  }

  const distanceKm = parseFloat((totalMeters / 1000).toFixed(2));
  const durationMinutes = Math.max(3, Math.round(distanceKm * 2.8));

  return { coordinates, distanceKm, durationMinutes };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const start: SafeRouteLocation = body.start;
    const end: SafeRouteLocation = body.end;
    const mode: CommuteMode = body.mode || "bike";

    if (!start || !end || typeof start.lat !== "number" || typeof end.lat !== "number") {
      return NextResponse.json(
        { error: "Invalid start or destination coordinates" },
        { status: 400 }
      );
    }

    // 1. Fetch active reports from database (excluding verified fixed)
    const activeReports = await db
      .select({
        id: reports.id,
        type: reports.type,
        severity: reports.severity,
        lat: reports.lat,
        lng: reports.lng,
        complaintText: reports.complaintText,
        areaName: areas.name,
        areaNameUr: areas.name_ur,
        status: reports.status,
      })
      .from(reports)
      .leftJoin(areas, eq(reports.areaId, areas.id))
      .where(and(ne(reports.status, "verified_fixed"), eq(reports.hidden, false)));

    // 2. Fetch Direct Route
    const directResult = await fetchOsrmPolyline(start, end);

    // Hazard collision thresholds by severity
    const dangerThresholdMeters = mode === "bike" ? 140 : 100;
    const kneeThresholdMeters = mode === "bike" ? 90 : 70;
    const ankleThresholdMeters = 40;

    // 3. Scan hazards intersecting direct route
    const hazardsOnDirect: HazardOnRoute[] = [];
    const avoidedHazardsList: HazardOnRoute[] = [];

    activeReports.forEach((report) => {
      const dist = minDistanceToPolyline(report.lat, report.lng, directResult.coordinates);
      const isClash =
        (report.severity === "danger" && dist <= dangerThresholdMeters) ||
        (report.severity === "knee" && dist <= kneeThresholdMeters) ||
        (report.severity === "ankle" && dist <= ankleThresholdMeters);

      if (isClash) {
        hazardsOnDirect.push({
          id: report.id,
          type: report.type,
          severity: report.severity as any,
          lat: report.lat,
          lng: report.lng,
          distanceMeters: Math.round(dist),
          areaName: report.areaName || undefined,
          complaintText: report.complaintText || undefined,
        });
      }
    });

    // 4. Calculate Safe Avoidance Route if hazards exist
    let safeResult = directResult;
    let safeWaypoints: { lat: number; lng: number }[] = [];

    if (hazardsOnDirect.length > 0) {
      // Find center of hazard cluster
      const avgHazardLat =
        hazardsOnDirect.reduce((sum, h) => sum + h.lat, 0) / hazardsOnDirect.length;
      const avgHazardLng =
        hazardsOnDirect.reduce((sum, h) => sum + h.lng, 0) / hazardsOnDirect.length;

      // Calculate detour vector perpendicular to start -> end line
      const dLat = end.lat - start.lat;
      const dLng = end.lng - start.lng;
      const len = Math.sqrt(dLat * dLat + dLng * dLng) || 0.01;

      // Normal vector (offset by ~450m-700m to bypass urban road blocks)
      const perpLat = -dLng / len;
      const perpLng = dLat / len;
      const detourOffset = 0.0055; // ~600m in lat/lng

      // Choose detour direction away from the hazard cluster center
      const candidate1 = {
        lat: (start.lat + end.lat) / 2 + perpLat * detourOffset,
        lng: (start.lng + end.lng) / 2 + perpLng * detourOffset,
      };
      const candidate2 = {
        lat: (start.lat + end.lat) / 2 - perpLat * detourOffset,
        lng: (start.lng + end.lng) / 2 - perpLng * detourOffset,
      };

      const dist1 = haversineMeters(candidate1.lat, candidate1.lng, avgHazardLat, avgHazardLng);
      const dist2 = haversineMeters(candidate2.lat, candidate2.lng, avgHazardLat, avgHazardLng);

      const bestDetour = dist1 > dist2 ? candidate1 : candidate2;
      safeWaypoints = [bestDetour];

      // Re-route with avoidance detour
      safeResult = await fetchOsrmPolyline(start, end, safeWaypoints);
    }

    const dangerHazardsCount = hazardsOnDirect.filter((h) => h.severity === "danger").length;
    const totalAvoidedCount = hazardsOnDirect.length;

    // 5. Generate AI Route Safety Advisory (Gemini 1.5 Flash + fallback)
    let aiAdvisory = {
      status: (dangerHazardsCount > 0 ? "critical" : totalAvoidedCount > 0 ? "caution" : "safe") as
        | "safe"
        | "caution"
        | "critical",
      headlineEn:
        totalAvoidedCount > 0
          ? `⚠️ Diverted around ${totalAvoidedCount} active hazard${totalAvoidedCount > 1 ? "s" : ""}`
          : "✅ Clear & Safe Path Available",
      headlineUr:
        totalAvoidedCount > 0
          ? `⚠️ ${totalAvoidedCount} خطرات سے بچا کر متبادل محفوظ راستہ تیار ہے`
          : "✅ راستہ بالکل صاف اور محفوظ ہے",
      headlinePs:
        totalAvoidedCount > 0
          ? `⚠️ د ${totalAvoidedCount} خطرو مخنیوی سره خوندي لاره چمتو شوه`
          : "✅ لاره په بشپړه توګه پاکه او خوندي ده",
      detailsEn:
        totalAvoidedCount > 0
          ? `Safe Route safely bypasses ${dangerHazardsCount} open manholes and flooded choke points near ${hazardsOnDirect[0]?.areaName || "corridors"}. Estimated delay: +${Math.max(1, safeResult.durationMinutes - directResult.durationMinutes)} mins.`
          : `No submerged manholes or severe waterlogging detected along your direct route between ${start.name} and ${end.name}.`,
      detailsUr:
        totalAvoidedCount > 0
          ? `محفوظ راستہ آپ کو ${hazardsOnDirect[0]?.areaName || "شہر"} کے قریب کھلے مین ہول اور کھڑے پانی سے بچا کر لے جاتا ہے۔ محفوظ فاصلہ اختیار کریں۔`
          : `${start.name} سے ${end.name} تک براہِ راست راستے پر کوئی کھلا مین ہول یا گہرا پانی رپورٹ نہیں ہوا۔`,
      detailsPs:
        totalAvoidedCount > 0
          ? `خوندي لاره تاسو د پېښور د خطري اوبو او خلاصو مین هولونو څخه ژغوري. په ډاډه توګه حرکت وکړئ.`
          : `له ${start.name} څخه ${end.name} پورې پر لاره کوم خطر نشته. سفر مو په خیر.`,
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && totalAvoidedCount > 0) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are the AI Navigation Safety Dispatcher for Peshawar Urban Drainage (NaaliWatch).
Route Details:
- Start: "${start.name}"
- Destination: "${end.name}"
- Commute Mode: ${mode} (Motorcycle/Rickshaw riders are vulnerable to submerged manholes!)
- Hazards avoided: ${totalAvoidedCount} (Open manholes/danger: ${dangerHazardsCount})
- Choke-point areas: ${hazardsOnDirect.map((h) => h.areaName || h.type).join(", ")}
- Detour added: ~${Math.max(1, safeResult.durationMinutes - directResult.durationMinutes)} mins.

Generate a short, life-saving advisory in JSON format:
{
  "status": "${dangerHazardsCount > 0 ? "critical" : "caution"}",
  "headlineEn": "Brief punchy headline in English (max 7 words)",
  "headlineUr": "Brief punchy headline in Urdu (max 7 words)",
  "headlinePs": "Brief punchy headline in Pashto (max 7 words)",
  "detailsEn": "1-2 sentences warning about the specific choke points avoided and recommending the detour.",
  "detailsUr": "Same in natural colloquial Pakistani Urdu for Peshawar citizens.",
  "detailsPs": "Same in Pashto language."
}
Return ONLY valid JSON. No markdown backticks.`;

        const geminiRes = await model.generateContent(prompt);
        const text = geminiRes.response.text().trim();
        const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        if (parsed.headlineEn && parsed.detailsEn) {
          aiAdvisory = {
            status: parsed.status || aiAdvisory.status,
            headlineEn: parsed.headlineEn,
            headlineUr: parsed.headlineUr || aiAdvisory.headlineUr,
            headlinePs: parsed.headlinePs || aiAdvisory.headlinePs,
            detailsEn: parsed.detailsEn,
            detailsUr: parsed.detailsUr || aiAdvisory.detailsUr,
            detailsPs: parsed.detailsPs || aiAdvisory.detailsPs,
          };
        }
      } catch (err) {
        // Gracefully use local AI fallback template
      }
    }

    // 6. Return response
    const responsePayload: SafeRouteResponse = {
      success: true,
      start,
      end,
      mode,
      directRoute: {
        coordinates: directResult.coordinates,
        distanceKm: directResult.distanceKm,
        durationMinutes: directResult.durationMinutes,
        hazards: hazardsOnDirect,
      },
      safeRoute: {
        coordinates: safeResult.coordinates,
        distanceKm: safeResult.distanceKm,
        durationMinutes: safeResult.durationMinutes,
        avoidedHazardsCount: totalAvoidedCount,
        dangerHazardsCount,
      },
      aiAdvisory,
      radarHazards: activeReports
        .filter((r) => r.severity === "danger" || r.severity === "knee")
        .map((r) => ({
          id: r.id,
          lat: r.lat,
          lng: r.lng,
          type: r.type,
          severity: r.severity,
        })),
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Safe route calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate safe navigation route" },
      { status: 500 }
    );
  }
}
