"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/language-provider";
import {
  PhoneCall,
  AlertOctagon,
  ShieldAlert,
  Zap,
  Waves,
  X,
  Copy,
  Check,
  LifeBuoy,
  PhoneForwarded,
  Car,
  AlertTriangle,
  Info,
} from "lucide-react";

interface EmergencyContact {
  id: string;
  name: { en: string; ur: string; ps: string };
  department: { en: string; ur: string; ps: string };
  number: string;
  displayNumber: string;
  category: "rescue" | "sanitation" | "electricity" | "disaster" | "traffic";
  colorClass: {
    bg: string;
    border: string;
    text: string;
    badge: string;
  };
  desc: { en: string; ur: string; ps: string };
  isTollFree?: boolean;
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: "rescue-1122",
    name: {
      en: "Rescue 1122 Khyber Pakhtunkhwa",
      ur: "ریسکیو 1122 خیبر پختونخوا",
      ps: "د خیبر پښتونخوا ژغورنې اداره ۱۱۲۲",
    },
    department: {
      en: "Disaster, Flood Extraction & Emergency Medical",
      ur: "سیلابی ریسکیو، حادثات و میڈیکل ایمرجنسی",
      ps: "د سیلابونو، پېښو او طبي بېړنۍ مرستې څانګه",
    },
    number: "1122",
    displayNumber: "1122",
    category: "rescue",
    colorClass: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-600",
      badge: "bg-red-600 text-white",
    },
    desc: {
      en: "24/7 Rapid flood evacuation, drowning rescue, and submerged vehicle emergency response.",
      ur: "سیلابی پانی میں پھنسے شہریوں کا انخلاء، ڈوبنے سے بچاؤ اور ایمبولینس سروس۔",
      ps: "په اوبو کې د بندو کسانو ژغورنه او د ۲۴ ساعته امبولانس بېړني خدمتونه.",
    },
    isTollFree: true,
  },
  {
    id: "wssp-1334",
    name: {
      en: "WSSP Peshawar Rapid Desiltation",
      ur: "واٹر اینڈ سینی ٹیشن سروسز پشاور (WSSP)",
      ps: "د پېښور د اوبو او صفايۍ اداره",
    },
    department: {
      en: "Emergency Drain Clearance & Suction Bowsers",
      ur: "بند نالیوں کی فوری ڈی سلٹیشن و ڈی واٹرنگ باؤزر",
      ps: "د بندو نالو پرانیستل او د اوبو ایستلو ماشینري",
    },
    number: "1334",
    displayNumber: "1334",
    category: "sanitation",
    colorClass: {
      bg: "bg-[#0E6B73]/10",
      border: "border-[#0E6B73]/30",
      text: "text-[#0E6B73]",
      badge: "bg-[#0E6B73] text-white",
    },
    desc: {
      en: "Municipal suction tankers for overflowed storm drains and missing manhole covers.",
      ur: "سڑکوں پر جمع گندے پانی کی نکاسی کے لیے بلدیاتی سکشن ٹینکرز اور کھلے مین ہول کورز۔",
      ps: "د ښار پر سړکونو د ډنډو اوبو او خلاصو مین هولونو د پوښلو لپاره بېړنۍ ډله.",
    },
    isTollFree: true,
  },
  {
    id: "pesco-118",
    name: {
      en: "PESCO Electrocution & Fallen Wire Crisis",
      ur: "پیسکو بجلی ہنگامی کنٹرول روم (کرنٹ خطرہ)",
      ps: "د پیسکو د برېښنا د خطرونو بېړنی مرکز",
    },
    department: {
      en: "Submerged Power Line De-energization",
      ur: "پانی میں گری بجلی تاروں کی فوری فیڈر بندش",
      ps: "په ولاړو اوبو کې د برېښنا د تارونو د قطع کولو اداره",
    },
    number: "118",
    displayNumber: "118 / 091-9212010",
    category: "electricity",
    colorClass: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-700",
      badge: "bg-amber-600 text-white",
    },
    desc: {
      en: "IMMEDIATE: Report fallen poles or humming electrified water to prevent fatal electrocution.",
      ur: "فوری اطلاع: پانی میں گری ہوئی بجلی کی تاروں اور کرنٹ زدہ کھمبوں کی فوری بندش۔",
      ps: "سمدستي خبر ورکول: په اوبو کې د برېښنا پرې شوي مزي او د برېښنا نیونې مخنیوی.",
    },
    isTollFree: true,
  },
  {
    id: "pdma-1700",
    name: {
      en: "PDMA KP Monsoon Flood Control Room",
      ur: "پی ڈی ایم اے کے پی مونسون فلڈ کنٹرول روم",
      ps: "د خیبر پښتونخوا د ناورینونو د سمبالښت اداره",
    },
    department: {
      en: "Provincial Disaster Management Authority",
      ur: "صوبائی ڈیزاسٹر مینجمنٹ اتھارٹی کنٹرول سیل",
      ps: "د بارانونو او سیلابونو ولایتي کنټرول څانګه",
    },
    number: "1700",
    displayNumber: "1700",
    category: "disaster",
    colorClass: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-700",
      badge: "bg-blue-600 text-white",
    },
    desc: {
      en: "Provincial flood emergencies, rainfall bulletins, and relief camp coordination.",
      ur: "موسلا دھار بارشوں کے دوران شہری سیلاب کی نگرانی اور ہنگامی ریلیف کیمپ۔",
      ps: "د سختو بارانونو او سیلابونو څارنه او د بېړنیو مرستو همغږي.",
    },
    isTollFree: true,
  },
  {
    id: "traffic-1915",
    name: {
      en: "City Traffic Police Peshawar (CTP)",
      ur: "سٹی ٹریفک پولیس پشاور ہیلپ لائن",
      ps: "د پېښور ټرافیک پولیسو لارښود",
    },
    department: {
      en: "Inundated Road Detours & Route Advisory",
      ur: "ڈوبے ہوئے انڈر پاسز و متبادل خشک راستوں کی رہنمائی",
      ps: "د اوبو لاندې شوو سړکونو او د تګ راتګ بدیلې لارې",
    },
    number: "1915",
    displayNumber: "1915",
    category: "traffic",
    colorClass: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-700",
      badge: "bg-emerald-600 text-white",
    },
    desc: {
      en: "Live road clearance status for University Road, Ring Road, and Tehkal underpasses.",
      ur: "یونیورسٹی روڈ، رنگ روڈ اور تہکال انڈرپاسز کے متبادل خشک ٹریفک راستے۔",
      ps: "د پوهنتون سړک، رېنګ روډ او د پېښور د لویو لارو د ترافیک معلومات.",
    },
    isTollFree: true,
  },
];

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  const { language } = useLanguage();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = (id: string, num: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(num);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getCategoryIcon = (category: EmergencyContact["category"]) => {
    switch (category) {
      case "rescue":
        return <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />;
      case "sanitation":
        return <Waves className="w-5 h-5 text-[#0E6B73] shrink-0" />;
      case "electricity":
        return <Zap className="w-5 h-5 text-amber-600 shrink-0" />;
      case "disaster":
        return <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0" />;
      case "traffic":
        return <Car className="w-5 h-5 text-emerald-600 shrink-0" />;
    }
  };

  const modalTitle =
    language === "ur"
      ? "پشاور مونسون ہنگامی ہیلپ لائنز"
      : language === "ps"
      ? "د پېښور د بارانونو او سېلاب بېړنۍ شمېرې"
      : "Peshawar Monsoon Emergency Helplines";

  const modalSubtitle =
    language === "ur"
      ? "سیلابی پانی، بجلی کے تاروں کے گرنے یا کھلے مین ہول کے خطرات پر فوری کال کریں"
      : language === "ps"
      ? "د ژورو اوبو، برېښنا د خطر او خلاصو مین هولونو د مخنیوي لپاره بېړنۍ اړیکه ونیسئ"
      : "1-Tap Direct Municipal Dispatch & Rescue Services for Urgent Waterlogging Crises";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-[#C9D4DA] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#C8321F] via-[#A82516] to-[#12263A] text-white flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shrink-0 animate-pulse">
              <PhoneCall className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/25">
                  SOS • 24/7
                </span>
                <span className="text-[11px] text-red-100 font-medium hidden sm:inline">
                  Peshawar Urban Response
                </span>
              </div>
              <h2 className="font-heading text-lg sm:text-xl font-extrabold tracking-tight text-white leading-tight mt-0.5 truncate">
                {modalTitle}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle Banner */}
        <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center gap-2 shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="leading-snug font-medium">{modalSubtitle}</span>
        </div>

        {/* Scrollable Helpline Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {EMERGENCY_CONTACTS.map((contact) => {
            const isCopied = copiedId === contact.id;
            const contactName =
              contact.name[language] || contact.name.en;
            const contactDept =
              contact.department[language] || contact.department.en;
            const contactDesc =
              contact.desc[language] || contact.desc.en;

            return (
              <div
                key={contact.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${contact.colorClass.bg} ${contact.colorClass.border} hover:shadow-md bg-white`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 p-2 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
                      {getCategoryIcon(contact.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading text-sm font-bold text-[#12263A] leading-tight">
                          {contactName}
                        </h3>
                        {contact.isTollFree && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Toll-Free
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-[#4B6073] mt-0.5">
                        {contactDept}
                      </p>
                      <p className="text-xs text-[#12263A]/80 mt-1 leading-relaxed">
                        {contactDesc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dial & Copy Buttons Strip */}
                <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-[#12263A] tracking-wider font-mono bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300">
                      {contact.displayNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(contact.id, contact.number)}
                      title="Copy phone number"
                      className="p-1.5 rounded-lg text-slate-600 hover:text-[#12263A] hover:bg-slate-200 transition cursor-pointer"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <a
                    href={`tel:${contact.number}`}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${contact.colorClass.badge} hover:opacity-90 active:scale-95`}
                  >
                    <PhoneForwarded className="w-3.5 h-3.5" />
                    <span>
                      {language === "ur" ? "کال کریں" : language === "ps" ? "اړیکه ونیسئ" : "Call Now"}
                    </span>
                  </a>
                </div>
              </div>
            );
          })}

          {/* Life-Saving Monsoon Safety Checklist */}
          <div className="p-4 rounded-2xl bg-[#12263A] text-white space-y-2.5 shadow-md border border-white/10 mt-4">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-400">
              <LifeBuoy className="w-4 h-4" />
              <span>
                {language === "ur"
                  ? "پشاور برسات: جان بچانے کی لازمی احتیاطیں"
                  : language === "ps"
                  ? "د ژوندي پاتې کېدو مهمې لارښوونې"
                  : "Life-Saving Monsoon Safety Protocols"}
              </span>
            </div>

            <ul className="text-xs text-[#C9D4DA] space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">⚡</span>
                <span>
                  <strong>
                    {language === "ur"
                      ? "بجلی کے کھمبوں سے دور رہیں:"
                      : "Electrocution Hazard:"}
                  </strong>{" "}
                  {language === "ur"
                    ? "بارش میں بجلی کے کھمبوں، ٹرانسفارمرز اور ان کے ارد گرد کھڑے پانی سے کم از کم 10 میٹر فاصلہ رکھیں۔"
                    : "Stay at least 10 meters (33 ft) away from submerged utility poles, downed power wires, or tingling water."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">🕳️</span>
                <span>
                  <strong>
                    {language === "ur"
                      ? "کھلے مین ہول کی نشاندہی:"
                      : "Open Manholes:"}
                  </strong>{" "}
                  {language === "ur"
                    ? "سیلابی پانی میں نالی کے اوپر سے نہ گزریں۔ مین ہول کھلا ہو تو دور سے اونچی لکڑی لگا کر شہریوں کو خبردار کریں۔"
                    : "Never let children walk in opaque murky water. Mark open manholes with a visible branch or warning sign."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">🚗</span>
                <span>
                  <strong>
                    {language === "ur"
                      ? "انڈرپاسز میں گاڑی نہ ڈالیں:"
                      : "Flooded Underpasses:"}
                  </strong>{" "}
                  {language === "ur"
                    ? "تہکال اور یونیورسٹی روڈ کے انڈرپاسز میں پانی کے بہاؤ کے دوران گاڑی یا موٹر سائیکل نہ لے جائیں۔"
                    : "Do not drive vehicles through deep underpass water; stalling engine can trap occupants in rising flash water."}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-[#C9D4DA] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[#4B6073]">
            <Info className="w-3.5 h-3.5 text-[#0E6B73]" />
            <span>Official Government of KP Civic Helplines</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-[#12263A] text-xs font-bold transition cursor-pointer"
          >
            {language === "ur" ? "بند کریں" : language === "ps" ? "بندول" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
