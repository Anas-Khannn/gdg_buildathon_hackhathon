"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { useLanguage } from "@/components/language-provider";
import type { DrainDoctorAudit } from "@/lib/drain-doctor-engine";
import { PESHAWAR_DRAIN_TEMPLATES } from "@/lib/drain-doctor-engine";
import {
  Scale,
  Sliders,
  FileSpreadsheet,
  ShieldCheck,
  Truck,
  Printer,
  Share2,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  BadgeAlert,
  Building,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function DrainDoctorPage() {
  const { language } = useLanguage();

  const [drainName, setDrainName] = useState(PESHAWAR_DRAIN_TEMPLATES[0].drainName);
  const [location, setLocation] = useState(PESHAWAR_DRAIN_TEMPLATES[0].location);
  const [widthMeters, setWidthMeters] = useState<number>(PESHAWAR_DRAIN_TEMPLATES[0].widthMeters);
  const [depthMeters, setDepthMeters] = useState<number>(PESHAWAR_DRAIN_TEMPLATES[0].depthMeters);
  const [lengthMeters, setLengthMeters] = useState<number>(PESHAWAR_DRAIN_TEMPLATES[0].lengthMeters);
  const [siltFillPercentage, setSiltFillPercentage] = useState<number>(PESHAWAR_DRAIN_TEMPLATES[0].siltFillPercentage);
  const [wasteType, setWasteType] = useState<string>(PESHAWAR_DRAIN_TEMPLATES[0].wasteType);
  const [contractorClaim, setContractorClaim] = useState<number>(PESHAWAR_DRAIN_TEMPLATES[0].contractorQuotedPkr);

  const [audit, setAudit] = useState<DrainDoctorAudit | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"overview" | "boq" | "certificate">("overview");

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
      console.error("Audit load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeAudit();
  }, []);

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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0E6B73] hover:text-[#095259] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Live Map</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#12263A] text-xs font-bold border border-slate-300 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#0E6B73]" />
              <span>Print BOQ Certificate</span>
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#12263A] via-[#1a3854] to-[#0E6B73] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                Anti-Corruption Public Works Watch
              </span>
              <span className="text-[11px] font-bold text-[#C9D4DA]">
                KP C&W CSR 2026 Schedule
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight">
              AI Drain Doctor: Municipal Desiltation Audit
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Empowering Peshawar citizens and oversight agencies with automated quantity surveying, 
              sludge mass calculation, heavy machinery requirements, and statutory KP Composite Schedule of Rates (CSR) forensic analysis.
            </p>
          </div>
        </div>

        {/* Templates Quick Selector */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Select Peshawar Drain Channel Template:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PESHAWAR_DRAIN_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => loadTemplate(tpl)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  drainName === tpl.drainName
                    ? "bg-emerald-50/80 border-[#0E6B73] shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <span className="font-heading text-xs font-bold text-[#12263A] block truncate">
                  {tpl.drainName}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {tpl.widthMeters}m × {tpl.depthMeters}m | {tpl.lengthMeters}m long
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Parameters (4 Cols) */}
          <div className="lg:col-span-4 p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-heading text-sm font-bold text-[#12263A] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0E6B73]" />
                <span>Channel Dimensions</span>
              </h3>
              <button
                onClick={executeAudit}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0E6B73] transition"
                title="Refresh Calculation"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold text-[#12263A]">
              {/* Width Slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Channel Width:</span>
                  <span className="text-[#0E6B73] font-mono">{widthMeters} meters</span>
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
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Channel Depth:</span>
                  <span className="text-[#0E6B73] font-mono">{depthMeters} meters</span>
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
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Segment Length:</span>
                  <span className="text-[#0E6B73] font-mono">{lengthMeters} meters</span>
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

              {/* Silt Fill % */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Silt Obstruction:</span>
                  <span className="text-red-600 font-mono">{siltFillPercentage}% Choked</span>
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

              {/* Sludge Composition */}
              <div className="space-y-1 pt-2 border-t border-slate-200">
                <label>Sludge Material Density:</label>
                <select
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-[#12263A] font-medium"
                >
                  <option value="dense_sludge">Dense Saturated Sludge - 1.65 t/m³</option>
                  <option value="plastic_waste">Plastic Debris & Municipal Solid - 1.15 t/m³</option>
                  <option value="gravel_grit">Sand, Grit & Construction Debris - 1.95 t/m³</option>
                  <option value="mixed_municipal">Mixed Urban Sludge - 1.45 t/m³</option>
                </select>
              </div>

              {/* Contractor Quote */}
              <div className="space-y-1">
                <label>Contractor Quoted Tender (PKR):</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-mono">Rs.</span>
                  <input
                    type="number"
                    value={contractorClaim}
                    onChange={(e) => setContractorClaim(Number(e.target.value))}
                    className="w-full font-mono bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-[#12263A]"
                  />
                </div>
              </div>

              <button
                onClick={executeAudit}
                className="w-full py-2.5 rounded-xl bg-[#0E6B73] hover:bg-[#095259] text-white font-bold transition shadow-md cursor-pointer"
              >
                Update Forensic Audit
              </button>
            </div>
          </div>

          {/* Right Column: Audit Results & BOQ (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Segmented Tab Headers */}
            <div className="flex items-center gap-2 border-b border-slate-300 pb-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "overview"
                    ? "bg-[#12263A] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 bg-white"
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Forensic Overview</span>
              </button>

              <button
                onClick={() => setActiveTab("boq")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "boq"
                    ? "bg-[#12263A] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 bg-white"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Official BOQ Breakdown</span>
              </button>

              <button
                onClick={() => setActiveTab("certificate")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "certificate"
                    ? "bg-[#12263A] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 bg-white"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>Audit Certificate</span>
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && audit && (
              <div className="space-y-6">
                {/* Forensic Verdict Card */}
                <div
                  className={`p-6 rounded-3xl border-2 space-y-4 shadow-lg ${
                    audit.financials.corruptionRiskLevel === "high_fraud_alert"
                      ? "bg-red-50/90 border-red-500 text-red-950"
                      : audit.financials.corruptionRiskLevel === "moderate_risk"
                      ? "bg-amber-50/90 border-amber-500 text-amber-950"
                      : "bg-emerald-50/90 border-emerald-500 text-emerald-950"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          audit.financials.corruptionRiskLevel === "high_fraud_alert"
                            ? "bg-red-600 text-white animate-pulse"
                            : "bg-amber-600 text-white"
                        }`}
                      >
                        <Scale className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-75">
                          Anti-Corruption Forensic Assessment
                        </span>
                        <h4 className="font-heading text-lg font-extrabold leading-tight">
                          {audit.financials.corruptionRiskLevel === "high_fraud_alert"
                            ? "🚨 HIGH FRAUD ALERT: CARTEL OVERBILLING DETECTED"
                            : audit.financials.corruptionRiskLevel === "moderate_risk"
                            ? "⚠️ ELEVATED MARGIN: RE-TENDERING ADVISED"
                            : "✅ COMPLIANT TENDER"}
                        </h4>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                        Discrepancy Delta
                      </span>
                      <span className="font-mono text-2xl sm:text-3xl font-black text-red-700">
                        +{audit.financials.overbillingPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Official Fair KP CSR Ceiling
                      </span>
                      <span className="font-mono text-lg font-black text-emerald-700">
                        PKR {audit.financials.fairCsrTotalCostPkr.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Contractor Claimed Tender
                      </span>
                      <span className="font-mono text-lg font-black text-[#12263A]">
                        PKR {audit.financials.contractorQuotedPkr.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-red-300">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
                        Overbilled Delta
                      </span>
                      <span className="font-mono text-lg font-black text-red-600">
                        PKR {audit.financials.overbillingDeltaPkr.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-800 leading-relaxed">
                    {audit.antiCorruptionVerdictEn}
                  </p>
                  <p dir="rtl" className="font-serif text-sm font-bold text-slate-900 leading-relaxed border-t border-black/5 pt-2">
                    {audit.antiCorruptionVerdictUrdu}
                  </p>
                </div>

                {/* Machinery Mobilization */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <h4 className="font-heading text-sm font-bold text-[#12263A] flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#0E6B73]" />
                    <span>Scientific Physical Quantities & Fleet Requirements</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Sludge Volume</span>
                      <span className="font-mono text-xl font-black text-[#0E6B73]">
                        {audit.siltMetrics.siltVolumeCuM.toLocaleString()} m³
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">~{audit.siltMetrics.estimatedTonnage} Tonnes</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Jetting Sucker</span>
                      <span className="font-mono text-xl font-black text-[#0E6B73]">
                        {audit.machineryRequired.jettingSuckerHours} Hours
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Vacuum Truck</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Tipper Dumpers</span>
                      <span className="font-mono text-xl font-black text-[#0E6B73]">
                        {audit.machineryRequired.tipperDumperTrips} Trips
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Shamshatoo Dump</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Sanitation Crew</span>
                      <span className="font-mono text-xl font-black text-[#0E6B73]">
                        {audit.machineryRequired.laborManDays} Days
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Manual Labor</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BOQ */}
            {activeTab === "boq" && audit && (
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading text-base font-bold text-[#12263A]">
                    Official Statutory Bill of Quantities (BOQ)
                  </h4>
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print BOQ</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#12263A] text-white">
                      <tr>
                        <th className="py-2.5 px-3">Item Code</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3 text-right">Quantity</th>
                        <th className="py-2.5 px-3 text-center">Unit</th>
                        <th className="py-2.5 px-3 text-right">CSR Rate (PKR)</th>
                        <th className="py-2.5 px-3 text-right">Total (PKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {audit.boqItems.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-[#0E6B73]">{item.itemCode}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold block">{item.description}</span>
                            <span className="text-[10px] text-slate-400">{item.csrReference}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-right font-bold">{item.quantity.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-center text-slate-500">{item.unit}</td>
                          <td className="py-2.5 px-3 font-mono text-right">{item.unitRatePkr.toLocaleString()}</td>
                          <td className="py-2.5 px-3 font-mono text-right font-bold text-[#12263A]">
                            {item.totalCostPkr.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                      <tr>
                        <td colSpan={5} className="py-3 px-3 text-right">
                          Total Statutory KP CSR Ceiling:
                        </td>
                        <td className="py-3 px-3 font-mono text-right text-emerald-800 text-sm">
                          PKR {audit.financials.fairCsrTotalCostPkr.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: CERTIFICATE */}
            {activeTab === "certificate" && audit && (
              <div className="p-8 rounded-3xl bg-white border-4 border-double border-slate-300 shadow-xl space-y-6">
                <div className="text-center border-b-2 border-slate-300 pb-4 space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Scale className="w-6 h-6 text-[#0E6B73]" />
                    <span className="font-heading text-lg font-black tracking-wider text-[#12263A]">
                      GOVERNMENT OF KHYBER PAKHTUNKHWA
                    </span>
                  </div>
                  <h4 className="font-heading text-sm font-bold uppercase tracking-widest text-[#0E6B73]">
                    Municipal Desiltation & Quantity Survey Forensic Certificate
                  </h4>
                </div>

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

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-1">
                  <div className="flex items-center justify-between">
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

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs space-y-1">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <BadgeAlert className="w-4 h-4 text-amber-700" />
                    Statutory Whistleblower Directive:
                  </span>
                  <p className="text-amber-800 leading-relaxed">{audit.whistleblowerAdvice}</p>
                </div>

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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
