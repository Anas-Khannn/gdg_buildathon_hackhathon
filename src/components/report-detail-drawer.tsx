"use client";

import React, { useState } from "react";
import type { ReportItem } from "@/types/report";
import { useSession } from "@/components/providers";
import { useLanguage } from "@/components/language-provider";
import { DropletPin } from "@/components/droplet-pin";
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
} from "lucide-react";

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${report.lat},${report.lng}`;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white shadow-2xl border-l border-[#C9D4DA] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="p-4 bg-gradient-to-r from-[#12263A] to-[#183652] text-white flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <DropletPin
            severity={isVerifiedFixed ? "fixed" : report.severity}
            size={26}
          />
          <div>
            <span className="text-[10px] font-extrabold tracking-wider text-[#C9D4DA] uppercase block">
              {areaName}
            </span>
            <h3 className="font-heading text-base font-bold leading-tight text-white">
              {t.types[report.type] || report.type}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            title="Share report link"
            className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Photo Display Card with Floating Severity Badge */}
        <div className="relative rounded-2xl overflow-hidden border border-[#C9D4DA] bg-slate-900 aspect-video shadow-md">
          <img
            src={`/api/photos/${report.photoFile}`}
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

          <div className="absolute bottom-3 left-3 text-white text-[11px] font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{report.lat.toFixed(4)}, {report.lng.toFixed(4)}</span>
          </div>
        </div>

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
                  ? "Confirmed clear by community members"
                  : "Requires 3 citizen votes"}
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
    </div>
  );
}
