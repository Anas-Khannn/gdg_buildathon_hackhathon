"use client";

import React, { useEffect, useState } from "react";
import { CloudRain, Sun, Cloud, AlertTriangle, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

interface WeatherData {
  city: string;
  tempC: number;
  humidity: number;
  isRainingNow: boolean;
  isRainAlert: boolean;
  rainProbMax: number;
  condition: {
    en: string;
    ur: string;
    ps: string;
  };
}

export function WeatherAlertBanner() {
  const { language } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch("/api/weather");
        if (res.ok) {
          const data = await res.json();
          setWeather(data);
        }
      } catch (err) {
        // Silent fail
      }
    }
    fetchWeather();
  }, []);

  if (!weather || dismissed) return null;

  const conditionText =
    language === "ur"
      ? weather.condition.ur
      : language === "ps"
      ? weather.condition.ps
      : weather.condition.en;

  const alertMessage =
    language === "ur"
      ? `پشاور بارش الرٹ: ${weather.tempC}°C، ${conditionText} (${weather.rainProbMax}% بارش کا امکان)۔ نشیبی علاقوں اور انڈر پاسز پر پانی جمع ہونے کا خدشہ ہے۔`
      : language === "ps"
      ? `پیښور باران الرټ: ${weather.tempC}°C، ${conditionText} (${weather.rainProbMax}% د باران خطر)۔ په کوهاټي او لنډو لارو کښې د اوبو ډنډیدو نه ځان وساتئ۔`
      : `Peshawar Monsoon Watch: ${weather.tempC}°C, ${conditionText} (${weather.rainProbMax}% rain risk). Drive carefully near low underpasses.`;

  return (
    <div
      className={`w-full transition-all text-xs border-b ${
        weather.isRainAlert
          ? "bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 text-white border-amber-500/50 shadow-sm"
          : "bg-[#183652] text-[#C9D4DA] border-white/10"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {weather.isRainAlert ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-[10px] uppercase shrink-0 tracking-wider">
              <AlertTriangle className="w-3 h-3 text-amber-200" />
              <span>Flood Watch</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-emerald-300 font-extrabold text-[10px] uppercase shrink-0 tracking-wider">
              <Sun className="w-3 h-3 text-amber-300" />
              <span>Peshawar Live</span>
            </span>
          )}

          <p className="truncate font-medium text-[11px] sm:text-xs">
            {weather.isRainAlert ? (
              alertMessage
            ) : (
              <span>
                <strong>Peshawar:</strong> {weather.tempC}°C • {conditionText} • Humidity {weather.humidity}% • Rain Risk: {weather.rainProbMax}%
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition shrink-0"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
