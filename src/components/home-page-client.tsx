"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/header";
import { MapWrapper } from "@/components/map/map-wrapper";
import type { ReportItem } from "@/types/report";
import { ReportModal } from "@/components/report-modal";
import { ReportDetailDrawer } from "@/components/report-detail-drawer";
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

    return () => clearInterval(interval);
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
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#EAF0F2]">
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

          {/* Desktop Report Button */}
          <div className="p-3.5 border-t border-[#C9D4DA] bg-white">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0E6B73] to-[#095259] hover:from-[#095259] hover:to-[#0E6B73] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 active:scale-98"
            >
              <Camera className="w-5 h-5 fill-white" />
              <span>{t.reportProblem}</span>
            </button>
          </div>
        </aside>

        {/* ===================================================================
            MAP HERO CONTAINER (Fills screen)
           =================================================================== */}
        <div className="flex-1 relative h-full min-h-0">
          {/* Mobile Top Floating Filter Chips */}
          <div className="md:hidden absolute top-3 inset-x-3 z-20 flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto py-1">
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

          {/* The Leaflet Live Map */}
          <MapWrapper
            reports={filteredReports}
            selectedReport={selectedReport}
            onSelectReport={(r) => setSelectedReport(r)}
            avoidRoadLayer={avoidRoadLayer}
            pickedLocation={pickedLocation}
            isPickingLocation={isPickingLocation}
            onPickLocation={(coords) => {
              if (isPickingLocation) {
                setPickedLocation(coords);
                setIsPickingLocation(false);
                setIsReportModalOpen(true);
              }
            }}
          />

          {/* ===================================================================
              MOBILE BOTTOM SHEET (24px top radius) & 64px Button (DESIGN 6.1)
             =================================================================== */}
          <div
            className={`md:hidden absolute inset-x-0 bottom-0 z-30 bg-white rounded-t-[28px] shadow-[0_-10px_35px_rgba(18,38,58,0.2)] border-t border-[#C9D4DA] transition-all duration-300 flex flex-col ${
              bottomSheetExpanded ? "max-h-[75vh]" : "max-h-[145px]"
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
              <div className="flex-1 overflow-y-auto px-4 divide-y divide-[#C9D4DA]/40 max-h-[50vh] p-2 space-y-2">
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
                    className="p-3 rounded-xl bg-slate-50 flex items-center justify-between gap-2.5"
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

            {/* Signature 64px Primary Report Button (DESIGN Section 4 & 6.1) */}
            <div className="p-3.5 bg-white border-t border-[#C9D4DA]/50 flex items-center justify-center">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="w-full max-w-sm h-14 bg-gradient-to-r from-[#0E6B73] to-[#095259] active:scale-98 text-white rounded-2xl font-heading font-bold text-base shadow-lg shadow-[#0E6B73]/30 flex items-center justify-center gap-3 transition-transform"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Camera className="w-5 h-5 fill-white text-white" />
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
    </div>
  );
}
