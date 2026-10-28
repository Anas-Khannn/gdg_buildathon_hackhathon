"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/header";
import { MapWrapper } from "@/components/map/map-wrapper";
import type { ReportItem } from "@/types/report";
import type { SafeRouteResponse } from "@/types/route";
import { ReportModal } from "@/components/report-modal";
import { ReportDetailDrawer } from "@/components/report-detail-drawer";
import { SafeRouteModal } from "@/components/safe-route-modal";
import { useLanguage } from "@/components/language-provider";
import { DropletPin } from "@/components/droplet-pin";
import {
  Camera,
  AlertTriangle,
  ChevronUp,
  MapPin,
  Clock,
  Sparkles,
  Users,
  ShieldAlert,
  Search,
  Navigation,
  ShieldCheck,
  Radio,
  X,
  PhoneCall,
} from "lucide-react";

interface HomePageClientProps {
  initialReports: ReportItem[];
}

export function HomePageClient({ initialReports }: HomePageClientProps) {
  const { t, language } = useLanguage();

  // Reports State seeded with initial SSR reports (No blank flash!)
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(
    new Date().toISOString()
  );

  // Filters State
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [avoidRoadLayer, setAvoidRoadLayer] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("" );

  // Modals & Drawers
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // AI Safe Route & Manhole Radar State
  const [isSafeRouteModalOpen, setIsSafeRouteModalOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState<SafeRouteResponse | null>(null);
  const [radarActive, setRadarActive] = useState(false);
  const [proximityAlertText, setProximityAlertText] = useState<string | null>(null);

  // Mobile Bottom Sheet State
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);

  // 5-Second Polling for Real-Time Live Updates (PRD Section 5 & 109)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const url = lastTimestamp
          ? `/api/reports?since=${encodeURIComponent(lastTimestamp)}`
          : `/api/reports`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.reports && data.reports.length > 0) {
            setReports((prev) => {
              const existingMap = new Map(prev.map((r) => [r.id, r]));
              data.reports.forEach((item: ReportItem) => {
                existingMap.set(item.id, item);
              });
              return Array.from(existingMap.values());
            });
            setLastTimestamp(data.timestamp);
          }
        }
      } catch (err) {
        // Polling retry
      }
    }, 5000);

    const handleSyncedReport = (e: any) => {
      const newReport = e.detail?.report;
      if (newReport) {
        setReports((prev) => {
          const map = new Map(prev.map((r) => [r.id, r]));
          map.set(newReport.id, newReport);
          return Array.from(map.values());
        });
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("naali-report-synced", handleSyncedReport);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== "undefined") {
        window.removeEventListener("naali-report-synced", handleSyncedReport);
      }
    };
  }, [lastTimestamp]);

  // Filter & Search Reports
  const filteredReports = reports.filter((r) => {
    if (activeFilter === "danger" && (r.severity !== "danger" || r.status === "verified_fixed")) {
      return false;
    }
    if (activeFilter === "fixed" && r.status !== "verified_fixed") return false;
    if (activeFilter !== "all" && activeFilter !== "danger" && activeFilter !== "fixed" && r.type !== activeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchArea = (r.areaName || "").toLowerCase().includes(query);
      const matchType = (r.type || "").toLowerCase().includes(query);
      const matchDesc = (r.complaintText || "").toLowerCase().includes(query);
      return matchArea || matchType || matchDesc;
    }
    return true;
  });

  const filterChips = [
    { id: "all", label: t.filtersAll },
    { id: "danger", label: `⚠️ ${t.filterDanger}` },
    { id: "blocked_drain", label: t.filterDrain },
    { id: "standing_water", label: t.filterWater },
    { id: "open_manhole", label: t.filterManhole },
    { id: "fixed", label: `✓ ${t.filterFixed}` },
  ];

  const dangerCount = reports.filter(
    (r) => r.severity === "danger" && r.status !== "verified_fixed"
  ).length;

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-[#EAF0F2]">
      {/* Top Header */}
      <Header />

      {/* Main Responsive Body */}
      <div className="flex-1 relative flex overflow-hidden min-h-0">
        {/* ===================================================================
            DESKTOP & TABLET FEED PANEL matching DESIGN.docx Section 6.5
           =================================================================== */}
        <aside className="hidden md:flex flex-col w-[350px] lg:w-[390px] bg-white border-r border-[#C9D4DA] z-20 shadow-xl overflow-hidden shrink-0">
          {/* Header Summary Strip */}
          <div className="p-4 bg-gradient-to-b from-[#12263A] to-[#162e45] text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#C9D4DA]/80 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Citizen Feed
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0E6B73] text-white border border-white/10">
                Polling (5s)
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-white leading-none">
                  {filteredReports.length} {filteredReports.length === 1 ? "Issue" : "Issues"}
                </h2>
                <span className="text-xs text-[#C9D4DA] mt-0.5 block">
                  Active in Peshawar urban zone
                </span>
              </div>

              {dangerCount > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-200 border border-red-500/30 text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>{dangerCount} Danger</span>
                </div>
              )}
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area (e.g. Kohati, Hayatabad)..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0E6B73]"
              />
            </div>
          </div>

          {/* Desktop Filter Chips Horizontal Bar */}
          <div className="p-2.5 border-b border-[#C9D4DA]/60 bg-[#EAF0F2]/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {filterChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(chip.id)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeFilter === chip.id
                    ? "bg-[#0E6B73] text-white shadow-sm"
                    : "bg-white text-[#12263A] border border-[#C9D4DA] hover:bg-slate-100"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Avoid-Road Layer Switch Banner */}
          <div className="px-4 py-2 bg-red-50/80 border-b border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span className="text-xs font-bold text-red-900">
                {t.avoidZoneActive}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={avoidRoadLayer}
                onChange={(e) => setAvoidRoadLayer(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0E6B73]"></div>
            </label>
          </div>

          {/* Feed List with Photo Cards */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#C9D4DA]/40 p-2 space-y-2">
            {filteredReports.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#4B6073] flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF0F2] flex items-center justify-center text-[#0E6B73]">
                  <DropletPin severity="ankle" size={28} />
                </div>
                <div className="space-y-1">
                  <p className="font-heading font-bold text-sm text-[#12263A]">
                    No Active Reports in Peshawar
                  </p>
                  <p className="text-[11px] text-[#4B6073] max-w-[220px] mx-auto leading-relaxed">
                    {t.noProblemsNear}
                  </p>
                </div>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#0E6B73] hover:bg-[#095259] text-white text-xs font-bold transition shadow-xs"
                >
                  {t.reportProblem}
                </button>
              </div>
            ) : (
              filteredReports.map((report) => {
                const isFixed = report.status === "verified_fixed";
                const isSelected = selectedReport?.id === report.id;

                const areaDisplay =
                  language === "ps" && report.areaNamePs
                    ? report.areaNamePs
                    : language === "ur" && report.areaNameUr
                    ? report.areaNameUr
                    : report.areaName || "Peshawar";

                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`group p-3 rounded-2xl border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? "border-[#0E6B73] shadow-md ring-2 ring-[#0E6B73]/20 bg-[#0E6B73]/5"
                        : "border-[#C9D4DA]/70 hover:border-[#0E6B73]/50 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Photo Thumbnail */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-[#C9D4DA]/60">
                        <img
                          src={`/api/photos/${report.photoFile}`}
                          alt="Problem photo"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <div className="absolute top-1 left-1">
                          <DropletPin
                            severity={isFixed ? "fixed" : report.severity}
                            size={18}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-extrabold uppercase text-[#0E6B73] tracking-wider truncate">
                            {areaDisplay}
                          </span>
                          <span className="text-[11px] font-bold text-[#4B6073] flex items-center gap-1 shrink-0">
                            <Users className="w-3 h-3 text-[#0E6B73]" />
                            {report.confirmationsCount}
                          </span>
                        </div>

                        <h4 className="font-heading text-sm font-bold text-[#12263A] truncate mt-0.5">
                          {t.types[report.type] || report.type}
                        </h4>

                        <p className="text-[11px] text-[#4B6073] line-clamp-2 mt-0.5 leading-snug">
                          {report.complaintText || "No complaint text provided."}
                        </p>

                        <div className="mt-2 flex items-center justify-between text-[10px]">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold ${
                              isFixed
                                ? "bg-emerald-100 text-emerald-800"
                                : report.status === "marked_fixed"
                                ? "bg-amber-100 text-amber-800"
                                : report.severity === "danger"
                                ? "bg-red-100 text-red-800"
                                : "bg-slate-100 text-[#4B6073]"
                            }`}
                          >
                            {isFixed
                              ? t.severities.fixed
                              : t.severities[report.severity]}
                          </span>

                          <span className="text-[#0E6B73] font-bold group-hover:translate-x-0.5 transition-transform">
                            View details →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Action Buttons */}
          <div className="p-3 border-t border-[#C9D4DA] bg-white space-y-2">
            <button
              onClick={() => setIsSafeRouteModalOpen(true)}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 via-[#0E6B73] to-[#095259] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <Navigation className="w-4 h-4 fill-white" />
              <span>{language === "ur" ? "محفوظ راستہ (AI Safe Route)" : "Plan Safe Route (محفوظ راستہ)"}</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#12263A] font-bold text-xs transition-all flex items-center justify-center gap-2 border border-slate-300 active:scale-98 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#0E6B73]" />
              <span>{t.reportProblem}</span>
            </button>
          </div>
        </aside>

        {/* ===================================================================
            MAP HERO CONTAINER (Fills screen)
           =================================================================== */}
        <div className="flex-1 relative h-full min-h-0">
          {/* Mobile Top Floating Filter Chips */}
          <div className="md:hidden absolute top-2 inset-x-2 z-20 flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto py-1 px-0.5">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("naali-open-emergency"));
                }
              }}
              className="shrink-0 px-2.5 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md transition-all flex items-center gap-1 bg-red-600 text-white shadow-red-950/40 cursor-pointer active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>SOS</span>
            </button>

            <button
              onClick={() => setIsSafeRouteModalOpen(true)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-[#0E6B73] text-white shadow-emerald-900/30"
            >
              <Navigation className="w-3.5 h-3.5 fill-white" />
              <span>{language === "ur" ? "محفوظ راستہ" : "Safe Route"}</span>
            </button>

            {filterChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(chip.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md transition-all ${
                  activeFilter === chip.id
                    ? "bg-[#0E6B73] text-white shadow-[#0E6B73]/30"
                    : "bg-white/95 text-[#12263A] border border-[#C9D4DA]"
                }`}
              >
                {chip.label}
              </button>
            ))}

            <button
              onClick={() => setAvoidRoadLayer(!avoidRoadLayer)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5 ${
                avoidRoadLayer
                  ? "bg-[#C8321F] text-white"
                  : "bg-white/95 text-[#4B6073] border border-[#C9D4DA]"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Avoid Road</span>
            </button>
          </div>

          {/* Real-time Proximity Radar Alert Banner */}
          {proximityAlertText && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 max-w-md w-[92%] bg-red-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl border-2 border-white/30 text-xs font-bold flex items-center gap-2.5 backdrop-blur-md animate-bounce">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
              <span className="flex-1">{proximityAlertText}</span>
            </div>
          )}

          {/* Active Safe Route Floating Card */}
          {activeRoute && (
            <div className="absolute top-3 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-md z-20 bg-[#12263A]/95 text-white p-3 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">
                    {activeRoute.start.name.split(" ")[0]} ➔ {activeRoute.end.name.split(" ")[0]}
                  </div>
                  <div className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1.5">
                    <span>
                      {activeRoute.safeRoute.distanceKm} km (~{activeRoute.safeRoute.durationMinutes}m)
                    </span>
                    <span>•</span>
                    <span>{activeRoute.safeRoute.avoidedHazardsCount} hazards avoided</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsSafeRouteModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold transition cursor-pointer"
                >
                  Details
                </button>
                <button
                  onClick={() => {
                    setActiveRoute(null);
                    setRadarActive(false);
                  }}
                  className="w-6 h-6 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 flex items-center justify-center transition cursor-pointer"
                  title="Clear Route"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* The Leaflet Live Map */}
          <MapWrapper
            reports={filteredReports}
            selectedReport={selectedReport}
            onSelectReport={(r) => setSelectedReport(r)}
            avoidRoadLayer={avoidRoadLayer}
            pickedLocation={pickedLocation}
            isPickingLocation={isPickingLocation}
            activeRoute={activeRoute}
            radarActive={radarActive}
            onProximityAlert={(text) => setProximityAlertText(text)}
            onPickLocation={(coords) => {
              if (isPickingLocation) {
                setPickedLocation(coords);
                setIsPickingLocation(false);
                setIsReportModalOpen(true);
              }
            }}
          />

          {/* ===================================================================
              MOBILE BOTTOM SHEET (Docked cleanly above Mobile Bottom Nav)
             =================================================================== */}
          <div
            className={`md:hidden absolute inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-30 bg-white rounded-t-[24px] shadow-[0_-8px_30px_rgba(18,38,58,0.22)] border-t border-[#C9D4DA] transition-all duration-300 flex flex-col ${
              bottomSheetExpanded ? "max-h-[62dvh]" : "max-h-[135px]"
            }`}
          >
            {/* Drag Handle & Summary Pill */}
            <div
              onClick={() => setBottomSheetExpanded(!bottomSheetExpanded)}
              className="pt-2.5 pb-1.5 px-4 flex flex-col items-center cursor-pointer select-none"
            >
              <div className="w-12 h-1.5 bg-[#C9D4DA] rounded-full mb-2 hover:bg-[#4B6073] transition-colors" />
              <div className="w-full flex items-center justify-between text-xs px-2">
                <span className="font-heading font-bold text-sm text-[#12263A]">
                  {filteredReports.length} problems in Peshawar
                </span>
                <span className="text-xs font-bold text-[#0E6B73] flex items-center gap-1">
                  <span>{bottomSheetExpanded ? "Hide List" : "View List"}</span>
                  <ChevronUp
                    className={`w-4 h-4 transition-transform ${
                      bottomSheetExpanded ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </div>
            </div>

            {/* Expanded List on Mobile */}
            {bottomSheetExpanded && (
              <div className="flex-1 overflow-y-auto px-4 divide-y divide-[#C9D4DA]/40 max-h-[45dvh] p-2 space-y-2">
                {filteredReports.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#4B6073] space-y-1.5">
                    <p className="font-bold text-[#12263A]">No active reports in Peshawar</p>
                    <p className="text-[11px] leading-relaxed">{t.noProblemsNear}</p>
                  </div>
                ) : (
                  filteredReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => {
                      setSelectedReport(report);
                      setBottomSheetExpanded(false);
                    }}
                    className="p-3 rounded-xl bg-slate-50 flex items-center justify-between gap-2.5 active:bg-slate-100 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <DropletPin
                        severity={report.status === "verified_fixed" ? "fixed" : report.severity}
                        size={24}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#12263A] truncate">
                          {t.types[report.type]}
                        </div>
                        <div className="text-[11px] text-[#4B6073]">
                          {report.areaName || "Peshawar"} • 👥 {report.confirmationsCount} confirmed
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#0E6B73] shrink-0">
                      View →
                    </span>
                  </div>
                ))
              )}
              </div>
            )}

            {/* Primary Report Button */}
            <div className="p-2.5 sm:p-3 bg-white border-t border-[#C9D4DA]/50 flex items-center justify-center">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="w-full max-w-sm h-12 sm:h-14 bg-gradient-to-r from-[#0E6B73] to-[#095259] active:scale-98 text-white rounded-2xl font-heading font-bold text-sm sm:text-base shadow-lg shadow-[#0E6B73]/30 flex items-center justify-center gap-2.5 transition-transform"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white" />
                </div>
                <span className="text-white font-bold">{t.reportProblem}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        defaultLocation={pickedLocation}
        onRequestPickLocation={() => setIsPickingLocation(true)}
        onReportCreated={(newRep) => {
          setReports((prev) => [newRep, ...prev]);
          setSelectedReport(newRep);
        }}
      />

      {/* Report Detail & Fix Verification Drawer */}
      <ReportDetailDrawer
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onReportUpdated={(updated) => {
          setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          setSelectedReport(updated);
        }}
      />

      {/* AI Safe Route & Manhole Radar Modal */}
      <SafeRouteModal
        isOpen={isSafeRouteModalOpen}
        onClose={() => setIsSafeRouteModalOpen(false)}
        onRouteCalculated={(route) => {
          setActiveRoute(route);
          setRadarActive(true);
        }}
        radarActive={radarActive}
        onToggleRadar={(active) => setRadarActive(active)}
      />
    </div>
  );
}
