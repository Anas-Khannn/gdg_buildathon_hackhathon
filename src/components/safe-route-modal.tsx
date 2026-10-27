"use client";

import React, { useState } from "react";
import { useLanguage } from "@/components/language-provider";
import type { CommuteMode, SafeRouteLocation, SafeRouteResponse } from "@/types/route";
import {
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Bike,
  Car,
  Footprints,
  Radio,
  X,
  Compass,
  Sparkles,
  MapPin,
  CheckCircle2,
  Volume2,
} from "lucide-react";

interface SafeRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteCalculated: (route: SafeRouteResponse) => void;
  radarActive: boolean;
  onToggleRadar: (active: boolean) => void;
}

const PESHAWAR_LANDMARKS: SafeRouteLocation[] = [
  {
    name: "University of Peshawar / KTH",
    nameUr: "جامعہ پشاور / کے ٹی ایچ",
    namePs: "د پېښور پوهنتون / کے ټي ایچ",
    lat: 34.0086,
    lng: 71.488,
  },
  {
    name: "Hayatabad Phase 3",
    nameUr: "حیات آباد فیز ۳",
    namePs: "حیات اباد دریم فیز",
    lat: 33.985,
    lng: 71.436,
  },
  {
    name: "Saddar Bazar (Gora Qabristan)",
    nameUr: "صدر بازار پشاور",
    namePs: "صدر بازار",
    lat: 34.0055,
    lng: 71.537,
  },
  {
    name: "Lady Reading Hospital (LRH)",
    nameUr: "لیڈی ریڈنگ ہسپتال (ایل آر ایچ)",
    namePs: "لېډي ریډینګ روغتون",
    lat: 34.015,
    lng: 71.572,
  },
  {
    name: "Hashtnagri / Charsadda Rd",
    nameUr: "ہشت نگری / چارسدہ روڈ",
    namePs: "هشت نګري / چارسده سړک",
    lat: 34.02,
    lng: 71.583,
  },
  {
    name: "Kohati Gate (Old City)",
    nameUr: "کوہاٹی گیٹ (اندرونِ شہر)",
    namePs: "کوهاټي دروازه",
    lat: 34.009,
    lng: 71.577,
  },
  {
    name: "Ring Road (Pishtakhara)",
    nameUr: "رنگ روڈ پشاور",
    namePs: "رنګ روډ",
    lat: 33.978,
    lng: 71.52,
  },
  {
    name: "Gulbahar No. 2",
    nameUr: "گلبہار نمبر ۲",
    namePs: "ګلبهار نمبر ۲",
    lat: 34.0185,
    lng: 71.595,
  },
];

