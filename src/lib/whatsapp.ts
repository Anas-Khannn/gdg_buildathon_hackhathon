import type { ReportItem } from "@/types/report";
import { Language } from "./i18n";

export const WSSP_PESHAWAR_WHATSAPP = "923000001334"; // Official WSSP Peshawar Civic Helpline Channel

export function getProblemTypeLabel(type: ReportItem["type"], lang: Language = "en"): string {
  const map: Record<string, { en: string; ur: string; ps: string }> = {
    blocked_drain: { en: "Blocked Drain (نالی بند)", ur: "بند نالی", ps: "بند نالی" },
    standing_water: { en: "Standing Water / Flood (کھڑا پانی)", ur: "کھڑا پانی", ps: "ولاړې اوبه" },
    open_manhole: { en: "Open Manhole (کھلا مین ہول)", ur: "کھلا مین ہول", ps: "خلاص مین ہول" },
    garbage_in_drain: { en: "Garbage in Drain (کچرا)", ur: "نالی میں کچرا", ps: "په نالی کښې کثافات" },
    other: { en: "Drainage Hazard (نکاسی مسئلہ)", ur: "نکاسی کا مسئلہ", ps: "د نالی ستونزه" },
  };
  return map[type]?.[lang] || map[type]?.en || type;
}

export function getSeverityLabel(severity: ReportItem["severity"], lang: Language = "en"): string {
  const map: Record<string, { en: string; ur: string; ps: string }> = {
    ankle: { en: "Ankle-deep (ٹخنوں تک)", ur: "ٹخنوں تک", ps: "تر ښنګرو پورې" },
    knee: { en: "Knee-deep (گھٹنوں تک)", ur: "گھٹنوں تک", ps: "تر زنګون پورې" },
    danger: { en: "🚨 DANGER - Impassable / Hazard", ur: "🚨 خطرناک - آمدورفت بند", ps: "🚨 خطرناک" },
    fixed: { en: "✅ Verified Fixed", ur: "حل شدہ", ps: "حل شوی" },
  };
  return map[severity]?.[lang] || map[severity]?.en || severity;
}

/**
 * Generate 1-Tap Official WSSP Municipal WhatsApp Dispatch URL
 */
export function generateWSSPDispatchUrl(report: ReportItem): string {
  const shortId = report.id.slice(0, 8).toUpperCase();
  const mapsUrl = `https://www.google.com/maps?q=${report.lat},${report.lng}`;
  const liveUrl = typeof window !== "undefined" ? window.location.origin : "https://gdg-buildathon-hackhathon.vercel.app";
  const dateStr = new Date(report.createdAt).toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const text = `🚨 *NAALIWATCH PESHAWAR - MUNICIPAL DISPATCH TICKET* 🚨
━━━━━━━━━━━━━━━━━━━━━━
📋 *Ticket ID:* NW-${shortId}
📍 *Zone / Area:* ${report.areaName || "Peshawar"} (${report.lat.toFixed(5)}, ${report.lng.toFixed(5)})
🗺️ *Google Maps Pin:* ${mapsUrl}
⚠️ *Hazard Type:* ${getProblemTypeLabel(report.type)}
🌊 *Water Severity:* ${getSeverityLabel(report.severity)}
👥 *Citizen Confirmations:* ${report.confirmationsCount} verified
📝 *Complaint Details:* "${report.complaintText || "Blocked drainage hazard obstructing road."}"
⏰ *Timestamp:* ${dateStr}
━━━━━━━━━━━━━━━━━━━━━━
👉 *Live Ticket & Photo:* ${liveUrl}
_Dispatched via NaaliWatch Civic Platform for immediate WSSP field cleanup._`;

  return `https://wa.me/${WSSP_PESHAWAR_WHATSAPP}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate 1-Tap Neighborhood Warning WhatsApp Share URL
 */
export function generateCitizenWarningShareUrl(report: ReportItem, lang: Language = "en"): string {
  const mapsUrl = `https://www.google.com/maps?q=${report.lat},${report.lng}`;
  const liveUrl = typeof window !== "undefined" ? window.location.origin : "https://gdg-buildathon-hackhathon.vercel.app";

  const text = `⚠️ *PESHAWAR DRAINAGE HAZARD WARNING* ⚠️
*نالی واچ پشاور - شہری احتیاطی اطلاع*
━━━━━━━━━━━━━━━━━━━━━━
📍 *Location:* ${report.areaName || "Peshawar Area"}
🌊 *Water Level:* ${getSeverityLabel(report.severity, lang)}
⚠️ *Hazard:* ${getProblemTypeLabel(report.type, lang)}
🗺️ *Live Location Pin:* ${mapsUrl}

🚗 *احتیاط:* اس سڑک پر گہرا پانی جمع ہے۔ متبادل راستہ اختیار کریں!
👀 *Check Live Map:* ${liveUrl}
━━━━━━━━━━━━━━━━━━━━━━
_Sent via NaaliWatch Peshawar Community Defense_`;

  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
