"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getDropletSvgString, SeverityType } from "@/components/droplet-pin";
import { useLanguage } from "@/components/language-provider";
import type { ReportItem } from "@/types/report";
import type { SafeRouteResponse } from "@/types/route";

interface LiveMapProps {
  reports: ReportItem[];
  selectedReport: ReportItem | null;
  onSelectReport: (report: ReportItem | null) => void;
  avoidRoadLayer: boolean;
  pickedLocation: { lat: number; lng: number } | null;
  onPickLocation?: (coords: { lat: number; lng: number }) => void;
  isPickingLocation?: boolean;
  activeRoute?: SafeRouteResponse | null;
  radarActive?: boolean;
  onProximityAlert?: (hazardText: string | null) => void;
}

export function LiveMap({
  reports,
  selectedReport,
  onSelectReport,
  avoidRoadLayer,
  pickedLocation,
  onPickLocation,
  isPickingLocation = false,
  activeRoute = null,
  radarActive = false,
  onProximityAlert,
}: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const dangerCirclesLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const radarLayerRef = useRef<L.LayerGroup | null>(null);
  const pickedMarkerRef = useRef<L.Marker | null>(null);
  const lastAlertTimeRef = useRef<number>(0);
  const { language, t } = useLanguage();

  // 1. Initialize Map with Modern OpenStreetMap Tiles
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered on central Peshawar
    const map = L.map(mapContainerRef.current, {
      center: [34.0125, 71.554],
      zoom: 13,
      zoomControl: false,
      maxZoom: 19,
      minZoom: 11,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: ["a", "b", "c"],
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    dangerCirclesLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    radarLayerRef.current = L.layerGroup().addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      if (onPickLocation) {
        onPickLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Render Droplet Pins and Avoid-Road Circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    const dangerGroup = dangerCirclesLayerRef.current;

    if (!map || !markersGroup || !dangerGroup) return;

    markersGroup.clearLayers();
    dangerGroup.clearLayers();

    reports.forEach((report, index) => {
      const isFixed = report.status === "verified_fixed";
      const pinSeverity: SeverityType = isFixed ? "fixed" : report.severity;

      const uniquePinId = `pin-${report.id.slice(0, 6)}-${index}`;
      const iconHtml = getDropletSvgString(pinSeverity, uniquePinId);

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-droplet-marker",
        iconSize: [36, 45],
        iconAnchor: [18, 45],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([report.lat, report.lng], { icon: customIcon });

      const typeLabel = t.types[report.type] || report.type;
      const severityLabel = isFixed ? t.severities.fixed : t.severities[report.severity];
      const areaDisplay =
        language === "ps" && report.areaNamePs
          ? report.areaNamePs
          : language === "ur" && report.areaNameUr
          ? report.areaNameUr
          : report.areaName || "Peshawar";

      const badgeBg =
        pinSeverity === "danger"
          ? "#FEE2E2"
          : pinSeverity === "knee"
          ? "#FFEDD5"
          : pinSeverity === "ankle"
          ? "#FEF3C7"
          : "#DCFCE7";

      const badgeText =
        pinSeverity === "danger"
          ? "#B91C1C"
          : pinSeverity === "knee"
          ? "#C2410C"
          : pinSeverity === "ankle"
          ? "#B45309"
          : "#15803D";

      const popupDiv = document.createElement("div");
      popupDiv.className = "naali-custom-popup";
      popupDiv.style.width = "240px";
      popupDiv.style.borderRadius = "20px";
      popupDiv.style.overflow = "hidden";
      popupDiv.style.fontFamily = "inherit";

      popupDiv.innerHTML = `
        <div style="position: relative; height: 110px; background: #12263A;">
          <img 
            src="/api/photos/${report.photoFile}" 
            alt="Drain problem" 
            style="width: 100%; height: 100%; object-fit: cover;"
            onerror="this.style.display='none'"
          />
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(18,38,58,0.7) 0%, transparent 60%);"></div>
          <div style="position: absolute; bottom: 8px; left: 10px; right: 10px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #FFFFFF; background: rgba(14,107,115,0.85); padding: 2px 8px; border-radius: 9999px; backdrop-filter: blur(4px);">
              ${areaDisplay}
            </span>
            <span style="font-size: 11px; font-weight: 700; color: #FFFFFF; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
              👥 ${report.confirmationsCount}
            </span>
          </div>
        </div>
        <div style="padding: 12px 14px 14px 14px; background: #FFFFFF;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 4px;">
            <div style="font-size: 14px; font-weight: 800; color: #12263A; line-height: 1.2;">
              ${typeLabel}
            </div>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 9999px; background: ${badgeBg}; color: ${badgeText}; shrink: 0;">
              ${severityLabel}
            </span>
          </div>
          <p style="font-size: 11px; color: #4B6073; line-height: 1.4; margin: 4px 0 10px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${report.complaintText || "No additional description."}
          </p>
          <button id="btn-popup-${report.id}" style="width: 100%; background: #0E6B73; color: white; border: none; padding: 8px 12px; border-radius: 10px; font-size: 11px; font-weight: 700; cursor: pointer; transition: background 0.2s; box-shadow: 0 2px 6px rgba(14,107,115,0.25);">
            View Details & Verify →
          </button>
        </div>
      `;

      popupDiv.querySelector(`#btn-popup-${report.id}`)?.addEventListener("click", () => {
        onSelectReport(report);
      });

      marker.bindPopup(popupDiv, { maxWidth: 260, minWidth: 240 });
      marker.on("click", () => {
        onSelectReport(report);
      });

      markersGroup.addLayer(marker);

      if (avoidRoadLayer && report.severity === "danger" && report.status !== "verified_fixed") {
        const radiusMeters = 45 + Math.min(report.confirmationsCount * 25, 220);
        const circle = L.circle([report.lat, report.lng], {
          radius: radiusMeters,
          color: "#DC2626",
          fillColor: "#EF4444",
          fillOpacity: 0.18,
          weight: 2,
          dashArray: "6, 8",
        });
        dangerGroup.addLayer(circle);
      }
    });
  }, [reports, avoidRoadLayer, language, t, onSelectReport]);

  // 3. Render Safe Route & Direct Route Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeGroup = routeLayerRef.current;
    if (!map || !routeGroup) return;

    routeGroup.clearLayers();

    if (!activeRoute) return;

    const bounds = L.latLngBounds([]);

    // Draw Direct Risky Route (if hazards exist and routes differ)
    if (
      activeRoute.directRoute.hazards.length > 0 &&
      activeRoute.directRoute.coordinates.length > 0
    ) {
      const directPoly = L.polyline(activeRoute.directRoute.coordinates, {
        color: "#EF4444",
        weight: 4,
        opacity: 0.55,
        dashArray: "8, 8",
      });
      routeGroup.addLayer(directPoly);

      // Add hazard warning callouts on the direct path
      activeRoute.directRoute.hazards.forEach((hazard) => {
        const hazardPin = L.circleMarker([hazard.lat, hazard.lng], {
          radius: 8,
          fillColor: "#DC2626",
          color: "#FFFFFF",
          weight: 2,
          fillOpacity: 0.9,
        });
        hazardPin.bindTooltip(`⚠️ Avoided: ${hazard.type.replace(/_/g, " ")}`, {
          permanent: false,
          direction: "top",
        });
        routeGroup.addLayer(hazardPin);
      });
    }

    // Draw Safe Route (Glowing Emerald Solid Line)
    if (activeRoute.safeRoute.coordinates.length > 0) {
      // Glow under-layer
      const glowPoly = L.polyline(activeRoute.safeRoute.coordinates, {
        color: "#10B981",
        weight: 9,
        opacity: 0.35,
        lineCap: "round",
        lineJoin: "round",
      });
      routeGroup.addLayer(glowPoly);

      // Main line
      const mainPoly = L.polyline(activeRoute.safeRoute.coordinates, {
        color: "#059669",
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      });
      routeGroup.addLayer(mainPoly);

      activeRoute.safeRoute.coordinates.forEach((coord) => {
        bounds.extend(coord);
      });
    }

    // Start Marker (Origin Pin "A")
    const startIcon = L.divIcon({
      html: `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; background: rgba(16, 185, 129, 0.3); border-radius: 9999px; animation: ping 2s infinite;"></div>
          <div style="width: 28px; height: 28px; background: #059669; border: 2.5px solid #FFFFFF; border-radius: 9999px; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; box-shadow: 0 4px 10px rgba(0,0,0,0.35);">
            A
          </div>
        </div>
      `,
      className: "safe-route-start-pin",
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const startMarker = L.marker([activeRoute.start.lat, activeRoute.start.lng], {
      icon: startIcon,
    }).bindTooltip(`<b>Start:</b> ${activeRoute.start.name}`, { permanent: false, direction: "top" });
    routeGroup.addLayer(startMarker);
    bounds.extend([activeRoute.start.lat, activeRoute.start.lng]);

    // Destination Marker (End Pin "B")
    const endIcon = L.divIcon({
      html: `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div style="width: 28px; height: 28px; background: #0E6B73; border: 2.5px solid #FFFFFF; border-radius: 9999px; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; box-shadow: 0 4px 10px rgba(0,0,0,0.35);">
            B
          </div>
        </div>
      `,
      className: "safe-route-end-pin",
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const endMarker = L.marker([activeRoute.end.lat, activeRoute.end.lng], {
      icon: endIcon,
    }).bindTooltip(`<b>Destination:</b> ${activeRoute.end.name}`, {
      permanent: false,
      direction: "top",
    });
    routeGroup.addLayer(endMarker);
    bounds.extend([activeRoute.end.lat, activeRoute.end.lng]);

    // Fit map bounds to encompass the entire route
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    }
  }, [activeRoute]);

  // 4. Manhole Proximity Radar & GPS Watcher
  useEffect(() => {
    const map = mapInstanceRef.current;
    const radarGroup = radarLayerRef.current;
    if (!map || !radarGroup) return;

    radarGroup.clearLayers();

    if (!radarActive) {
      if (onProximityAlert) onProximityAlert(null);
      return;
    }

    let watchId: number | null = null;
    let userMarker: L.Marker | null = null;

    const playBeep = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz alarm
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } catch {
        // Audio synthesis fallback
      }
    };

    const checkProximity = (userLat: number, userLng: number) => {
      const dangerReports = reports.filter(
        (r) => r.severity === "danger" && r.status !== "verified_fixed"
      );

      let closestDist = Infinity;
      let closestReport: ReportItem | null = null;

      dangerReports.forEach((r) => {
        const dLat = ((r.lat - userLat) * Math.PI) / 180;
        const dLng = ((r.lng - userLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((userLat * Math.PI) / 180) *
            Math.cos((r.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const dist = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        if (dist < closestDist) {
          closestDist = dist;
          closestReport = r;
        }
      });

      if (closestDist <= 75 && closestReport) {
        const now = Date.now();
        if (now - lastAlertTimeRef.current > 4000) {
          playBeep();
          lastAlertTimeRef.current = now;
        }
        if (onProximityAlert) {
          onProximityAlert(
            `⚠️ Alert: Open Manhole / Danger ${Math.round(closestDist)}m ahead near ${
              (closestReport as any).areaName || "corridor"
            }!`
          );
        }
      } else {
        if (onProximityAlert) onProximityAlert(null);
      }
    };

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          if (!userMarker) {
            const userIcon = L.divIcon({
              html: `
                <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
                  <div style="position: absolute; inset: 0; background: rgba(220, 38, 38, 0.4); border-radius: 9999px; animation: ping 1.2s infinite;"></div>
                  <div style="width: 16px; height: 16px; background: #DC2626; border: 2.5px solid #FFFFFF; border-radius: 9999px; box-shadow: 0 0 12px rgba(220,38,38,0.8);"></div>
                </div>
              `,
              className: "live-radar-user-pin",
              iconSize: [36, 36],
              iconAnchor: [18, 18],
            });

            userMarker = L.marker([latitude, longitude], { icon: userIcon });
            radarGroup.addLayer(userMarker);
          } else {
            userMarker.setLatLng([latitude, longitude]);
          }

          checkProximity(latitude, longitude);
        },
        () => {
          // Fallback location near central Peshawar if user denies GPS
          checkProximity(34.0125, 71.554);
        },
        { enableHighAccuracy: true, maximumAge: 3000 }
      );
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      radarGroup.clearLayers();
    };
  }, [radarActive, reports, onProximityAlert]);

  // 5. Pan and smooth zoom to selected report
  useEffect(() => {
    if (selectedReport && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedReport.lat, selectedReport.lng], 15, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedReport]);

  // 6. Update Picked Location Pin
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pickedMarkerRef.current) {
      map.removeLayer(pickedMarkerRef.current);
      pickedMarkerRef.current = null;
    }

    if (pickedLocation) {
      const pinHtml = `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; background: rgba(14, 107, 115, 0.3); border-radius: 9999px; animation: water-ripple 1.8s infinite;"></div>
          <div style="position: relative; width: 22px; height: 22px; background: #0E6B73; border: 3px solid #FFFFFF; border-radius: 9999px; box-shadow: 0 4px 12px rgba(0,0,0,0.35);"></div>
        </div>
      `;
      const icon = L.divIcon({
        html: pinHtml,
        className: "custom-pick-marker",
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      pickedMarkerRef.current = L.marker([pickedLocation.lat, pickedLocation.lng], {
        icon,
      }).addTo(map);

      map.flyTo([pickedLocation.lat, pickedLocation.lng], 16);
    }
  }, [pickedLocation]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Location Picker Banner */}
      {isPickingLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#12263A]/95 text-white px-5 py-2.5 rounded-full shadow-2xl border border-white/20 text-xs font-bold flex items-center gap-2.5 backdrop-blur-md animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0E6B73] animate-ping" />
          <span>📍 Tap on the road to drop problem location pin</span>
        </div>
      )}
    </div>
  );
}
