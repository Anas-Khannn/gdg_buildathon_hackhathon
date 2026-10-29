import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reports, areas } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  simulateCatchmentBasins,
  ReportInputForSim,
  PESHAWAR_CATCHMENTS,
} from "@/lib/hydrology-engine";
import type {
  SimulationResponse,
  SimulationAIAdvisory,
  WSSPZoneDirective,
} from "@/types/simulation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let rainMmPerHour = Number(body.rainMmPerHour ?? 35);
    const scenarioName = body.scenarioName || "Monsoon Storm Simulation";
    const useLiveWeather = Boolean(body.useLiveWeather);
    const mitigatedBasinIds = new Set<string>(
      Array.isArray(body.mitigatedBasinIds) ? body.mitigatedBasinIds : []
    );

    // 1. Fetch Live Peshawar Weather if requested
    let liveWeatherFetched = false;
    if (useLiveWeather) {
      try {
        const weatherRes = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=34.0151&longitude=71.5249&current=precipitation,rain,weather_code&hourly=precipitation_probability,rain&forecast_days=1&timezone=Asia%2FKarachi",
          { cache: "no-store" }
        );
        if (weatherRes.ok) {
          const wData = await weatherRes.json();
          const currentRain = Number(wData.current?.precipitation || wData.current?.rain || 0);
          const maxProb = Math.max(...(wData.hourly?.precipitation_probability || [0]));
          
          if (currentRain > 0) {
            rainMmPerHour = Math.max(12, Math.round(currentRain * 4)); // scaled storm rate
          } else if (maxProb >= 40) {
            rainMmPerHour = 25; // Impending storm prediction
          } else {
            rainMmPerHour = 10; // Baseline overcast drizzle
          }
          liveWeatherFetched = true;
        }
      } catch (err) {
        console.warn("Live weather fetch failed in simulator, using fallback rain:", err);
      }
    }

    // 2. Fetch Active Reports from PostgreSQL database
    const dbReports = await db
      .select({
        id: reports.id,
        lat: reports.lat,
        lng: reports.lng,
        type: reports.type,
        severity: reports.severity,
        status: reports.status,
        areaName: areas.name,
      })
      .from(reports)
      .leftJoin(areas, eq(reports.areaId, areas.id))
      .where(
        and(
          eq(reports.hidden, false),
          ne(reports.status, "verified_fixed")
        )
      );

    const reportsInput: ReportInputForSim[] = dbReports.map((r) => ({
      id: r.id,
      lat: r.lat,
      lng: r.lng,
      type: r.type,
      severity: r.severity,
      status: r.status,
      areaName: r.areaName,
    }));

    // 3. Run Hydrological Simulation Engine
    const {
      basinResults,
      totalRunoffMillionLiters,
      criticalBasinsCount,
      cityRiskIndex,
    } = simulateCatchmentBasins(rainMmPerHour, reportsInput, mitigatedBasinIds);

    // 4. Generate AI Emergency Directive via Google Gemini (with deterministic heuristic fallback)
    const apiKey = process.env.GEMINI_API_KEY;
    let aiAdvisory: SimulationAIAdvisory | null = null;

    const criticalBasins = basinResults.filter(
      (b) => b.riskLevel === "severe" || b.riskLevel === "catastrophic"
    );

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are the Chief Hydrological Disaster & Municipal Response AI for Water and Sanitation Services Peshawar (WSSP) and PDMA KP.
The city is running an active storm runoff simulation with:
- Rainfall Intensity: ${rainMmPerHour} mm/hr (${scenarioName})
- Total City Runoff Volume: ${totalRunoffMillionLiters} Million Liters/hour
- City-Wide Risk Index: ${cityRiskIndex}/100
- Critical Catchment Basins at Risk: ${criticalBasinsCount} (${criticalBasins.map((b) => `${b.basin.name}: depth ${b.inundationDepthCm}cm, blockages: ${b.activeBlockagesCount}`).join("; ")})