export function SafeRouteModal({
  isOpen,
  onClose,
  onRouteCalculated,
  radarActive,
  onToggleRadar,
}: SafeRouteModalProps) {
  const { language, t } = useLanguage();

  const [startPoint, setStartPoint] = useState<SafeRouteLocation>(PESHAWAR_LANDMARKS[1]); // Hayatabad
  const [endPoint, setEndPoint] = useState<SafeRouteLocation>(PESHAWAR_LANDMARKS[4]); // Hashtnagri / Charsadda Rd
  const [mode, setMode] = useState<CommuteMode>("bike");
  const [isLoading, setIsLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<SafeRouteResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);

  if (!isOpen) return null;

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingUser(false);
        const userLoc: SafeRouteLocation = {
          name: "My GPS Location",
          nameUr: "میری موجودہ لوکیشن",
          namePs: "زما اوسنی موقعیت",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setStartPoint(userLoc);
      },
      () => {
        setLocatingUser(false);
        alert("Unable to retrieve your location. Please select a landmark.");
      },
      { timeout: 7000 }
    );
  };

  const handleCalculateRoute = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/safe-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: startPoint,
          end: endPoint,
          mode,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to compute safe path");
      }

      const data: SafeRouteResponse = await res.json();
      setRouteResult(data);
      onRouteCalculated(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to calculate route");
    } finally {
      setIsLoading(false);
    }
  };

  const getLocalizedName = (loc: SafeRouteLocation) => {
    if (language === "ur" && loc.nameUr) return loc.nameUr;
    if (language === "ps" && loc.namePs) return loc.namePs;
    return loc.name;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#C9D4DA] overflow-hidden flex flex-col max-h-[90dvh]"
        dir={language === "ur" || language === "ps" ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="bg-[#12263A] text-white p-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-[#0E6B73] flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
              <Navigation className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold">
                  {language === "ur"
                    ? "محفوظ راستہ (AI Safe Navigator)"
                    : language === "ps"
                    ? "خوندي لاره (AI Navigator)"
                    : "Safe Route Navigator"}
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Flood Avoidance
                </span>
              </div>
              <p className="text-xs text-[#C9D4DA] mt-0.5">
                {language === "ur"
                  ? "پشاور میں کھلے مین ہول اور سیلابی پانی سے بچاؤ کی لائیو نیویگیشن"
                  : "Divert around submerged open manholes & flash flooding across Peshawar"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-[#12263A]">
          {/* Inputs Section */}
          <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Start Location */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#4B6073] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                  <span>{t.startLocation}</span>
                </label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locatingUser}
                  className="text-[11px] text-[#0E6B73] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3 h-3" />
                  <span>
                    {locatingUser
                      ? "Locating..."
                      : language === "ur"
                      ? "میری لوکیشن"
                      : "Use My GPS"}
                  </span>
                </button>
              </div>
              <select
                value={startPoint.name}
                onChange={(e) => {
                  const match = PESHAWAR_LANDMARKS.find((p) => p.name === e.target.value);
                  if (match) setStartPoint(match);
                }}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white text-[#12263A] focus:outline-none focus:ring-2 focus:ring-[#0E6B73]"
              >
                {startPoint.name === "My GPS Location" && (
                  <option value="My GPS Location">📍 {getLocalizedName(startPoint)}</option>
                )}
                {PESHAWAR_LANDMARKS.map((item) => (
                  <option key={item.name} value={item.name}>
                    {getLocalizedName(item)}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Location */}
            <div>
              <label className="text-xs font-bold text-[#4B6073] flex items-center gap-1.5 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0E6B73] ring-4 ring-cyan-100" />
                <span>{t.endLocation}</span>
              </label>
              <select
                value={endPoint.name}
                onChange={(e) => {
                  const match = PESHAWAR_LANDMARKS.find((p) => p.name === e.target.value);
                  if (match) setEndPoint(match);
                }}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white text-[#12263A] focus:outline-none focus:ring-2 focus:ring-[#0E6B73]"
              >
                {PESHAWAR_LANDMARKS.map((item) => (
                  <option key={item.name} value={item.name}>
                    {getLocalizedName(item)}
                  </option>
                ))}
              </select>
            </div>

            {/* Commute Mode Selector */}
            <div>
              <label className="text-xs font-bold text-[#4B6073] block mb-1.5">
                {language === "ur" ? "سواری کی قسم:" : "Commute Mode:"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("bike")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                    mode === "bike"
                      ? "bg-[#0E6B73] text-white border-[#0E6B73] shadow-md shadow-[#0E6B73]/20"
                      : "bg-white text-[#4B6073] border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  <span>{language === "ur" ? "موٹرسائیکل" : "Bike / Rickshaw"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("car")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                    mode === "car"
                      ? "bg-[#0E6B73] text-white border-[#0E6B73] shadow-md shadow-[#0E6B73]/20"
                      : "bg-white text-[#4B6073] border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>{language === "ur" ? "گاڑی" : "Car"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("walk")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                    mode === "walk"
                      ? "bg-[#0E6B73] text-white border-[#0E6B73] shadow-md shadow-[#0E6B73]/20"
                      : "bg-white text-[#4B6073] border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <Footprints className="w-4 h-4" />
                  <span>{language === "ur" ? "پیدل" : "Walk"}</span>
                </button>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              type="button"
              onClick={handleCalculateRoute}
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 via-[#0E6B73] to-[#095259] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Calculating Safe Peshawar Path...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>{t.calculateSafeRoute}</span>
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* Results Display */}
          {routeResult && (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
              {/* Gemini AI Safety Advisory Banner */}
              <div
                className={`p-4 rounded-2xl border ${
                  routeResult.aiAdvisory.status === "critical"
                    ? "bg-red-50/90 border-red-200 text-red-950"
                    : routeResult.aiAdvisory.status === "caution"
                    ? "bg-amber-50/90 border-amber-200 text-amber-950"
                    : "bg-emerald-50/90 border-emerald-200 text-emerald-950"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-white/80 shadow-xs flex items-center justify-center shrink-0 mt-0.5">
                    {routeResult.aiAdvisory.status === "critical" ? (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="font-heading font-bold text-sm flex items-center gap-2">
                      <span>
                        {language === "ur"
                          ? routeResult.aiAdvisory.headlineUr
                          : language === "ps"
                          ? routeResult.aiAdvisory.headlinePs
                          : routeResult.aiAdvisory.headlineEn}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">
                      {language === "ur"
                        ? routeResult.aiAdvisory.detailsUr
                        : language === "ps"
                        ? routeResult.aiAdvisory.detailsPs
                        : routeResult.aiAdvisory.detailsEn}
                    </p>
                  </div>
                </div>
              </div>

              {/* Route Comparison Side by Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Safe Route Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-500 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{t.routeSafeTitle}</span>
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                      Recommended
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-[#12263A]">
                      {routeResult.safeRoute.distanceKm} km
                    </span>
                    <span className="text-xs text-[#4B6073]">
                      (~{routeResult.safeRoute.durationMinutes} mins)
                    </span>
                  </div>

                  <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5 pt-1 border-t border-emerald-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {routeResult.safeRoute.avoidedHazardsCount > 0
                        ? `${routeResult.safeRoute.avoidedHazardsCount} hazard choke points avoided`
                        : "0 hazards on path"}
                    </span>
                  </div>
                </div>

                {/* Direct Route Card */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#4B6073] flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t.routeDirectTitle}</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Direct
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-slate-800">
                      {routeResult.directRoute.distanceKm} km
                    </span>
                    <span className="text-xs text-slate-500">
                      (~{routeResult.directRoute.durationMinutes} mins)
                    </span>
                  </div>

                  <div className="text-[11px] text-red-600 font-semibold flex items-center gap-1.5 pt-1 border-t border-slate-100">
                    <span>
                      {routeResult.directRoute.hazards.length > 0
                        ? `⚠️ Passes ${routeResult.directRoute.hazards.length} danger zones`
                        : "Passes clear path"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Manhole Radar Toggle Card */}
              <div className="p-3.5 rounded-2xl bg-[#12263A] text-white flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      radarActive ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-white"
                    }`}
                  >
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>{t.radarActive}</span>
                      {radarActive && (
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                      )}
                    </div>
                    <span className="text-[10px] text-[#C9D4DA]">
                      {language === "ur"
                        ? "کھلے مین ہول کے قریب پہنچنے پر آڈیو الرٹ"
                        : "Audio & visual proximity alarm within 70m of open manholes"}
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={radarActive}
                    onChange={(e) => onToggleRadar(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Action: Close and inspect on map */}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-[#0E6B73] hover:bg-[#095259] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>
                  {language === "ur"
                    ? "نقشے پر لائیو روٹ دیکھیں →"
                    : "View Live Safe Route on Map →"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
