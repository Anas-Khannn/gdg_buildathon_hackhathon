"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { StaffGauge } from "@/components/staff-gauge";
import { useLanguage } from "@/components/language-provider";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  TrendingUp,
  MapPin,
  Sparkles,
  BarChart2,
} from "lucide-react";

interface AreaStat {
  id: number;
  name: string;
  name_ur: string | null;
  name_ps: string | null;
  total_reports: number;
  fixed_reports: number;
  open_reports: number;
  danger_open: number;
  avg_days_to_fix: number;
}

export default function ScoreboardPage() {
  const { t, language } = useLanguage();
  const [areas, setAreas] = useState<AreaStat[]>([]);
  const [worstAreas, setWorstAreas] = useState<AreaStat[]>([]);
  const [summary, setSummary] = useState({
    totalReports: 0,
    totalFixed: 0,
    totalOpen: 0,
    overallAvgDays: "5.0",
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScoreboard() {
      try {
        const res = await fetch("/api/scoreboard");
        if (res.ok) {
          const data = await res.json();
          setAreas(data.areas || []);
          setWorstAreas(data.worstThreeAreas || []);
          setSummary(data.summary || {});
          setMonthlyData(data.monthlyData || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadScoreboard();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#EAF0F2] text-[#12263A]">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Hero Pitch Banner */}
        <div className="bg-gradient-to-br from-[#12263A] via-[#16334f] to-[#0E6B73] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-white/10">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-emerald-300">
                <Link href="/" className="hover:underline flex items-center gap-1 text-[#C9D4DA] hover:text-white transition">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t.mapView}</span>
                </Link>
                <span>•</span>
                <span>WSSP Performance Index</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Peshawar Drainage Scoreboard
              </h1>
              <p className="text-sm sm:text-base text-[#EAF0F2]/90 italic font-medium leading-relaxed">
                &ldquo;{t.scoreboardPitch}&rdquo;
              </p>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center min-w-[95px]">
                <span className="text-[10px] font-bold text-[#C9D4DA] uppercase block tracking-wider">
                  Complaints
                </span>
                <span className="font-heading text-2xl font-bold text-white block mt-0.5">
                  {summary.totalReports}
                </span>
              </div>

              <div className="bg-emerald-500/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-emerald-400/30 text-center min-w-[95px]">
                <span className="text-[10px] font-bold text-emerald-200 uppercase block tracking-wider">
                  Verified Fixed
                </span>
                <span className="font-heading text-2xl font-bold text-emerald-300 block mt-0.5">
                  {summary.totalFixed}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center min-w-[95px]">
                <span className="text-[10px] font-bold text-[#C9D4DA] uppercase block tracking-wider">
                  City Avg
                </span>
                <span className="font-heading text-2xl font-bold text-white block mt-0.5">
                  {summary.overallAvgDays} d
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: THE RIVER STAFF GAUGES (DESIGN.docx 5.2) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#12263A] flex items-center gap-2">
                <span>Area River Staff Gauges</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#0E6B73]/10 text-[#0E6B73]">
                  Days to Fix
                </span>
              </h2>
              <p className="text-xs text-[#4B6073] mt-0.5">
                Every Peshawari understands depth language: higher water level = slower resolution time by WSSP.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold text-[#4B6073] self-start sm:self-auto pt-1 sm:pt-0">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D4F]" />
                <span>Fast (&le;5d)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D9622B]" />
                <span>Moderate (6-9d)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C8321F]" />
                <span>Slow (&gt;10d)</span>
              </span>
            </div>
          </div>

          {/* Grid of 8 Staff Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {areas.map((area) => {
              const displayName =
                language === "ps" && area.name_ps
                  ? area.name_ps
                  : language === "ur" && area.name_ur
                  ? area.name_ur
                  : area.name;

              return (
                <StaffGauge
                  key={area.id}
                  areaName={displayName}
                  daysToFix={area.avg_days_to_fix}
                  totalReports={area.total_reports}
                  fixedReports={area.fixed_reports}
                  maxDays={20}
                />
              );
            })}
          </div>
        </section>

        {/* SECTION 2: WORST 3 AREAS ALERT STRIP (DESIGN 6.4) */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#C8321F]" />
            <h2 className="font-heading text-lg font-bold text-[#12263A]">
              {t.worstAreas}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {worstAreas.map((area, idx) => (
              <div
                key={area.id}
                className="bg-white p-5 rounded-2xl border-2 border-red-200 shadow-sm relative overflow-hidden group hover:border-red-400 transition"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -mr-6 -mt-6 pointer-events-none" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 tracking-wider">
                      #{idx + 1} Slowest
                    </span>
                    <h4 className="font-heading text-lg font-bold text-[#12263A] mt-2">
                      {area.name}
                    </h4>
                    <p className="text-xs text-[#4B6073] mt-1 font-medium">
                      {area.open_reports} pending issues ({area.danger_open} high risk)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-heading text-3xl font-extrabold text-[#C8321F] block leading-none">
                      {area.avg_days_to_fix}d
                    </span>
                    <span className="text-[10px] font-bold text-[#4B6073] uppercase tracking-wider block mt-1">
                      avg fix time
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: RECHARTS MONTHLY VOLUME CHART */}
        <section className="bg-white p-6 sm:p-7 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#12263A] flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#0E6B73]" />
                <span>{t.reportedVsFixed}</span>
              </h3>
              <p className="text-xs text-[#4B6073] mt-0.5">
                Monthly volume across Peshawar (Monsoon surge during July - August)
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-[#0E6B73]" />
                <span>Reported ({summary.totalReports})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-[#2E7D4F]" />
                <span>Verified Fixed ({summary.totalFixed})</span>
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAF0F2" />
                <XAxis dataKey="month" stroke="#4B6073" fontSize={12} tickLine={false} />
                <YAxis stroke="#4B6073" fontSize={12} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(14, 107, 115, 0.05)" }}
                  contentStyle={{
                    backgroundColor: "#12263A",
                    color: "white",
                    borderRadius: "14px",
                    border: "none",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
                <Bar dataKey="reported" fill="#0E6B73" radius={[8, 8, 0, 0]} name="Reported" />
                <Bar dataKey="fixed" fill="#2E7D4F" radius={[8, 8, 0, 0]} name="Verified Fixed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
}
