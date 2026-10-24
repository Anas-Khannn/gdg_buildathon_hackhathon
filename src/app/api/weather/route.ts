import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Peshawar Coordinates: lat 34.0151, lng 71.5249
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=34.0151&longitude=71.5249&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&hourly=precipitation_probability,rain&forecast_days=1&timezone=Asia%2FKarachi",
      { next: { revalidate: 600 } } // Cache for 10 minutes
    );

    if (!res.ok) {
      throw new Error("Failed to fetch weather from Open-Meteo");
    }

    const data = await res.json();
    const current = data.current || {};
    const hourly = data.hourly || {};

    // Calculate max rain probability today
    const rainProbs: number[] = hourly.precipitation_probability || [];
    const maxRainProb = rainProbs.length > 0 ? Math.max(...rainProbs) : 0;
    const isRainingNow = (current.precipitation || 0) > 0 || (current.rain || 0) > 0;

    // Weather code mapping (WMO)
    const code = current.weather_code ?? 0;
    let conditionEn = "Clear Sky";
    let conditionUr = "صاف آسمان";
    let conditionPs = "شین اسمان";
    let isRainy = false;

    if (code >= 51 && code <= 67) {
      conditionEn = "Rain & Drizzle";
      conditionUr = "بارش اور بوندا باندی";
      conditionPs = "باران او خوله";
      isRainy = true;
    } else if (code >= 80 && code <= 82) {
      conditionEn = "Heavy Showers";
      conditionUr = "تیز بارش";
      conditionPs = "دروند باران";
      isRainy = true;
    } else if (code >= 95) {
      conditionEn = "Thunderstorm & Downpour";
      conditionUr = "گرج چمک اور طوفانی بارش";
      conditionPs = "تالنده او طوفاني باران";
      isRainy = true;
    } else if (code >= 1 && code <= 3) {
      conditionEn = "Partly Cloudy";
      conditionUr = "جزوی طور پر ابر آلود";
      conditionPs = "یو څه ورېځې";
    }

    return NextResponse.json({
      city: "Peshawar",
      tempC: Math.round(current.temperature_2m ?? 24),
      humidity: Math.round(current.relative_humidity_2m ?? 50),
      isRainingNow,
      isRainAlert: isRainy || isRainingNow || maxRainProb >= 40,
      rainProbMax: maxRainProb,
      condition: {
        en: conditionEn,
        ur: conditionUr,
        ps: conditionPs,
      },
    });
  } catch (err: any) {
    console.error("Peshawar Weather API error:", err);
    // Graceful fallback
    return NextResponse.json({
      city: "Peshawar",
      tempC: 22,
      humidity: 55,
      isRainingNow: false,
      isRainAlert: false,
      rainProbMax: 20,
      condition: {
        en: "Clear",
        ur: "صاف",
        ps: "صاف",
      },
    });
  }
}
