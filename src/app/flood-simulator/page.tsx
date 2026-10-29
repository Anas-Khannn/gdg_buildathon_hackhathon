"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { useLanguage } from "@/components/language-provider";
import { emergencyAudio } from "@/lib/audio-siren";
import type {
  SimulationResponse,
  BasinSimulationResult,
} from "@/types/simulation";
import {
  Waves,
  CloudRain,
  AlertTriangle,
  ShieldCheck,
  Volume2,
  Play,
  Square,
  Sparkles,
  Share2,
  Printer,
  Sliders,
  Radio,
  Building2,
  Clock,
  ArrowLeft,
  TrendingDown,
  Gauge,
  PhoneCall,
  RefreshCw,
  MapPin,
  CheckCircle2,
} from "lucide-react";

export default function FloodSimulatorPage() {
  const { t, language } = useLanguage();

  const [rainMm, setRainMm] = useState<number>(45);
  const [scenarioName, setScenarioName] = useState<string>("Heavy Monsoon Downpour (45mm/hr)");
  const [useLiveWeather, setUseLiveWeather] = useState<boolean>(false);
  const [mitigatedBasins, setMitigatedBasins] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<SimulationResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"basins" | "directives" | "broadcast">("basins");

  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isSirenOn, setIsSirenOn] = useState<boolean>(false);

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
      }
    } catch (err) {
      console.error("Failed to load simulation:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulation();
    return () => {
      emergencyAudio.stopSpeaking();
      emergencyAudio.stopSiren();
    };
  }, []);

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

    setTimeout(() => {
      emergencyAudio.stopSiren();
      setIsSirenOn(false);

      emergencyAudio.speakAnnouncement(textToSpeak, lang, () => {
        setIsPlayingAudio(false);
      });
    }, 1400);
  };

  const stopAudio = () => {
    emergencyAudio.stopSpeaking();
    emergencyAudio.stopSiren();
    setIsPlayingAudio(false);
    setIsSirenOn(false);
  };

  const handleShareWhatsApp = () => {
    if (!data) return;
    const advisory = data.aiAdvisory;
    const text = `🚨 *AQUASENTINEL PESHAWAR MONSOON FLOOD ALERT* 🚨\n\n🌧️ *Rainfall Intensity:* ${data.rainMmPerHour} mm/hr (${data.scenarioName})\n🌊 *Projected Storm Runoff:* ${data.totalRunoffMillionLiters} Million Liters/hr\n⚠️ *Critical Inundated Basins:* ${data.criticalBasinsCount}\n\n📢 *CITIZEN TRAVEL ADVISORY:*\n${advisory.citizenAdvisoryEn}\n\n🇵🇰 *اردو الرٹ:*\n${advisory.citizenAdvisoryUr}\n\n🕌 *مسجد اعلان:*\n${advisory.mosqueBroadcastScriptUr}\n\n📞 *Emergency Helplines:* WSSP: 1334 | PDMA: 1700 | Rescue: 1122\n🌐 *Live Map:* https://gdg-buildathon-hackhathon.vercel.app`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#EAF0F2] flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {/* Navigation Breadcrumb & Hero */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E6B73] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Peshawar Live Map</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0E6B73] to-[#095259] text-white flex items-center justify-center shadow-md">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#12263A] tracking-tight leading-none">
                  {language === "ur"
                    ? "ایکوا ٹوئن: اے آئی سیلاب پیش گوئی سمیلیٹر"
                    : language === "ps"
                    ? "ایکوا ټوین: د سېلاب وړاندوینې سمیلیټر"
                    : "AquaTwin: AI Monsoon Inundation Simulator"}
                </h1>
                <p className="text-xs sm:text-sm text-[#4B6073] mt-0.5">
                  Urban Hydrological Digital Twin for Peshawar • Powered by Google Gemini 1.5 Flash
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchSimulation()}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#12263A] text-xs font-bold transition border border-[#C9D4DA] flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Calculation</span>
            </button>

            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-[#0E6B73] hover:bg-[#095259] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>View Map View</span>
            </Link>
          </div>
        </div>

        {/* Rain Control Command Card */}
        <div className="p-4 sm:p-6 bg-white rounded-3xl border border-[#C9D4DA] shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E6B73] flex items-center gap-1.5">
                <CloudRain className="w-4 h-4" />
                Monsoon Rain Simulation Scenario
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-3xl font-extrabold text-[#12263A]">
                  {rainMm} mm/hr
                </span>
                <span className="text-xs font-medium text-[#4B6073]">
                  ({scenarioName})
                </span>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setPreset("Live Open-Meteo Weather", 15, true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  useLiveWeather
                    ? "bg-[#0E6B73] text-white shadow-sm"
                    : "bg-slate-100 text-[#12263A] hover:bg-slate-200"
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>Live Weather</span>
              </button>

              <button
                onClick={() => setPreset("Passing Monsoon Shower (20mm)", 20, false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  rainMm === 20 && !useLiveWeather
                    ? "bg-[#0E6B73] text-white shadow-sm"
                    : "bg-slate-100 text-[#12263A] hover:bg-slate-200"
                }`}
              >
                20mm Shower
              </button>

              <button
                onClick={() => setPreset("Heavy Monsoon Storm (45mm)", 45, false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  rainMm === 45 && !useLiveWeather
                    ? "bg-[#0E6B73] text-white shadow-sm"
                    : "bg-slate-100 text-[#12263A] hover:bg-slate-200"
                }`}
              >
                45mm Downpour
              </button>

              <button
                onClick={() => setPreset("Extreme Cloudburst (75mm)", 75, false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  rainMm === 75 && !useLiveWeather
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                }`}
              >
                75mm Cloudburst
              </button>
            </div>
          </div>

          {/* Range Slider */}
          <div className="space-y-1">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-[#4B6073]">0 mm/hr (Dry)</span>
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
                className="flex-1 h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0E6B73]"
              />
              <span className="text-xs font-bold text-red-600">100 mm/hr (Cloudburst)</span>
            </div>
            <div className="text-[11px] text-[#4B6073] flex justify-between px-1">
              <span>Light Drizzle</span>
              <span>Moderate Rain (25mm)</span>
              <span>Flash Flood Risk (50mm)</span>
              <span>Extreme (80mm+)</span>
            </div>
          </div>
        </div>

        {/* Metric Cards Row */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#C9D4DA] shadow-xs flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  data.cityRiskIndex >= 70
                    ? "bg-red-500/20 text-red-600"
                    : data.cityRiskIndex >= 40
                    ? "bg-amber-500/20 text-amber-700"
                    : "bg-emerald-500/20 text-emerald-700"
                }`}
              >
                <Gauge className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#4B6073] block">
                  City Risk Index
                </span>
                <span className="font-heading text-2xl font-bold text-[#12263A] leading-none">
                  {data.cityRiskIndex} / 100
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#C9D4DA] shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#0E6B73]/15 text-[#0E6B73] flex items-center justify-center shrink-0">
                <Waves className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#4B6073] block">
                  Total Storm Runoff
                </span>
                <span className="font-heading text-2xl font-bold text-[#12263A] leading-none">
                  {data.totalRunoffMillionLiters}M L/hr
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#C9D4DA] shadow-xs flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  data.criticalBasinsCount > 0
                    ? "bg-red-500/20 text-red-600 animate-pulse"
                    : "bg-emerald-500/20 text-emerald-700"
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#4B6073] block">
                  Critical Catchments
                </span>
                <span className="font-heading text-2xl font-bold text-[#12263A] leading-none">
                  {data.criticalBasinsCount} of 8
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#C9D4DA] shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#4B6073] block">
                  What-If Cleared
                </span>
                <span className="font-heading text-2xl font-bold text-emerald-700 leading-none">
                  {data.mitigatedBasinsCount} Basins
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#C9D4DA] pb-2">
          <button
            onClick={() => setActiveTab("basins")}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeTab === "basins"
                ? "bg-[#0E6B73] text-white shadow-sm"
                : "bg-white text-[#4B6073] hover:text-[#12263A] border border-[#C9D4DA]"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>8 Peshawar Catchments & What-If Sandbox</span>
          </button>

          <button
            onClick={() => setActiveTab("directives")}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeTab === "directives"
                ? "bg-[#0E6B73] text-white shadow-sm"
                : "bg-white text-[#4B6073] hover:text-[#12263A] border border-[#C9D4DA]"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>WSSP Municipal Directive</span>
          </button>

          <button
            onClick={() => setActiveTab("broadcast")}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeTab === "broadcast"
                ? "bg-[#0E6B73] text-white shadow-sm"
                : "bg-white text-[#4B6073] hover:text-[#12263A] border border-[#C9D4DA]"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Mosque Audio Broadcast</span>
            {isPlayingAudio && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>
        </div>

        {/* TAB 1: 8 Catchment Basins & What-If Sandbox */}
        {activeTab === "basins" && data && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-900 flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>What-If Desilting Sandbox:</strong> Toggle the switch on any catchment to simulate immediate municipal drain clearing. Watch how the predicted waterlogging depth drops and see how many million liters of flooding are averted!
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.basinResults.map((item: BasinSimulationResult) => {
                const isCritical =
                  item.riskLevel === "catastrophic" ||
                  item.riskLevel === "severe";

                const displayName =
                  language === "ur"
                    ? item.basin.nameUr
                    : language === "ps"
                    ? item.basin.namePs
                    : item.basin.name;

                return (
                  <div
                    key={item.basin.id}
                    className={`p-5 rounded-3xl border transition-all ${
                      item.isMitigated
                        ? "bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20"
                        : isCritical
                        ? "bg-red-50/50 border-red-300 shadow-sm"
                        : "bg-white border-[#C9D4DA]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-full ${
                              item.riskLevel === "catastrophic"
                                ? "bg-purple-600 animate-ping"
                                : item.riskLevel === "severe"
                                ? "bg-red-600"
                                : item.riskLevel === "minor"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          <h3 className="font-heading text-base font-bold text-[#12263A]">
                            {displayName}
                          </h3>
                        </div>
                        <p className="text-xs text-[#4B6073] mt-1 leading-relaxed">
                          {item.basin.description}
                        </p>
                      </div>

                      {/* What-If Switch */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.isMitigated}
                            onChange={() => toggleMitigation(item.basin.id)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                        <span className="text-[10px] font-bold text-[#4B6073]">
                          {item.isMitigated ? "Simulated Clean" : "Live Reports"}
                        </span>
                      </div>
                    </div>

                    {/* Hydrological Metrics Grid */}
                    <div className="mt-4 grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-white border border-[#C9D4DA]/70 text-center">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#4B6073] block">
                          Water Depth
                        </span>
                        <span
                          className={`font-heading text-lg font-bold ${
                            isCritical ? "text-red-600" : "text-[#12263A]"
                          }`}
                        >
                          {item.inundationDepthCm} cm
                        </span>
                        <span className="text-[10px] text-[#4B6073] block">
                          ({item.inundationDepthInches} in)
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#4B6073] block">
                          Runoff Volume
                        </span>
                        <span className="font-heading text-lg font-bold text-[#0E6B73]">
                          {item.runoffMillionLitersPerHour}M L/hr
                        </span>
                        <span className="text-[10px] text-[#4B6073] block">
                          Discharge: {item.effectiveCapacityM3s} m³/s
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#4B6073] block">
                          Time to Ponding
                        </span>
                        <span className="font-heading text-lg font-bold text-[#12263A] flex items-center justify-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#4B6073]" />
                          {item.timeToPondingMinutes > 180 ? ">3h" : `${item.timeToPondingMinutes}m`}
                        </span>
                        <span className="text-[10px] text-[#4B6073] block">
                          {item.activeBlockagesCount} Choked Drains
                        </span>
                      </div>
                    </div>

                    {item.isMitigated && item.waterAvertedLitersPerHour ? (
                      <div className="mt-3 flex items-center justify-between text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl">
                        <span className="flex items-center gap-1.5">
                          <TrendingDown className="w-4 h-4 text-emerald-600" />
                          Flooding Averted by Desilting:
                        </span>
                        <span>
                          {(item.waterAvertedLitersPerHour / 1000000).toFixed(1)} Million Liters/hr
                        </span>
                      </div>
                    ) : null}

                    {/* Critical Assets */}
                    <div className="mt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B6073] block">
                        Protected Infrastructure & Key Roads:
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {item.basin.criticalAssets.map((asset, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-[#12263A] border border-slate-200"
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

        {/* TAB 2: WSSP Operational Directives */}
        {activeTab === "directives" && data && (
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-gradient-to-r from-[#12263A] to-[#162e45] text-white space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Autonomous Municipal Operations Brief (WSSP Peshawar & PDMA)
              </span>
              <p className="text-sm text-slate-200 leading-relaxed">
                {language === "ur"
                  ? data.aiAdvisory.summaryUr
                  : language === "ps"
                  ? data.aiAdvisory.summaryPs
                  : data.aiAdvisory.summaryEn}
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Citizen Travel & Safe Detour Advisory
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed">
                {language === "ur"
                  ? data.aiAdvisory.citizenAdvisoryUr
                  : language === "ps"
                  ? data.aiAdvisory.citizenAdvisoryPs
                  : data.aiAdvisory.citizenAdvisoryEn}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#12263A]">
                Tactical Zone Mobilization Orders
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.aiAdvisory.wsspDirectives.map((dir, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-3xl bg-white border border-[#C9D4DA] space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-[#0E6B73]">
                        {dir.zone} • {dir.location}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          dir.urgency === "immediate"
                            ? "bg-red-500/20 text-red-700 border border-red-500/30"
                            : "bg-amber-500/20 text-amber-700 border border-amber-500/30"
                        }`}
                      >
                        {dir.urgency}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-[#12263A] leading-relaxed">
                      {language === "ur" && dir.actionUr
                        ? dir.actionUr
                        : language === "ps" && dir.actionPs
                        ? dir.actionPs
                        : dir.action}
                    </p>

                    <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
                      <div>
                        <span className="font-bold text-[#4B6073]">Equipment: </span>
                        <span className="text-[#12263A]">{dir.equipment}</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#4B6073]">Protected Assets: </span>
                        <span className="text-[#0E6B73] font-semibold">{dir.assetsProtected}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Mosque Audio Broadcast */}
        {activeTab === "broadcast" && data && (
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#12263A] via-[#162e45] to-[#0E6B73] text-white space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-600/30 border border-red-400/40 flex items-center justify-center">
                    <Radio className="w-5 h-5 text-red-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-white leading-none">
                      Mosque Loudspeaker & Audio Broadcast Player
                    </h3>
                    <p className="text-xs text-[#C9D4DA] mt-0.5">
                      Synthesized municipal dual-tone siren followed by authentic Urdu/Pashto announcement
                    </p>
                  </div>
                </div>

                {isPlayingAudio && (
                  <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-red-600 text-white animate-pulse">
                    Broadcasting Live...
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {!isPlayingAudio ? (
                  <>
                    <button
                      onClick={() =>
                        handleStartAudio(data.aiAdvisory.mosqueBroadcastScriptUr, "ur")
                      }
                      className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>اردو مسجد اعلان چلائیں (Play Urdu)</span>
                    </button>

                    <button
                      onClick={() =>
                        handleStartAudio(data.aiAdvisory.mosqueBroadcastScriptPs, "ps")
                      }
                      className="px-5 py-3 rounded-2xl bg-[#0E6B73] hover:bg-[#095259] text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 border border-white/20 shadow-md cursor-pointer active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>د پښتو اعلان غږول (Play Pashto)</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={stopAudio}
                    className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>Stop Broadcast (اعلان بند کریں)</span>
                  </button>
                )}

                <button
                  onClick={handleShareWhatsApp}
                  className="ml-auto px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#12263A] text-xs sm:text-sm font-extrabold transition flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share on WhatsApp (واٹس ایپ الرٹ)</span>
                </button>
              </div>
            </div>

            {/* Scripts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-[#C9D4DA] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading text-xs font-bold uppercase text-[#12263A] tracking-wider">
                    Urdu Announcement Script
                  </h4>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(data.aiAdvisory.mosqueBroadcastScriptUr)
                    }
                    className="text-xs font-bold text-[#0E6B73] hover:underline"
                  >
                    Copy
                  </button>
                </div>
                <p
                  dir="rtl"
                  className="text-sm text-slate-800 leading-relaxed font-urdu p-4 rounded-2xl bg-[#EAF0F2]/40 border border-[#C9D4DA]/50"
                >
                  {data.aiAdvisory.mosqueBroadcastScriptUr}
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#C9D4DA] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading text-xs font-bold uppercase text-[#12263A] tracking-wider">
                    Pashto Announcement Script
                  </h4>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(data.aiAdvisory.mosqueBroadcastScriptPs)
                    }
                    className="text-xs font-bold text-[#0E6B73] hover:underline"
                  >
                    Copy
                  </button>
                </div>
                <p
                  dir="rtl"
                  className="text-sm text-slate-800 leading-relaxed font-urdu p-4 rounded-2xl bg-[#EAF0F2]/40 border border-[#C9D4DA]/50"
                >
                  {data.aiAdvisory.mosqueBroadcastScriptPs}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

