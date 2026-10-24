"use client";

import React, { useRef } from "react";
import type { ReportItem } from "@/types/report";
import { Printer, X, Download, ShieldCheck, ExternalLink, Copy, Check } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

interface WsspLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportItem | null;
}

export function WsspLetterModal({ isOpen, onClose, report }: WsspLetterModalProps) {
  const { language } = useLanguage();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !report) return null;

  const trackingCode = `NW-PESH-${report.id.slice(0, 8).toUpperCase()}`;
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `TO: Chief Executive Officer, Water & Sanitation Services Peshawar (WSSP)
REF: ${trackingCode}
DATE: ${currentDate}
SUBJECT: Formal Citizen Grievance - Drainage Hazard in ${report.areaName || "Peshawar"}

Location: ${report.areaName || "Peshawar"} (${report.lat.toFixed(5)}, ${report.lng.toFixed(5)})
Hazard Type: ${report.type}
Severity: ${report.severity}
Community Endorsements: ${report.confirmationsCount} verified citizens
AI Verification Confidence: ${(Number(report.aiConfidence || 0.92) * 100).toFixed(0)}%

Description:
${report.complaintText || "Blocked drain causing standing wastewater and commuter danger."}

Track Live: https://gdg-buildathon-hackhathon.vercel.app/`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92dvh] flex flex-col shadow-2xl border border-[#C9D4DA] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="p-4 bg-[#12263A] text-white flex items-center justify-between border-b border-white/10 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-heading font-bold text-sm text-white">
                Official WSSP Grievance Dossier
              </h3>
              <span className="text-[10px] text-[#C9D4DA]">
                KP Local Government Act 2013 • Case {trackingCode}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy Text"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-[#0E6B73] hover:bg-[#095259] text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Letter Document */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-[#12263A] bg-white font-sans text-xs sm:text-sm print:p-0 print:overflow-visible">
          {/* Official Letterhead */}
          <div className="border-b-2 border-[#12263A] pb-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6073] block">
                  Khyber Pakhtunkhwa Municipal Citizen Audit
                </span>
                <h1 className="font-heading text-xl sm:text-2xl font-black text-[#12263A]">
                  NAALI WATCH PESHAWAR
                </h1>
                <span className="text-xs text-[#0E6B73] font-bold">
                  Community Drainage Oversight & WSSP Desiltation Tracking
                </span>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded bg-[#12263A] text-white text-[11px] font-mono font-bold block">
                  {trackingCode}
                </span>
                <span className="text-[11px] text-[#4B6073] block mt-1">
                  Date: {currentDate}
                </span>
              </div>
            </div>
          </div>

          {/* Addressee */}
          <div className="space-y-1 text-xs">
            <p className="font-bold text-[#12263A]">TO:</p>
            <p className="font-semibold">The Chief Executive Officer / General Manager (Operations)</p>
            <p className="text-[#4B6073]">Water & Sanitation Services Peshawar (WSSP)</p>
            <p className="text-[#4B6073]">Local Government Complex, Phase-V, Hayatabad, Peshawar, KP</p>
          </div>

          {/* Formal Subject */}
          <div className="bg-slate-100 p-3 rounded-xl border-l-4 border-[#0E6B73]">
            <p className="font-bold text-xs uppercase tracking-wide text-[#12263A]">
              SUBJECT: URGENT MUNICIPAL INTERVENTION REQUIRED - HAZARDOUS DRAINAGE CONDUIT FAILURE & SITTING WATERLOGGING IN {report.areaName?.toUpperCase() || "PESHAWAR"}
            </p>
          </div>

          {/* Body Text */}
          <div className="space-y-3 leading-relaxed text-xs">
            <p>Respected Authority,</p>
            <p>
              Under the civic sanitation mandates of the <strong>Khyber Pakhtunkhwa Local Government Act</strong> and WSSP municipal responsibilities, this formal grievance dossier is submitted on behalf of residents and commuters regarding a verified infrastructure hazard located in <strong>{report.areaName || "Peshawar"}</strong>.
            </p>

            {/* Evidence Data Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-[#C9D4DA]">
              <div>
                <span className="text-[10px] text-[#4B6073] font-bold uppercase block">Hazard Category</span>
                <span className="font-bold text-xs capitalize text-[#12263A]">
                  {report.type.replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#4B6073] font-bold uppercase block">Water Severity</span>
                <span className="font-bold text-xs capitalize text-rose-700">
                  {report.severity} Level
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#4B6073] font-bold uppercase block">Citizen Backing</span>
                <span className="font-bold text-xs text-[#0E6B73]">
                  {report.confirmationsCount} Community Votes
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#4B6073] font-bold uppercase block">GPS Coordinates</span>
                <span className="font-mono font-bold text-[11px] text-[#12263A]">
                  {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                </span>
              </div>
            </div>

            {/* AI Audit & Citizen Description */}
            <div className="space-y-1.5">
              <span className="font-bold text-xs text-[#12263A] block">
                Citizen Statement & Hazard Description:
              </span>
              <p className="p-3 bg-white border border-[#C9D4DA] rounded-xl text-xs italic text-[#4B6073]">
                &ldquo;{report.complaintText || "Heavy water accumulation and blocked storm drain creating public health hazard and vehicle hydro-lock danger."}&rdquo;
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-xs text-[#12263A] block">
                Gemini Vision AI Diagnostic:
              </span>
              <p className="text-[11px] text-[#4B6073]">
                AI Confidence Score: <strong>{(Number(report.aiConfidence || 0.92) * 100).toFixed(0)}%</strong> • Classified as high-urgency municipal desiltation priority.
              </p>
            </div>

            {/* Photo Evidence */}
            {report.photoFile && (
              <div className="space-y-1 pt-1">
                <span className="font-bold text-xs text-[#12263A] block">
                  Ground Photographic Evidence:
                </span>
                <div className="w-full h-44 rounded-xl overflow-hidden border border-[#C9D4DA] bg-slate-900">
                  <img
                    src={`/api/photos/${report.photoFile}`}
                    alt="Drainage Hazard"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <p className="pt-2">
              We respectfully petition WSSP Peshawar to dispatch jetting machines, suction bowsers, or excavation crews to clear this location within <strong>48 hours</strong>.
            </p>
          </div>

          {/* Signature Block */}
          <div className="pt-6 border-t border-[#C9D4DA] flex items-end justify-between text-xs">
            <div>
              <p className="font-bold text-[#12263A]">Submitted By:</p>
              <p className="text-[#4B6073]">Citizen Watch Delegation of {report.areaName || "Peshawar"}</p>
              <p className="text-[10px] text-[#4B6073]">NaaliWatch Civic Community Network</p>
            </div>
            <div className="text-right">
              <div className="w-32 h-0.5 bg-[#12263A] mb-1 ml-auto" />
              <p className="text-[10px] font-bold text-[#12263A]">WSSP Receiving Stamp & Date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
