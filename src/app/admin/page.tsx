"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/header";
import type { ReportItem } from "@/types/report";
import { useLanguage } from "@/components/language-provider";
import { useSession } from "@/components/providers";
import { DropletPin } from "@/components/droplet-pin";
import Link from "next/link";
import {
  Shield,
  Download,
  EyeOff,
  Eye,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Trash2,
  RefreshCw,
} from "lucide-react";

export default function AdminPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAdminReports = async () => {
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminReports();
  }, []);

  // Handle Mark Fixed
  const handleMarkFixed = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-override": "true",
        },
        body: JSON.stringify({ status: "marked_fixed" }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "marked_fixed" } : r))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Hide / Unhide Fake Report
  const handleToggleHide = async (id: string, currentHidden: boolean) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-override": "true",
        },
        body: JSON.stringify({ hidden: !currentHidden }),
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  // Export CSV for WSSP / Civic Groups / Journalists (PRD F15)
  const handleExportCSV = () => {
    if (reports.length === 0) return;

    const headers = [
      "ID",
      "Area",
      "Type",
      "Severity",
      "Status",
      "Latitude",
      "Longitude",
      "Confirmations",
      "Created At",
      "Complaint Description",
    ];

    const rows = reports.map((r) => [
      `"${r.id}"`,
      `"${r.areaName || "Peshawar"}"`,
      `"${r.type}"`,
      `"${r.severity}"`,
      `"${r.status}"`,
      r.lat,
      r.lng,
      r.confirmationsCount,
      `"${r.createdAt}"`,
      `"${(r.complaintText || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `naali_watch_peshawar_complaints_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EAF0F2] text-[#12263A]">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C9D4DA]/70 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0E6B73] uppercase tracking-wider">
              <Link href="/" className="hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.mapView}</span>
              </Link>
              <span>•</span>
              <span>WSSP Operations</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#12263A] flex items-center gap-2">
              <Shield className="w-7 h-7 text-[#0E6B73]" />
              <span>Admin Moderation & Complaints Export</span>
            </h1>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="py-2.5 px-4 rounded-xl bg-[#0E6B73] hover:bg-[#0a545a] text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2 self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV for WSSP / Press</span>
          </button>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-2xl border border-[#C9D4DA] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#12263A] text-white text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Severity & Photo</th>
                  <th className="py-3 px-4">Area & Problem</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Confirmations</th>
                  <th className="py-3 px-4 text-right">Moderator Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C9D4DA]/60 text-xs">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-[#EAF0F2]/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <DropletPin severity={report.status === "verified_fixed" ? "fixed" : report.severity} size={24} />
                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                          <img
                            src={`/api/photos/${report.photoFile}`}
                            alt="Drain"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-[#12263A] text-sm">
                        {report.areaName || "Peshawar"}
                      </div>
                      <div className="text-[#0E6B73] font-semibold mt-0.5">
                        {t.types[report.type] || report.type}
                      </div>
                      <div className="text-[11px] text-[#4B6073] line-clamp-1 max-w-xs mt-0.5">
                        {report.complaintText || "No description"}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full font-semibold text-[11px] ${
                          report.status === "verified_fixed"
                            ? "bg-[#2E7D4F]/15 text-[#2E7D4F]"
                            : report.status === "marked_fixed"
                            ? "bg-amber-100 text-amber-800"
                            : report.status === "sent"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-[#4B6073]"
                        }`}
                      >
                        {t.status[report.status]}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-[#12263A]">
                      👥 {report.confirmationsCount}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {report.status !== "marked_fixed" && report.status !== "verified_fixed" && (
                          <button
                            onClick={() => handleMarkFixed(report.id)}
                            disabled={actionLoading === report.id}
                            className="px-2.5 py-1.5 rounded-lg bg-[#2E7D4F] text-white font-semibold text-xs hover:bg-[#256640] transition"
                          >
                            Mark Fixed
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleHide(report.id, false)}
                          disabled={actionLoading === report.id}
                          className="px-2.5 py-1.5 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 font-semibold text-xs transition"
                          title="Hide spam/fake report"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
