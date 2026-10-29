"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/language-provider";
import { emergencyAudio } from "@/lib/audio-siren";
import type {
  SimulationResponse,
  BasinSimulationResult,
  FloodRiskLevel,
} from "@/types/simulation";
import {
  Waves,
  CloudRain,
  AlertTriangle,
  ShieldCheck,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Share2,
  Printer,
  X,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Radio,
  Building2,
  Clock,
  ArrowRight,
  TrendingDown,
  Gauge,
  PhoneCall,
} from "lucide-react";

interface FloodSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToMap?: (response: SimulationResponse) => void;
}

export function FloodSimulatorModal({
  isOpen,
  onClose,
  onApplyToMap,
}: FloodSimulatorModalProps) {
  const { t, language } = useLanguage();

  // Simulation Controls
  const [rainMm, setRainMm] = useState<number>(40);
  const [scenarioName, setScenarioName] = useState<string>("Monsoon Storm (40mm/hr)");
  const [useLiveWeather, setUseLiveWeather] = useState<boolean>(false);
  const [mitigatedBasins, setMitigatedBasins] = useState<Set<string>>(new Set());

  // Simulation Data
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<SimulationResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"basins" | "directives" | "broadcast">("basins");

  // Audio Playback State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isSirenOn, setIsSirenOn] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const audioIntervalRef = useRef<any>(null);

  // Fetch simulation
  const fetchSimulation = async (
    rainOverride?: number,
    scenarioOverride?: string,
    liveWeatherOverride?: boolean,
    mitigatedOverride?: Set<string>
  ) => {
    setLoading(true);
    try {
      const activeMitigated = mitigatedOverride !== undefined ? mitigatedOverride : mitigatedBasins;
      const res = await fetch("/api/flood-simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rainMmPerHour: rainOverride !== undefined ? rainOverride : rainMm,
          scenarioName: scenarioOverride || scenarioName,
          useLiveWeather: liveWeatherOverride !== undefined ? liveWeatherOverride : useLiveWeather,
          mitigatedBasinIds: Array.from(activeMitigated),
        }),
      });

      if (res.ok) {
        const json: SimulationResponse = await res.json();
        setData(json);
        if (rainOverride !== undefined) setRainMm(json.rainMmPerHour);
        if (onApplyToMap) {
          onApplyToMap(json);
        }
      }
    } catch (err) {
      console.error("Failed to load simulation:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !data) {
      fetchSimulation();
    }
  }, [isOpen]);

  // Clean up audio on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopAudio();
    }
  }, [isOpen]);

  const toggleMitigation = (basinId: string) => {
    const next = new Set(mitigatedBasins);
    if (next.has(basinId)) {
      next.delete(basinId);
    } else {
      next.add(basinId);
    }
    setMitigatedBasins(next);
    fetchSimulation(undefined, undefined, undefined, next);
  };

  const setPreset = (name: string, mm: number, isLive: boolean = false) => {
    setScenarioName(name);
    setRainMm(mm);
    setUseLiveWeather(isLive);
    fetchSimulation(mm, name, isLive);
  };

  const handleStartAudio = (textToSpeak: string, lang: "ur" | "ps") => {
    emergencyAudio.playAlertBeep();
    setIsPlayingAudio(true);
    setIsSirenOn(true);
    emergencyAudio.startSiren();

    // After brief 1.2s siren intro, begin voice broadcast
    setTimeout(() => {
      emergencyAudio.stopSiren();
      setIsSirenOn(false);

      const spoken = emergencyAudio.speakAnnouncement(textToSpeak, lang, () => {
        setIsPlayingAudio(false);
        setAudioProgress(0);
        if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      });

      if (spoken) {
        let p = 0;
        audioIntervalRef.current = setInterval(() => {
          p += 5;
          if (p >= 100) {
            clearInterval(audioIntervalRef.current);
          }
          setAudioProgress(Math.min(100, p));
        }, 1000);
      }
    }, 1400);
  };

  const stopAudio = () => {
    emergencyAudio.stopSpeaking();
    emergencyAudio.stopSiren();
    setIsPlayingAudio(false);
    setIsSirenOn(false);
    setAudioProgress(0);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
  };

  const handleShareWhatsApp = () => {
    if (!data) return;
    const advisory = data.aiAdvisory;
    const text = `🚨 *NAALIWATCH PESHAWAR MONSOON FLOOD ALERT* 🚨\n\n🌧️ *Rainfall Intensity:* ${data.rainMmPerHour} mm/hr (${data.scenarioName})\n🌊 *Projected Storm Runoff:* ${data.totalRunoffMillionLiters} Million Liters\n⚠️ *Critical Inundated Basins:* ${data.criticalBasinsCount}\n\n📢 *CITIZEN TRAVEL ADVISORY:*\n${advisory.citizenAdvisoryEn}\n\n🇵🇰 *اردو الرٹ:*\n${advisory.citizenAdvisoryUr}\n\n🕌 *مسجد اعلان:*\n${advisory.mosqueBroadcastScriptUr}\n\n📞 *Emergency Helplines:* WSSP: 1334 | PDMA: 1700 | Rescue: 1122\n🌐 *Live Map:* https://naaliwatch-peshawar.gov.pk`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#C9D4DA] overflow-hidden flex flex-col max-h-[92dvh] my-auto">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#12263A] via-[#162e45] to-[#0E6B73] text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
              <Waves className="w-5 h-5 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-white leading-none">
                  {language === "ur"
                    ? "نالی ٹوئن: اے آئی سیلاب پیش گوئی سمیلیٹر"
                    : language === "ps"
                    ? "نالي ټوین: د سېلاب د وړاندوینې AI سمیلیټر"
                    : "NaaliTwin: AI Monsoon Inundation Simulator"}
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Hydro-Grid
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#C9D4DA] mt-0.5">
                {language === "ur"
                  ? "پشاور کے 8 طاسوں میں بارش کے بہاؤ اور بند نالوں کے اثرات کا سائنسی تخمینہ"
                  : "Rational Method Runoff Engine ($Q=CIA/360$) & Real-time Choke Analysis"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchSimulation()}
              disabled={loading}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer disabled:opacity-50"
              title="Refresh Simulation"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-red-500/30 text-white hover:text-red-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rain Scenario Slider & Presets Toolbar */}
        <div className="p-3 sm:p-4 bg-[#EAF0F2]/70 border-b border-[#C9D4DA] space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#12263A]">
              <CloudRain className="w-4 h-4 text-[#0E6B73]" />
              <span>
                {language === "ur" ? "بارش کی شدت:" : "Rainfall Intensity:"}{" "}
                <span className="text-base text-[#0E6B73] font-extrabold">
                  {rainMm} mm/hr
                </span>
              </span>
              <span className="text-[11px] font-normal text-[#4B6073]">
                ({scenarioName})
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setPreset("Live Open-Meteo Weather", 15, true)}
                className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  useLiveWeather
                    ? "bg-[#0E6B73] text-white shadow-sm"
                    : "bg-white text-[#12263A] border border-[#C9D4DA] hover:bg-slate-100"
                }`}
              >
                <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                <span>Live Weather</span>
              </button>

              <button
                onClick={() => setPreset("Passing Monsoon Shower (20mm)", 20, false)}
                className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                  rainMm === 20 && !useLiveWeather
                    ? "bg-[#0E6B73] text-white shadow-sm"
                    : "bg-white text-[#12263A] border border-[#C9D4DA] hover:bg-slate-100"
                }`}
              >
                20mm Shower
              </button>

              <button
                onClick={() => setPreset("Heavy Monsoon Storm (45mm)", 45, false)}
                className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                  rainMm === 45 && !useLiveWeather
                    ? "bg-[#0E6B73] text-white shadow-sm"
                    : "bg-white text-[#12263A] border border-[#C9D4DA] hover:bg-slate-100"
                }`}
              >
                45mm Downpour
              </button>

              <button
                onClick={() => setPreset("Extreme Cloudburst (75mm)", 75, false)}
                className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                  rainMm === 75 && !useLiveWeather
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-white text-red-700 border border-red-200 hover:bg-red-50"
                }`}
              >
                75mm Cloudburst
              </button>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-[#4B6073]">0 mm</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={rainMm}
              onChange={(e) => {
                const val = Number(e.target.value);
                setRainMm(val);
                setUseLiveWeather(false);
                setScenarioName(`Custom Simulation (${val} mm/hr)`);
              }}
              onMouseUp={() => fetchSimulation()}
              onTouchEnd={() => fetchSimulation()}
              className="flex-1 h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#0E6B73]"
            />
            <span className="text-[11px] font-bold text-red-600">100 mm</span>
          </div>
        </div>

        {/* City-Wide KPI Metric Cards Strip */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:p-4 bg-white border-b border-[#C9D4DA] shrink-0">
            {/* City Risk Score */}
            <div className="p-3 rounded-2xl bg-[#EAF0F2]/60 border border-[#C9D4DA]/70 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  data.cityRiskIndex >= 70
                    ? "bg-red-500/20 text-red-600 border border-red-500/30"
                    : data.cityRiskIndex >= 40
                    ? "bg-amber-500/20 text-amber-700 border border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-700 border border-emerald-500/30"
                }`}
              >
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B6073] block">
                  City Risk Index
                </span>
                <span className="font-heading text-lg font-bold text-[#12263A] leading-none">
                  {data.cityRiskIndex} / 100
                </span>
              </div>
            </div>

            {/* Runoff Volume */}
            <div className="p-3 rounded-2xl bg-[#EAF0F2]/60 border border-[#C9D4DA]/70 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0E6B73]/15 text-[#0E6B73] border border-[#0E6B73]/20 flex items-center justify-center shrink-0">
                <Waves className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B6073] block">
                  Total Runoff Flow
                </span>
                <span className="font-heading text-lg font-bold text-[#12263A] leading-none">
                  {data.totalRunoffMillionLiters}M L/hr
                </span>
              </div>
            </div>

            {/* Critical Basins */}
            <div className="p-3 rounded-2xl bg-[#EAF0F2]/60 border border-[#C9D4DA]/70 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  data.criticalBasinsCount > 0
                    ? "bg-red-500/20 text-red-600 border border-red-500/30 animate-pulse"
                    : "bg-emerald-500/20 text-emerald-700 border border-emerald-500/30"
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B6073] block">
                  Critical Basins
                </span>
                <span className="font-heading text-lg font-bold text-[#12263A] leading-none">
                  {data.criticalBasinsCount} of 8
                </span>
              </div>
            </div>

            {/* What-If Mitigated Basins */}
            <div className="p-3 rounded-2xl bg-[#EAF0F2]/60 border border-[#C9D4DA]/70 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B6073] block">
                  What-If Cleared
                </span>
                <span className="font-heading text-lg font-bold text-emerald-700 leading-none">
                  {data.mitigatedBasinsCount} Basins
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation Segmented Bar */}
        <div className="flex items-center px-4 pt-2.5 pb-1 bg-white border-b border-[#C9D4DA]/70 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("basins")}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "basins"
                ? "bg-[#0E6B73] text-white shadow-sm"
                : "text-[#4B6073] hover:text-[#12263A] hover:bg-slate-100"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>
              {language === "ur"
                ? "طاس اور صفائی سمیلیشن"
                : "8 Catchment Basins & Mitigation"}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("directives")}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "directives"
                ? "bg-[#0E6B73] text-white shadow-sm"
                : "text-[#4B6073] hover:text-[#12263A] hover:bg-slate-100"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>
              {language === "ur"
                ? "ڈبلیو ایس ایس پی ہنگامی احکامات"
                : "WSSP Municipal Directive"}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("broadcast")}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "broadcast"
                ? "bg-[#0E6B73] text-white shadow-sm"
                : "text-[#4B6073] hover:text-[#12263A] hover:bg-slate-100"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>
              {language === "ur"
                ? "مسجد اور پبلک اعلان"
                : "Mosque / Loudspeaker Audio"}
            </span>
            {isPlayingAudio && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>
        </div>

        {/* Main Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-[#FAFCFD]">
          {loading && !data && (
            <div className="p-12 text-center text-xs text-[#4B6073] flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#0E6B73] animate-spin" />
              <p className="font-heading font-bold text-sm text-[#12263A]">
                Calculating Peshawar Hydrological Runoff ($Q=CIA/360$)...
              </p>
            </div>
          )}

          {/* TAB 1: 8 Catchment Basins & What-If Sandbox */}
          {activeTab === "basins" && data && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    {language === "ur"
                      ? "کسی بھی نالے کو صاف کر کے دیکھیں (What-If): نیچے سوئچ دبانے سے پانی کی کمی کا فوری مشاہدہ کریں۔"
                      : "Interactive 'What-If' Sandbox: Toggle 'Simulate Desilting' on any basin to see flood depth plummet in real time."}
                  </span>
                </div>
                {onApplyToMap && (
                  <button
                    onClick={() => {
                      onApplyToMap(data);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#0E6B73] hover:bg-[#095259] text-white text-xs font-bold transition shrink-0 cursor-pointer"
                  >
                    View on Map ➔
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.basinResults.map((item: BasinSimulationResult) => {
                  const isCritical =
                    item.riskLevel === "catastrophic" ||
                    item.riskLevel === "severe";
                  const isSafe = item.riskLevel === "safe";

                  const displayName =
                    language === "ur"
                      ? item.basin.nameUr
                      : language === "ps"
                      ? item.basin.namePs
                      : item.basin.name;

                  return (
                    <div
                      key={item.basin.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        item.isMitigated
                          ? "bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20"
                          : isCritical
                          ? "bg-red-50/50 border-red-300 shadow-sm"
                          : "bg-white border-[#C9D4DA]/70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                item.riskLevel === "catastrophic"
                                  ? "bg-purple-600 animate-ping"
                                  : item.riskLevel === "severe"
                                  ? "bg-red-600"
                                  : item.riskLevel === "minor"
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                            />
                            <h4 className="font-heading text-sm font-bold text-[#12263A] truncate">
                              {displayName}
                            </h4>
                          </div>
                          <span className="text-[11px] text-[#4B6073] block truncate mt-0.5">
                            Elevation: {item.basin.elevationMeters}m • Area:{" "}
                            {item.basin.areaKm2} km²
                          </span>
                        </div>

                        {/* What-If Toggle Switch */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <label className="relative inline-flex items-center cursor-pointer" title="Simulate Cleaned Drain">
                            <input
                              type="checkbox"
                              checked={item.isMitigated}
                              onChange={() => toggleMitigation(item.basin.id)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                          <span className="text-[10px] font-bold text-[#4B6073]">
                            {item.isMitigated ? "Cleaned" : "Live"}
                          </span>
                        </div>
                      </div>

                      {/* Water Depth Gauge & Metrics */}
                      <div className="mt-3 grid grid-cols-3 gap-2 p-2 rounded-xl bg-white/80 border border-[#C9D4DA]/50 text-center">
                        <div>
                          <span className="text-[9px] font-bold uppercase text-[#4B6073] block">
                            Water Depth
                          </span>
                          <span
                            className={`font-heading text-sm font-bold ${
                              isCritical ? "text-red-600" : "text-[#12263A]"
                            }`}
                          >
                            {item.inundationDepthCm} cm
                          </span>
                          <span className="text-[9px] text-[#4B6073] block">
                            ({item.inundationDepthInches} in)
                          </span>
                        </div>

                        <div>
                          <span className="text-[9px] font-bold uppercase text-[#4B6073] block">
                            Runoff Flow
                          </span>
                          <span className="font-heading text-sm font-bold text-[#0E6B73]">
                            {item.runoffMillionLitersPerHour}M L/hr
                          </span>
                          <span className="text-[9px] text-[#4B6073] block">
                            Cap: {item.effectiveCapacityM3s} m³/s
                          </span>
                        </div>

                        <div>
                          <span className="text-[9px] font-bold uppercase text-[#4B6073] block">
                            Ponding Time
                          </span>
                          <span className="font-heading text-sm font-bold text-[#12263A] flex items-center justify-center gap-0.5">
                            <Clock className="w-3 h-3 text-[#4B6073]" />
                            {item.timeToPondingMinutes > 180 ? ">3h" : `${item.timeToPondingMinutes}m`}
                          </span>
                          <span className="text-[9px] text-[#4B6073] block">
                            {item.activeBlockagesCount} Choked
                          </span>
                        </div>
                      </div>

                      {/* Water Averted Pill if Mitigated */}
                      {item.isMitigated && item.waterAvertedLitersPerHour ? (
                        <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-xl">
                          <span className="flex items-center gap-1">
                            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                            Flood Inundation Averted:
                          </span>
                          <span>
                            {(item.waterAvertedLitersPerHour / 1000000).toFixed(1)}M Liters/hr
                          </span>
                        </div>
                      ) : null}

                      {/* Critical Assets List */}
                      <div className="mt-2.5">
                        <span className="text-[10px] font-bold text-[#4B6073] uppercase tracking-wider block">
                          Critical Assets at Risk:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.basin.criticalAssets.slice(0, 3).map((asset, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-[#12263A] border border-slate-200"
                            >
                              {asset}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: WSSP AI Operational Directive */}
          {activeTab === "directives" && data && (
            <div className="space-y-4">
              {/* Executive Summary */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#12263A] to-[#162e45] text-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    WSSP & PDMA Operational Command Brief
                  </span>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Directive</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {language === "ur"
                    ? data.aiAdvisory.summaryUr
                    : language === "ps"
                    ? data.aiAdvisory.summaryPs
                    : data.aiAdvisory.summaryEn}
                </p>
              </div>

              {/* Citizen Travel Advisory Card */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5">
                <h5 className="font-heading text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  {language === "ur" ? "شہریوں کے لیے سفری ہدایت نامہ" : "Public Commute & Safe Route Advisory"}
                </h5>
                <p className="text-xs leading-relaxed">
                  {language === "ur"
                    ? data.aiAdvisory.citizenAdvisoryUr
                    : language === "ps"
                    ? data.aiAdvisory.citizenAdvisoryPs
                    : data.aiAdvisory.citizenAdvisoryEn}
                </p>
              </div>

              {/* Action Orders per Zone */}
              <div className="space-y-2.5">
                <h5 className="font-heading text-xs font-bold uppercase tracking-wider text-[#12263A]">
                  Tactical Deployment Orders (WSSP Field Wings)
                </h5>

                {data.aiAdvisory.wsspDirectives.map((dir, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-white border border-[#C9D4DA] space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-[#0E6B73]">
                        {dir.zone} • {dir.location}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          dir.urgency === "immediate"
                            ? "bg-red-500/20 text-red-700 border border-red-500/30"
                            : "bg-amber-500/20 text-amber-700 border border-amber-500/30"
                        }`}
                      >
                        {dir.urgency}
                      </span>
                    </div>

                    <p className="text-xs text-[#12263A] font-semibold leading-relaxed">
                      {language === "ur" && dir.actionUr
                        ? dir.actionUr
                        : language === "ps" && dir.actionPs
                        ? dir.actionPs
                        : dir.action}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[#4B6073] font-bold">Equipment: </span>
                        <span className="text-[#12263A]">{dir.equipment}</span>
                      </div>
                      <div>
                        <span className="text-[#4B6073] font-bold">Protected Assets: </span>
                        <span className="text-[#0E6B73] font-semibold">{dir.assetsProtected}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Mosque Loudspeaker & WhatsApp Broadcast */}
          {activeTab === "broadcast" && data && (
            <div className="space-y-4">
              {/* Audio Announcer Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12263A] via-[#162e45] to-[#0E6B73] text-white space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-red-600/30 border border-red-400/40 flex items-center justify-center">
                      <Radio className="w-5 h-5 text-red-400 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-heading text-sm sm:text-base font-bold text-white leading-none">
                        {language === "ur"
                          ? "مسجد لاؤڈ اسپیکر و ہنگامی وائس براڈکاسٹ"
                          : "Mosque Loudspeaker & Audio Broadcast"}
                      </h4>
                      <span className="text-[11px] text-[#C9D4DA] mt-0.5 block">
                        Dual-tone siren alert + Urdu/Pashto natural synthesized voice
                      </span>
                    </div>
                  </div>

                  {isPlayingAudio && (
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-red-600 text-white animate-pulse">
                      Broadcasting...
                    </span>
                  )}
                </div>

                {/* Animated Soundwave Visualizer */}
                <div className="h-10 bg-black/30 rounded-xl px-4 flex items-center justify-center gap-1.5 border border-white/10">
                  {[40, 75, 20, 90, 60, 30, 85, 45, 100, 50, 70, 25, 80, 35, 95, 60].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        height: isPlayingAudio ? `${h}%` : "15%",
                        transition: "height 0.15s ease",
                      }}
                      className={`w-1 rounded-full ${
                        isPlayingAudio
                          ? isSirenOn
                            ? "bg-red-400 animate-ping"
                            : "bg-emerald-400"
                          : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>

                {/* Audio Controls */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {!isPlayingAudio ? (
                    <>
                      <button
                        onClick={() =>
                          handleStartAudio(data.aiAdvisory.mosqueBroadcastScriptUr, "ur")
                        }
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>اردو مسجد اعلان چلائیں (Play Urdu)</span>
                      </button>

                      <button
                        onClick={() =>
                          handleStartAudio(data.aiAdvisory.mosqueBroadcastScriptPs, "ps")
                        }
                        className="px-4 py-2.5 rounded-xl bg-[#0E6B73] hover:bg-[#095259] text-white text-xs font-bold transition flex items-center gap-2 border border-white/20 shadow-md cursor-pointer active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>د پښتو اعلان غږول (Play Pashto)</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={stopAudio}
                      className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      <span>Stop Broadcast (اعلان بند کریں)</span>
                    </button>
                  )}

                  <button
                    onClick={handleShareWhatsApp}
                    className="ml-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#12263A] text-xs font-extrabold transition flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share on WhatsApp (واٹس ایپ)</span>
                  </button>
                </div>
              </div>

              {/* Script Text Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-[#C9D4DA] space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-heading text-xs font-bold uppercase text-[#12263A] tracking-wider">
                      Urdu Public Announcement Script
                    </h5>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(data.aiAdvisory.mosqueBroadcastScriptUr)
                      }
                      className="text-[10px] font-bold text-[#0E6B73] hover:underline"
                    >
                      Copy Script
                    </button>
                  </div>
                  <p
                    dir="rtl"
                    className="text-xs text-slate-800 leading-relaxed font-urdu p-3 rounded-xl bg-[#EAF0F2]/40 border border-[#C9D4DA]/50"
                  >
                    {data.aiAdvisory.mosqueBroadcastScriptUr}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#C9D4DA] space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-heading text-xs font-bold uppercase text-[#12263A] tracking-wider">
                      Pashto Public Announcement Script
                    </h5>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(data.aiAdvisory.mosqueBroadcastScriptPs)
                      }
                      className="text-[10px] font-bold text-[#0E6B73] hover:underline"
                    >
                      Copy Script
                    </button>
                  </div>
                  <p
                    dir="rtl"
                    className="text-xs text-slate-800 leading-relaxed font-urdu p-3 rounded-xl bg-[#EAF0F2]/40 border border-[#C9D4DA]/50"
                  >
                    {data.aiAdvisory.mosqueBroadcastScriptPs}
                  </p>
                </div>
              </div>

              {/* Helplines Pill */}
              <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-[#4B6073]">
                <div className="flex items-center gap-1.5 font-bold text-[#12263A]">
                  <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                  <span>Emergency Response Numbers:</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="text-[#0E6B73]">WSSP: 1334</span>
                  <span className="text-amber-700">PDMA: 1700</span>
                  <span className="text-red-600">Rescue 1122</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#C9D4DA] flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-[#4B6073] hidden sm:block">
            {data ? (
              <span>
                Calculated for <strong>Peshawar Metropolitan Zone</strong> • Model: Rational Method + Gemini 1.5 Flash
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {onApplyToMap && data && (
              <button
                onClick={() => {
                  onApplyToMap(data);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-[#0E6B73] text-white text-xs font-bold transition shadow-sm hover:opacity-95 cursor-pointer"
              >
                Apply Simulation to Peshawar Live Map
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#12263A] text-xs font-bold transition border border-slate-300 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

