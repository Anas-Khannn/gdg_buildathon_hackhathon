"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/language-provider";
import type { DrainDoctorAudit, BOQItem } from "@/lib/drain-doctor-engine";
import { PESHAWAR_DRAIN_TEMPLATES } from "@/lib/drain-doctor-engine";
import {
  FileSpreadsheet,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Truck,
  Users,
  Clock,
  Printer,
  Share2,
  Sparkles,
  X,
  ChevronRight,
  TrendingDown,
  Building,
  CheckCircle2,
  Sliders,
  Flame,
  FileText,
  BadgeAlert,
} from "lucide-react";

interface DrainDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialParams?: {
    drainName?: string;
    location?: string;
    widthMeters?: number;
    depthMeters?: number;
    lengthMeters?: number;
    siltFillPercentage?: number;
    wasteType?: string;
    contractorQuotedPkr?: number;
  };
}

export function DrainDoctorModal({
  isOpen,
  onClose,
  initialParams,
}: DrainDoctorModalProps) {
  const { language } = useLanguage();

  // Inputs
  const [drainName, setDrainName] = useState(
    initialParams?.drainName || PESHAWAR_DRAIN_TEMPLATES[0].drainName
  );
  const [location, setLocation] = useState(
    initialParams?.location || PESHAWAR_DRAIN_TEMPLATES[0].location
  );
  const [widthMeters, setWidthMeters] = useState<number>(
    initialParams?.widthMeters || PESHAWAR_DRAIN_TEMPLATES[0].widthMeters
  );
  const [depthMeters, setDepthMeters] = useState<number>(
    initialParams?.depthMeters || PESHAWAR_DRAIN_TEMPLATES[0].depthMeters
  );
  const [lengthMeters, setLengthMeters] = useState<number>(
    initialParams?.lengthMeters || PESHAWAR_DRAIN_TEMPLATES[0].lengthMeters
  );
  const [siltFillPercentage, setSiltFillPercentage] = useState<number>(
    initialParams?.siltFillPercentage || PESHAWAR_DRAIN_TEMPLATES[0].siltFillPercentage
  );
  const [wasteType, setWasteType] = useState<string>(
    initialParams?.wasteType || PESHAWAR_DRAIN_TEMPLATES[0].wasteType
  );
  const [contractorClaim, setContractorClaim] = useState<number>(
    initialParams?.contractorQuotedPkr || PESHAWAR_DRAIN_TEMPLATES[0].contractorQuotedPkr
  );

  // Audit Result
  const [audit, setAudit] = useState<DrainDoctorAudit | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"overview" | "boq" | "certificate">("overview");

  // Run calculation via API or engine
  const executeAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/drain-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drainName,
          location,
          widthMeters,
          depthMeters,
          lengthMeters,
          siltFillPercentage,
          wasteType,
          contractorQuotedPkr: contractorClaim,
        }),
      });
      const data = await res.json();
      if (data.audit) {
        setAudit(data.audit);
      }
    } catch (err) {
      console.error("Audit run error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      executeAudit();
    }
  }, [isOpen]);

  const loadTemplate = (tpl: (typeof PESHAWAR_DRAIN_TEMPLATES)[0]) => {
    setDrainName(tpl.drainName);
    setLocation(tpl.location);
    setWidthMeters(tpl.widthMeters);
    setDepthMeters(tpl.depthMeters);
    setLengthMeters(tpl.lengthMeters);
    setSiltFillPercentage(tpl.siltFillPercentage);
    setWasteType(tpl.wasteType);
    setContractorClaim(tpl.contractorQuotedPkr);

    fetch("/api/drain-doctor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId: tpl.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.audit) setAudit(data.audit);
      });
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleShareWhistleblower = () => {
    if (!audit) return;
    const text = `⚖️ *AQUASENTINEL MUNICIPAL DESILTING FORENSIC AUDIT* ⚖️\n\n📍 *Drain:* ${audit.drainName} (${audit.location})\n📏 *Dimensions:* ${audit.dimensions.widthMeters}m W × ${audit.dimensions.depthMeters}m D × ${audit.dimensions.lengthMeters}m L\n📦 *Sludge Volume:* ${audit.siltMetrics.siltVolumeCuM} m³ (~${audit.siltMetrics.estimatedTonnage} Tonnes)\n\n💰 *Official KP C&W CSR Ceiling:* PKR ${audit.financials.fairCsrTotalCostPkr.toLocaleString()}\n📑 *Contractor Quoted Claim:* PKR ${audit.financials.contractorQuotedPkr.toLocaleString()}\n🚨 *Overbilling Discrepancy:* ${audit.financials.overbillingPercentage}% (PKR ${audit.financials.overbillingDeltaPkr.toLocaleString()})\n\n📜 *Certificate Hash:* ${audit.certificateHash}\n🔍 *Audit ID:* ${audit.auditId}\n\n*Verified by AquaSentinel AI Quantity Surveyor (Khyber Pakhtunkhwa)*`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[94dvh] my-auto">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#12263A] via-[#1a3854] to-[#0E6B73] text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shadow-lg">
              <Scale className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-white leading-none">
                  AI Drain Doctor: صفائی کا آڈٹ و تخمینہ
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  KP C&W CSR 2026
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#C9D4DA] mt-0.5">
                Peshawar Municipal Desiltation BOQ Surveyor & Anti-Corruption Audit Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Print Official BOQ Certificate"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-red-500/30 text-white hover:text-red-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Templates Bar */}
        <div className="p-3 bg-[#EAF0F2]/70 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4B6073] shrink-0 pl-1">
            Peshawar Drains:
          </span>
          {PESHAWAR_DRAIN_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => loadTemplate(tpl)}
              className="shrink-0 px-2.5 py-1 rounded-xl text-xs font-semibold bg-white hover:bg-emerald-50 text-[#12263A] hover:text-[#0E6B73] border border-slate-300 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>{tpl.drainName.split(" ")[0]}</span>
              <span className="text-[10px] text-slate-400">{tpl.lengthMeters}m</span>
            </button>
          ))}
        </div>

        {/* Segmented Tab Navigation */}
        <div className="flex items-center px-4 pt-2.5 pb-1 bg-white border-b border-slate-200 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "bg-[#0E6B73] text-white shadow-sm"
                : "text-[#4B6073] hover:text-[#12263A] hover:bg-slate-100"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Forensic Audit & Dimensions</span>
          </button>

          <button
            onClick={() => setActiveTab("boq")}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "boq"
                ? "bg-[#0E6B73] text-white shadow-sm"
                : "text-[#4B6073] hover:text-[#12263A] hover:bg-slate-100"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Official KP CSR BOQ Bill</span>
          </button>

          <button
            onClick={() => setActiveTab("certificate")}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "certificate"
                ? "bg-[#0E6B73] text-white shadow-sm"
                : "text-[#4B6073] hover:text-[#12263A] hover:bg-slate-100"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>Audit Certificate & Whistleblower</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 max-h-[calc(94dvh-170px)]">
          {/* TAB 1: OVERVIEW & INTERACTIVE SLIDERS */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Sliders Grid */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading text-sm font-bold text-[#12263A] flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#0E6B73]" />
                    <span>Drain Channel Parameters & Sludge Fill</span>
                  </h4>
                  <button
                    onClick={executeAudit}
                    className="px-3 py-1 rounded-lg bg-[#0E6B73] hover:bg-[#095259] text-white text-xs font-bold transition cursor-pointer"
                  >
                    Recalculate BOQ
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Width Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-[#12263A]">
                      <span>Width (W):</span>
                      <span className="text-[#0E6B73] font-mono">{widthMeters} m</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={8.0}
                      step={0.1}
                      value={widthMeters}
                      onChange={(e) => setWidthMeters(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0E6B73]"
                    />
                  </div>

                  {/* Depth Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-[#12263A]">
                      <span>Depth (D):</span>
                      <span className="text-[#0E6B73] font-mono">{depthMeters} m</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={5.0}
                      step={0.1}
                      value={depthMeters}
                      onChange={(e) => setDepthMeters(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0E6B73]"
                    />
                  </div>

                  {/* Length Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-[#12263A]">
                      <span>Length (L):</span>
                      <span className="text-[#0E6B73] font-mono">{lengthMeters} m</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={2500}
                      step={10}
                      value={lengthMeters}
                      onChange={(e) => setLengthMeters(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0E6B73]"
                    />
                  </div>

                  {/* Silt Fill % Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-[#12263A]">
                      <span>Choke Level:</span>
                      <span className="text-red-600 font-mono">{siltFillPercentage}% Filled</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={siltFillPercentage}
                      onChange={(e) => setSiltFillPercentage(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                  </div>
                </div>

                {/* Waste Type & Contractor Claim Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#12263A]">Sludge Composition:</label>
                    <select
                      value={wasteType}
                      onChange={(e) => setWasteType(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3 py-2 text-[#12263A]"
                    >
                      <option value="dense_sludge">Dense Organic Sludge (کالا کیچڑ) - 1.65 t/m³</option>
                      <option value="plastic_waste">Plastic Bags & Solid Trash (پلاسٹک کچرا) - 1.15 t/m³</option>
                      <option value="gravel_grit">Heavy Sand & Construction Grit (ریت/ملبہ) - 1.95 t/m³</option>
                      <option value="mixed_municipal">Mixed Municipal Solid Waste - 1.45 t/m³</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#12263A]">Contractor Quoted Claim (PKR):</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
                      <input
                        type="number"
                        value={contractorClaim}
                        onChange={(e) => setContractorClaim(Number(e.target.value))}
                        className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-[#12263A]"
                        placeholder="e.g. 5500000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* FORENSIC VERDICT CARD */}
              {audit && (
                <div
                  className={`p-5 rounded-3xl border-2 space-y-4 shadow-lg ${
                    audit.financials.corruptionRiskLevel === "high_fraud_alert"
                      ? "bg-red-50/80 border-red-500/80 text-red-950"
                      : audit.financials.corruptionRiskLevel === "moderate_risk"
                      ? "bg-amber-50/80 border-amber-500/80 text-amber-950"
                      : "bg-emerald-50/80 border-emerald-500/80 text-emerald-950"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          audit.financials.corruptionRiskLevel === "high_fraud_alert"
                            ? "bg-red-600 text-white animate-pulse"
                            : "bg-amber-600 text-white"
                        }`}
                      >
                        <Scale className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-75">
                          Anti-Corruption Forensic Verdict
                        </span>
                        <h4 className="font-heading text-base sm:text-lg font-bold leading-tight">
                          {audit.financials.corruptionRiskLevel === "high_fraud_alert"
                            ? "🚨 HIGH FRAUD ALERT: CARTEL OVERBILLING DETECTED"
                            : audit.financials.corruptionRiskLevel === "moderate_risk"
                            ? "⚠️ ELEVATED MARGIN: AUDIT SCRUTINY ADVISED"
                            : "✅ COMPLIANT MUNICIPAL TENDER"}
                        </h4>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                        Discrepancy Delta
                      </span>
                      <span className="font-mono text-xl sm:text-2xl font-black text-red-700">
                        +{audit.financials.overbillingPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Financial Comparison Pillars */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200 shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Official Fair KP CSR Rate
                      </span>
                      <span className="font-mono text-base sm:text-lg font-extrabold text-emerald-700 leading-tight">
                        PKR {audit.financials.fairCsrTotalCostPkr.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Statutory C&W scheduled ceiling
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200 shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Contractor Claimed Tender
                      </span>
                      <span className="font-mono text-base sm:text-lg font-extrabold text-[#12263A] leading-tight">
                        PKR {audit.financials.contractorQuotedPkr.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Submitted procurement invoice
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/90 border border-red-300 shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
                        Public Funds Overbilled
                      </span>
                      <span className="font-mono text-base sm:text-lg font-extrabold text-red-600 leading-tight">
                        PKR {audit.financials.overbillingDeltaPkr.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-red-500 block mt-0.5">
                        Taxpayer funds flagged for recovery
                      </span>
                    </div>
                  </div>

                  {/* Urdu & English Legal Narrative */}
                  <div className="space-y-2 text-xs">
                    <p className="font-medium text-slate-800 leading-relaxed">
                      {audit.antiCorruptionVerdictEn}
                    </p>
                    <p
                      dir="rtl"
                      className="font-serif font-bold text-sm text-slate-900 leading-relaxed border-t border-black/5 pt-2"
                    >
                      {audit.antiCorruptionVerdictUrdu}
                    </p>
                  </div>
                </div>
              )}

              {/* Machinery & Physical Quantities */}
              {audit && (
                <div className="p-5 rounded-2xl bg-[#EAF0F2]/70 border border-slate-200 space-y-4">
                  <h4 className="font-heading text-sm font-bold text-[#12263A] flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#0E6B73]" />
                    <span>Scientific Physical Quantities & Machinery Mobilization</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Sludge Volume
                      </span>
                      <span className="font-mono text-lg font-extrabold text-[#0E6B73]">
                        {audit.siltMetrics.siltVolumeCuM.toLocaleString()} m³
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        ~{audit.siltMetrics.estimatedTonnage} Tonnes
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Jetting Vacuum
                      </span>
                      <span className="font-mono text-lg font-extrabold text-[#0E6B73]">
                        {audit.machineryRequired.jettingSuckerHours} Hours
                      </span>
                      <span className="text-[10px] text-slate-400 block">Heavy Sucker Truck</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Tipper Dumpers
                      </span>
                      <span className="font-mono text-lg font-extrabold text-[#0E6B73]">
                        {audit.machineryRequired.tipperDumperTrips} Trips
                      </span>
                      <span className="text-[10px] text-slate-400 block">Shamshatoo Landfill</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Sanitation Crew
                      </span>
                      <span className="font-mono text-lg font-extrabold text-[#0E6B73]">
                        {audit.machineryRequired.laborManDays} Days
                      </span>
                      <span className="text-[10px] text-slate-400 block">Confined Space Labor</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OFFICIAL KP CSR BILL OF QUANTITIES (BOQ) */}
          {activeTab === "boq" && audit && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading text-sm sm:text-base font-bold text-[#12263A]">
                    Official Statutory Bill of Quantities (BOQ)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Compliant with Khyber Pakhtunkhwa C&W Composite Schedule of Rates (CSR)
                  </p>
                </div>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#12263A] text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print BOQ</span>
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#12263A] text-white">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Item Code</th>
                      <th className="py-2.5 px-3 font-semibold">Description of Work</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Quantity</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Unit</th>
                      <th className="py-2.5 px-3 font-semibold text-right">CSR Rate (PKR)</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Total Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {audit.boqItems.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#0E6B73]">
                          {item.itemCode}
                        </td>
                        <td className="py-2.5 px-3 text-[#12263A]">
                          <span className="font-semibold block">{item.description}</span>
                          <span className="text-[10px] text-slate-400">{item.csrReference}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-right font-bold text-slate-800">
                          {item.quantity.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500">{item.unit}</td>
                        <td className="py-2.5 px-3 font-mono text-right text-slate-700">
                          {item.unitRatePkr.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-right font-bold text-[#12263A]">
                          {item.totalCostPkr.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <tr>
                      <td colSpan={5} className="py-3 px-3 text-right text-[#12263A]">
                        Total Statutory KP CSR Ceiling Cost:
                      </td>
                      <td className="py-3 px-3 font-mono text-right text-sm text-emerald-800">
                        PKR {audit.financials.fairCsrTotalCostPkr.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: OFFICIAL AUDIT CERTIFICATE & WHISTLEBLOWER DISPATCH */}
          {activeTab === "certificate" && audit && (
            <div className="space-y-5">
              {/* Official Certificate Paper Frame */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border-4 border-double border-slate-300 shadow-xl space-y-6 text-[#12263A]">
                {/* Certificate Crest */}
                <div className="text-center border-b-2 border-slate-300 pb-4 space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Scale className="w-6 h-6 text-[#0E6B73]" />
                    <span className="font-heading text-lg sm:text-xl font-black uppercase tracking-wider text-[#12263A]">
                      GOVERNMENT OF KHYBER PAKHTUNKHWA
                    </span>
                  </div>
                  <h4 className="font-heading text-sm font-bold uppercase tracking-widest text-[#0E6B73]">
                    Municipal Desiltation & Quantity Survey Forensic Certificate
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Issued under KP Public Procurement Regulatory Authority (KPPRA) Act & Local Govt Code
                  </span>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">Audit ID:</span>
                    <span className="font-mono font-bold text-slate-800">{audit.auditId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Certified Date:</span>
                    <span className="font-mono text-slate-800">{new Date(audit.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Target Infrastructure:</span>
                    <span className="font-bold text-slate-800">{audit.drainName}</span>
                  </div>
                </div>

                {/* Audit Cryptographic Stamp */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Cryptographic Forensic Hash:
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold">
                      VERIFIED TAMPER-PROOF
                    </span>
                  </div>
                  <p className="text-slate-600 break-all bg-white p-2 rounded border border-slate-200">
                    {audit.certificateHash}
                  </p>
                </div>

                {/* Action Advice */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs space-y-1">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <BadgeAlert className="w-4 h-4 text-amber-700" />
                    Statutory Whistleblower Directive:
                  </span>
                  <p className="text-amber-800 leading-relaxed">{audit.whistleblowerAdvice}</p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={handleShareWhistleblower}
                    className="w-full sm:w-1/2 h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>WhatsApp Evidence to Anti-Corruption</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="w-full sm:w-1/2 h-11 rounded-xl bg-[#12263A] hover:bg-[#1a3854] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Official Certificate Document</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
