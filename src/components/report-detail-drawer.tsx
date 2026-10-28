"use client";

import React, { useState, useRef } from "react";
import type { ReportItem } from "@/types/report";
import { useSession } from "@/components/providers";
import { useLanguage } from "@/components/language-provider";
import { DropletPin } from "@/components/droplet-pin";
import {
  generateWSSPDispatchUrl,
  generateCitizenWarningShareUrl,
} from "@/lib/whatsapp";
import {
  X,
  MapPin,
  Clock,
  ThumbsUp,
  CheckCircle2,
  AlertTriangle,
  Share2,
  Shield,
  EyeOff,
  Navigation,
  Check,
  MessageCircle,
  Camera,
  Sparkles,
  Upload,
  ArrowRight,
  RefreshCw,
  FileText,
  PhoneCall,
} from "lucide-react";
import { WsspLetterModal } from "@/components/wssp-letter-modal";

interface ReportDetailDrawerProps {
  report: ReportItem | null;
  onClose: () => void;
  onReportUpdated: (updated: ReportItem) => void;
}

export function ReportDetailDrawer({
  report,
  onClose,
  onReportUpdated,
}: ReportDetailDrawerProps) {
  const { t, language } = useLanguage();
  const { data: session } = useSession();
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [fixCheckLoading, setFixCheckLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLetterOpen, setIsLetterOpen] = useState(false);

  // Before & After comparison state
  const [activePhotoTab, setActivePhotoTab] = useState<"before" | "after">("before");
  const [uploadingFix, setUploadingFix] = useState(false);
  const [fixError, setFixError] = useState<string | null>(null);
  const [fixSuccess, setFixSuccess] = useState<string | null>(null);
  const fixFileInputRef = useRef<HTMLInputElement>(null);

  if (!report) return null;

  const userRole = (session?.user as unknown as { role?: string })?.role || "user";
  const isAdmin = userRole === "admin";

  const isVerifiedFixed = report.status === "verified_fixed";
  const isMarkedFixed = report.status === "marked_fixed";

  const areaName =
    language === "ps" && report.areaNamePs
      ? report.areaNamePs
      : language === "ur" && report.areaNameUr
      ? report.areaNameUr
      : report.areaName || "Peshawar";

  const handleConfirm = async () => {
    if (hasConfirmed) return;
    setConfirmLoading(true);
    try {
      const res = await fetch(`/api/reports/${report.id}/confirm`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setHasConfirmed(true);
        onReportUpdated({
          ...report,
          confirmationsCount: data.count,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleFixCheckVote = async (isFixed: boolean) => {
    setFixCheckLoading(true);
    try {
      const res = await fetch(`/api/reports/${report.id}/fix-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFixed }),
      });
      if (res.ok) {
        const data = await res.json();
        onReportUpdated({
          ...report,
          status: data.status,
          fixChecksYesCount: data.yesVotes,
          fixChecksNoCount: data.noVotes,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFixCheckLoading(false);
    }
  };

  const handleAdminStatus = async (
    newStatus: "open" | "sent" | "marked_fixed" | "verified_fixed",
    hidden = false
  ) => {
    setAdminLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${report.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-override": "true",
        },
        body: JSON.stringify({ status: newStatus, hidden }),
      });
      if (res.ok) {
        onReportUpdated({
          ...report,
          status: newStatus,
        });
        if (hidden) onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleFixPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFix(true);
    setFixError(null);
    setFixSuccess(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/reports/${report.id}/verify-fix`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process resolution photo");
      }

      setFixSuccess(data.verification?.verdictTitle || "Resolution submitted!");
      setActivePhotoTab("after");

      if (data.report) {
        onReportUpdated({
          ...report,
          status: data.report.status,
          fixPhotoFile: data.report.fixPhotoFile,
          aiFixConfidence: data.report.aiFixConfidence,
          aiFixAnalysis: data.report.aiFixAnalysis,
          markedFixedAt: data.report.markedFixedAt,
          verifiedAt: data.report.verifiedAt,
        });
      }
    } catch (err: any) {
      console.error(err);
      setFixError(err?.message || "Failed to analyze photo");
    } finally {
      setUploadingFix(false);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${report.lat},${report.lng}`;
  const wsspWhatsAppUrl = generateWSSPDispatchUrl(report);
  const citizenWarningUrl = generateCitizenWarningShareUrl(report, language);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white shadow-2xl border-l border-[#C9D4DA] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 overscroll-contain">
      {/* Drawer Header */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#12263A] to-[#183652] text-white flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <DropletPin
            severity={isVerifiedFixed ? "fixed" : report.severity}
            size={26}
          />
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C9D4DA] block truncate">
              {areaName} • NW-{report.id.slice(0, 6).toUpperCase()}
            </span>
            <h3 className="font-heading text-base font-bold leading-tight text-white truncate">
              {t.types[report.type] || report.type}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleShare}
            title="Copy report link"
            className="p-2 min-w-[36px] min-h-[36px] rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition flex items-center justify-center"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 min-w-[36px] min-h-[36px] rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        {/* ===================================================================
            BEFORE & AFTER PHOTO COMPARISON VIEWER
           =================================================================== */}
        <div className="space-y-2">
          {report.fixPhotoFile && (
            <div className="flex p-1 bg-[#EAF0F2] rounded-xl border border-[#C9D4DA] text-xs font-bold">
              <button
                type="button"
                onClick={() => setActivePhotoTab("before")}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  activePhotoTab === "before"
                    ? "bg-[#12263A] text-white shadow-xs"
                    : "text-[#4B6073] hover:text-[#12263A]"
                }`}
              >
                1. Before (Reported Hazard)
              </button>
              <button
                type="button"
                onClick={() => setActivePhotoTab("after")}
                className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  activePhotoTab === "after"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-emerald-700 hover:text-emerald-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>2. After Cleanup (AI Verified)</span>
              </button>
            </div>
          )}

          {/* Photo Display Card with Floating Badges */}
          <div className="relative rounded-2xl overflow-hidden border border-[#C9D4DA] bg-slate-900 aspect-video shadow-md">
            <img
              src={
                activePhotoTab === "after" && report.fixPhotoFile
                  ? `/api/photos/${report.fixPhotoFile}`
                  : `/api/photos/${report.photoFile}`
              }
              alt={report.complaintText || "Drain problem photo"}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1 rounded-full border border-white/20 shadow-md">
              {isVerifiedFixed ? t.severities.fixed : t.severities[report.severity]}
            </div>

            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10">
              {activePhotoTab === "after" && report.fixPhotoFile ? "📸 Post-Fix Proof" : "📸 Initial Report Photo"}
            </div>

            <div className="absolute bottom-3 left-3 text-white text-[11px] font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{report.lat.toFixed(4)}, {report.lng.toFixed(4)}</span>
            </div>
          </div>
        </div>

        {/* ===================================================================
            GEMINI AI RESOLUTION INSPECTION CARD (If Fix Verified)
           =================================================================== */}
        {report.fixPhotoFile && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-[#12263A] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Gemini Vision Resolution Audit</span>
              </div>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 border border-emerald-300">
                {Math.round(Number(report.aiFixConfidence || "0.90") * 100)}% Match
              </span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed font-medium">
              {report.aiFixAnalysis || "AI visual analysis confirms standing wastewater was pumped out and roadway is clear for transit."}
            </p>
          </div>
        )}

        {/* Complaint Description Box */}
        <div className="bg-[#EAF0F2]/70 p-4 rounded-2xl border border-[#C9D4DA]">
          <div className="text-[10px] font-extrabold text-[#4B6073] uppercase tracking-wider mb-1.5">
            Official Complaint Details
          </div>
          <p className="text-xs sm:text-sm text-[#12263A] leading-relaxed font-medium">
            {report.complaintText || "No complaint text provided."}
          </p>
          <div className="mt-3 pt-3 border-t border-[#C9D4DA]/60 flex items-center justify-between text-xs">
            <span className="text-[#4B6073]">Peshawar WSSP Zone</span>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0E6B73] font-bold flex items-center gap-1 hover:underline"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>

        {/* ===================================================================
            1-TAP WHATSAPP DISPATCH & NEIGHBORHOOD ALERT BUTTONS
           =================================================================== */}
        <div className="space-y-2.5">
          <div className="text-[10px] font-extrabold text-[#4B6073] uppercase tracking-wider">
            Municipal & Community Dispatch
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Urgent Life Hazard Emergency Hotline Alert */}
            {(report.severity === "danger" || report.type === "open_manhole") && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-300 flex items-center justify-between gap-2.5 col-span-1 sm:col-span-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-red-900 block truncate">
                      Imminent Life / Flood Hazard
                    </span>
                    <span className="text-[10px] text-red-700 block truncate">
                      Submerged live wire, deep underpass or open manhole
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("naali-open-emergency"));
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>SOS 1122/1334</span>
                </button>
              </div>
            )}

            {/* WSSP WhatsApp Dispatch */}
            <a
              href={wsspWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-3 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20 transition-transform active:scale-98 group"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <div className="text-left leading-tight">
                <span className="block text-[11px] font-bold">WSSP WhatsApp</span>
                <span className="text-[9px] opacity-90 font-normal">Official Dispatch</span>
              </div>
            </a>

            {/* Neighborhood WhatsApp Hazard Alert */}
            <a
              href={citizenWarningUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-3 rounded-2xl bg-[#12263A] hover:bg-[#1b3752] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98 group"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <div className="text-left leading-tight">
                <span className="block text-[11px] font-bold">Share Road Alert</span>
                <span className="text-[9px] text-[#C9D4DA] font-normal">Family / Groups</span>
              </div>
            </a>

            {/* Official WSSP Grievance Dossier (Printable / PDF) */}
            <button
              type="button"
              onClick={() => setIsLetterOpen(true)}
              className="py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-[#C9D4DA] text-[#12263A] font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition active:scale-98 col-span-1 sm:col-span-2"
            >
              <FileText className="w-4 h-4 text-[#0E6B73]" />
              <span>Official WSSP Grievance Letter (Print / PDF)</span>
            </button>
          </div>
        </div>

        {/* ===================================================================
            UPLOAD PROOF OF FIX (GEMINI AI INSPECTION TRIGGER)
           =================================================================== */}
        {!isVerifiedFixed && (
          <div className="p-4 rounded-2xl border-2 border-dashed border-[#0E6B73]/40 bg-[#0E6B73]/5 space-y-3">
            <div className="flex items-center gap-2 text-[#0E6B73]">
              <Camera className="w-4 h-4 shrink-0" />
              <div className="leading-tight">
                <span className="text-xs font-bold block text-[#12263A]">
                  Cleaned this drain? Upload After-Fix Proof
                </span>
                <span className="text-[10px] text-[#4B6073]">
                  Gemini 1.5 Vision inspects before & after photos to verify cleanup
                </span>
              </div>
            </div>

            <input
              ref={fixFileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFixPhotoUpload}
              className="hidden"
            />

            <button
              type="button"
              disabled={uploadingFix}
              onClick={() => fixFileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0E6B73] hover:bg-[#095259] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs disabled:opacity-50"
            >
              {uploadingFix ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>AI Inspecting Before/After Photos...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload & Verify Cleanup</span>
                </>
              )}
            </button>

            {fixError && (
              <p className="text-xs text-red-600 font-medium">{fixError}</p>
            )}
            {fixSuccess && (
              <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{fixSuccess}</span>
              </p>
            )}
          </div>
        )}

        {/* "I SEE THIS TOO" Confirmation Button (PRD F6) */}
        <div>
          <button
            onClick={handleConfirm}
            disabled={hasConfirmed || confirmLoading}
            className={`w-full py-3.5 px-4 rounded-2xl font-heading font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 ${
              hasConfirmed
                ? "bg-emerald-50 text-[#2E7D4F] border-2 border-[#2E7D4F]/30 cursor-default"
                : "bg-gradient-to-r from-[#0E6B73] to-[#095259] hover:from-[#095259] hover:to-[#0E6B73] text-white shadow-[#0E6B73]/25"
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${hasConfirmed ? "fill-current" : ""}`} />
            <span>{hasConfirmed ? "Confirmed by you" : t.seeThisToo}</span>
            <span className="bg-black/20 text-white text-xs font-sans font-bold px-2.5 py-0.5 rounded-full">
              {report.confirmationsCount}
            </span>
          </button>
        </div>

        {/* CITIZEN FIX CHECK VOTING BOX (PRD F9) */}
        {isMarkedFixed && (
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <div className="font-heading font-bold text-sm">
                  {t.isItReallyFixed}
                </div>
                <div className="text-[11px] text-amber-800/80">
                  WSSP reported this resolved. Citizens nearby verify if true.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleFixCheckVote(true)}
                disabled={fixCheckLoading}
                className="py-2.5 px-3 rounded-xl bg-[#2E7D4F] hover:bg-[#256640] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1"
              >
                <span>{t.yesFixed}</span>
                <span className="opacity-80">({report.fixChecksYesCount})</span>
              </button>
              <button
                onClick={() => handleFixCheckVote(false)}
                disabled={fixCheckLoading}
                className="py-2.5 px-3 rounded-xl bg-[#C8321F] hover:bg-[#a6291a] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1"
              >
                <span>{t.noStillThere}</span>
                <span className="opacity-80">({report.fixChecksNoCount})</span>
              </button>
            </div>
            <div className="text-[10px] text-center text-[#4B6073]">
              Quorum of 3 citizen votes confirms resolution or returns issue to Open.
            </div>
          </div>
        )}

        {/* VERTICAL STATUS TIMELINE (PRD F5) */}
        <div className="space-y-3 pt-1">
          <div className="text-xs font-extrabold text-[#12263A] uppercase tracking-wider">
            Verification Timeline
          </div>
          <div className="relative pl-6 space-y-4 border-l-2 border-[#C9D4DA] ml-2">
            {/* Step 1: Reported */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#0E6B73] border-2 border-white shadow-xs" />
              <div className="text-xs font-bold text-[#12263A]">
                {t.status.open}
              </div>
              <div className="text-[11px] text-[#4B6073]">
                {new Date(report.createdAt).toLocaleDateString()} at{" "}
                {new Date(report.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>

            {/* Step 2: Sent to WSSP */}
            <div className="relative">
              <div
                className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                  report.status !== "open" ? "bg-[#0E6B73]" : "bg-[#C9D4DA]"
                }`}
              />
              <div className="text-xs font-bold text-[#12263A]">
                {t.status.sent}
              </div>
              <div className="text-[11px] text-[#4B6073]">
                {report.sentAt
                  ? new Date(report.sentAt).toLocaleDateString()
                  : "Automatic complaint dispatch to WSSP"}
              </div>
            </div>

            {/* Step 3: Marked Fixed */}
            <div className="relative">
              <div
                className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                  isMarkedFixed || isVerifiedFixed ? "bg-[#2E7D4F]" : "bg-[#C9D4DA]"
                }`}
              />
              <div className="text-xs font-bold text-[#12263A]">
                {t.status.marked_fixed}
              </div>
              <div className="text-[11px] text-[#4B6073]">
                {report.markedFixedAt
                  ? new Date(report.markedFixedAt).toLocaleDateString()
                  : "Awaiting municipal clearance"}
              </div>
            </div>

            {/* Step 4: Citizen Verified */}
            <div className="relative">
              <div
                className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                  isVerifiedFixed ? "bg-[#2E7D4F]" : "bg-[#C9D4DA]"
                }`}
              />
              <div className="text-xs font-bold text-[#12263A]">
                {t.status.verified_fixed}
              </div>
              <div className="text-[11px] text-[#4B6073]">
                {isVerifiedFixed
                  ? "Confirmed clear by community members & Gemini Vision"
                  : "Requires 3 citizen votes or AI verification"}
              </div>
            </div>
          </div>
        </div>

        {/* ADMIN MODERATOR ACTIONS (For WSSP / Admins) */}
        {isAdmin && (
          <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50/70 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Shield className="w-4 h-4 text-amber-700" />
              <span>WSSP Operations Panel</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAdminStatus("marked_fixed")}
                disabled={adminLoading || isMarkedFixed || isVerifiedFixed}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#2E7D4F] text-white text-xs font-bold hover:bg-[#256640] transition disabled:opacity-50 shadow-xs"
              >
                Mark Fixed
              </button>
              <button
                onClick={() => handleAdminStatus(report.status, true)}
                disabled={adminLoading}
                className="py-2.5 px-3 rounded-xl bg-red-100 text-red-800 border border-red-300 text-xs font-bold hover:bg-red-200 transition"
              >
                <EyeOff className="w-3.5 h-3.5 inline mr-1" />
                Hide
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Official WSSP Grievance Dossier Modal */}
      <WsspLetterModal
        isOpen={isLetterOpen}
        onClose={() => setIsLetterOpen(false)}
        report={report}
      />
    </div>
  );
}