Provide an emergency municipal response directive in strict valid JSON format (no markdown, no backticks):
{
  "summaryEn": "2 sentence executive storm overview for Peshawar municipal command",
  "summaryUr": "2 sentence executive storm overview in Urdu",
  "summaryPs": "2 sentence executive storm overview in Pashto",
  "wsspDirectives": [
    {
      "zone": "Zone 1 / 2 / 3 / 4",
      "location": "Peshawar corridor name",
      "action": "Immediate tactical desilting or dewatering command",
      "actionUr": "Urdu translation of command",
      "actionPs": "Pashto translation of command",
      "urgency": "immediate" | "high" | "medium",
      "equipment": "e.g. 2x Super Sucker Jetting Trucks + 1x Excavator",
      "assetsProtected": "e.g. Kohati Wholesale Cloth Market & Lady Reading Hospital Access"
    }
  ],
  "citizenAdvisoryEn": "Clear travel advisory for citizens of Peshawar, noting roads to avoid and safe alternate corridors.",
  "citizenAdvisoryUr": "Same citizen travel advisory in natural Urdu.",
  "citizenAdvisoryPs": "Same citizen travel advisory in natural Pashto.",
  "mosqueBroadcastScriptUr": "An authentic, urgent Urdu public announcement for mosque loudspeakers and municipal megaphones alerting local residents about rising water and open manholes (starts with: 'توجہ فرمائیں! پیارے اہل محلہ...')",
  "mosqueBroadcastScriptPs": "The same urgent public announcement translated into authentic Pashto (starts with: 'پاملرنه وکړئ! د کلي قدرمنو اوسیدونکو...')"
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleaned = text
          .replace(/^```json/i, "")
          .replace(/^```/, "")
          .replace(/```$/, "")
          .trim();

        const parsed = JSON.parse(cleaned);
        if (parsed.summaryEn && Array.isArray(parsed.wsspDirectives)) {
          aiAdvisory = parsed;
        }
      } catch (geminiError: any) {
        console.warn("Gemini simulation advisory failed, using expert heuristic:", geminiError.message);
      }
    }

    // Heuristic Fallback for AI Advisory if Gemini unavailable
    if (!aiAdvisory) {
      const topProblemBasin = criticalBasins[0] || basinResults[0];
      const secondProblemBasin = criticalBasins[1] || basinResults[1];

      const fallbackDirectives: WSSPZoneDirective[] = [
        {
          zone: "Zone 3 (Historic City & Kohati)",
          location: "Shahi Katha Corridor & Kohati Gate",
          action:
            "Mobilize 2 high-capacity suction jetting machines to clear clogged sewer intake grates and prevent market inundation.",
          actionUr:
            "دو ہائی کپیسٹی سکشن جیٹنگ مشینیں شاہی کٹھہ انٹیک پر فوری روانہ کریں تاکہ کوہاٹی مارکیٹ میں پانی داخل نہ ہو۔",
          actionPs:
            "دوه لوړ ظرفیت لرونکي سکشن جیټینګ ماشینونه شاهي کټه ته واستوئ ترڅو کوہاټي بازار ډوب نشي.",
          urgency: "immediate",
          equipment: "2x Suction Gully Emptiers + 1x Mobile Dewatering Pump",
          assetsProtected: "Kohati Cloth Market & Chowk Yadgar Bazaar",
        },
        {
          zone: "Zone 4 (Northern Peshawar)",
          location: "Budni Nullah & Charsadda Road Bridge",
          action:
            "Deploy backhoe loader excavator to remove heavy plastic debris choking the northern culvert before runoff peaks.",
          actionUr:
            "بڈھنی نالے اور چارسدہ روڈ پل کے کلورٹ سے پلاسٹک اور گند ہٹانے کے لیے فوری ایکسکاویٹر روانہ کریں۔",
          actionPs:
            "د بډھنۍ خوړ او چارسدې پل کلورټ پاکولو لپاره سمدستي کیندونکی (ایکسکاوټر) ولېږئ.",
          urgency: "immediate",
          equipment: "1x Heavy Excavator + 1x Silt Dumper",
          assetsProtected: "Charsadda Road Thoroughfare & Dalazak Corridor",
        },
        {
          zone: "Zone 2 (Cantonment & University)",
          location: "Aman Chowk & Gulbahar Underpass",
          action:
            "Station emergency dewatering pumps at BRT underpasses and monitor drainage sump pits continuously.",
          actionUr:
            "بی آر ٹی امن چوک اور گلبہار انڈرپاس پر ہنگامی ڈی واٹرنگ پمپس نصب کریں تاکہ ٹریفک بلاک نہ ہو۔",
          actionPs:
            "د بی آر ټي امن چوک او ګلبہار انډرپاس کې بیړني د اوبو ایستلو پمپونه فعال وساتئ.",
          urgency: "high",
          equipment: "2x Submersible Sump Pumps (1000 GPM)",
          assetsProtected: "BRT Peshawar Green Line & Main GT Road Underpasses",
        },
      ];

      aiAdvisory = {
        summaryEn: `Monsoon storm intensity of ${rainMmPerHour} mm/hr generates an estimated ${totalRunoffMillionLiters} million liters/hr across Peshawar. Severe inundation projected in low-lying corridors including ${topProblemBasin.basin.name}.`,
        summaryUr: `پشاور میں ${rainMmPerHour} ملی میٹر فی گھنٹہ کی بارش سے تقریباً ${totalRunoffMillionLiters} ملین لیٹر پانی پیدا ہوگا۔ ${topProblemBasin.basin.nameUr} میں سیلابی صورتحال کا خدشہ ہے۔`,
        summaryPs: `په پیښور کې د ${rainMmPerHour} ملي متره باران سره نږدې ${totalRunoffMillionLiters} ملیونه لیټره اوبه بهیږي. په ${topProblemBasin.basin.namePs} کې د اوبو راټولیدو جدي خطر شته.`,
        wsspDirectives: fallbackDirectives,
        citizenAdvisoryEn:
          "Citizens are strongly advised to avoid low-lying underpasses at Gulbahar and submerged sections of Kohati Gate. Use Khyber Road or Ring Road flyovers as safe elevated detours.",
        citizenAdvisoryUr:
          "شہریوں کو سختی سے ہدایت کی جاتی ہے کہ گلبہار انڈرپاس اور کوہاٹی گیٹ کے نشیبی راستوں سے پرہیز کریں۔ خیبر روڈ یا رنگ روڈ فلائی اوور کو محفوظ متبادل کے طور پر استعمال کریں۔",
        citizenAdvisoryPs:
          "ګرانو ښاریانو ته مشوره ورکول کیږي چې د ګلبہار انډرپاس او کوہاټي ګېټ له ژورو اوبو څخه ډډه وکړي او د خیبر سړک د خوندي لارې په توګه وکاروي.",
        mosqueBroadcastScriptUr:
          "توجہ فرمائیں! پیارے اہل محلہ، ڈبلیو ایس ایس پی اور پی ڈی ایم اے کی جانب سے الرٹ جاری کیا گیا ہے۔ تیز بارش کے باعث نالے اوور فلو ہو رہے ہیں اور گلیوں میں کھلے مین ہولز کا شدید خطرہ ہے۔ برائے مہربانی بچوں کو پانی میں جانے نہ دیں اور غیر ضروری سفر سے گریز کریں۔ ایمرجنسی میں 1334 پر رابطہ کریں۔",
        mosqueBroadcastScriptPs:
          "پاملرنه وکړئ! د کلي قدرمنو اوسیدونکو، د تیز باران او اوبو ډنډ کیدو له امله د خلاصو نالو او مین هولونو سخت خطر دی. مهرباني وکړئ خپلو ماشومانو ته پام وکړئ او له غیر ضروري تګ راتګ څخه ډډه وکړئ. د مرستې لپاره 1334 یا 1122 سره اړیکه ونیسئ.",
      };
    }

    const response: SimulationResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      rainMmPerHour,
      scenarioName,
      isLiveWeather: liveWeatherFetched,
      totalRunoffMillionLiters,
      criticalBasinsCount,
      cityRiskIndex,
      totalBlockedDrainsCount: reportsInput.length,
      mitigatedBasinsCount: mitigatedBasinIds.size,
      basinResults,
      aiAdvisory,
    };

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Flood simulation API error:", err);
    return NextResponse.json(
      { error: "Failed to run hydrological flood simulation", details: err?.message },
      { status: 500 }
    );
  }
}

