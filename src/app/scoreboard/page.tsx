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
  Trophy,
  Award,
  Medal,
  Shield,
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
  const [guardians, setGuardians] = useState<any[]>([]);
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

        const gRes = await fetch("/api/guardians");
        if (gRes.ok) {
          const gData = await gRes.json();
          setGuardians(gData.guardians || []);
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

      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-8">
        {/* Hero Pitch Banner */}
        <div className="bg-gradient-to-br from-[#12263A] via-[#16334f] to-[#0E6B73] rounded-3xl p-5 sm:p-8 text-white shadow-xl relative overflow-hidden border border-white/10">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
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

            {/* Quick Metrics Badges (Grid on Mobile, Flex on Desktop) */}
            <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto shrink-0">
              <div className="bg-white/10 backdrop-blur-md px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl border border-white/15 text-center min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold text-[#C9D4DA] uppercase block tracking-wider truncate">
                  Complaints
                </span>
                <span className="font-heading text-xl sm:text-2xl font-bold text-white block mt-0.5">
                  {summary.totalReports}
                </span>
              </div>

              <div className="bg-emerald-500/20 backdrop-blur-md px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl border border-emerald-400/30 text-center min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-200 uppercase block tracking-wider truncate">
                  Verified Fixed
                </span>
                <span className="font-heading text-xl sm:text-2xl font-bold text-emerald-300 block mt-0.5">
                  {summary.totalFixed}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl border border-white/15 text-center min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold text-[#C9D4DA] uppercase block tracking-wider truncate">
                  City Avg
                </span>
                <span className="font-heading text-xl sm:text-2xl font-bold text-white block mt-0.5">
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
        <section className="bg-white p-4 sm:p-7 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-4 overflow-hidden">
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

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold">
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

          <div className="h-64 sm:h-80 w-full pt-4 min-w-0">
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

        {/* SECTION 4: MOHALLAH GUARDIANS & CIVIC IMPACT LEADERBOARD */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#12263A] flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Peshawar Mohallah Guardians</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800">
                  Civic Karma
                </span>
              </h2>
              <p className="text-xs text-[#4B6073] mt-0.5">
                Active community members reporting hazards, confirming nearby blocked drains, and verifying fixed naalis across Peshawar.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-bold text-[#0E6B73]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Report (+50) • Confirm (+20) • Verify Fix (+100)</span>
            </div>
          </div>

          {guardians.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-[#C9D4DA] text-center space-y-3">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-base text-[#12263A]">
                  No Citizen Guardians Ranked Yet
                </h4>
                <p className="text-xs text-[#4B6073] max-w-md mx-auto leading-relaxed">
                  Be the first citizen in Peshawar to report a drainage hazard (+50 Karma) or confirm an issue (+20 Karma) on the live map to claim the #1 spot on your neighborhood board!
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E6B73] hover:bg-[#095259] text-white text-xs font-bold transition shadow-xs"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Open Live Map & Report Problem</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {guardians.map((g, idx) => {
                const badgeLabel =
                  language === "ur"
                    ? g.badgeTitleUr
                    : language === "ps"
                    ? g.badgeTitlePs
                    : g.badgeTitle;

                return (
                  <div
                    key={g.id}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-[#C9D4DA] shadow-xs relative overflow-hidden group hover:border-[#0E6B73] transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white font-heading font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
                          #{idx + 1}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-heading text-sm font-bold text-[#12263A] truncate">
                            {g.name}
                          </h4>
                          <span className="text-[11px] text-[#4B6073] block truncate">
                            📍 {g.area}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-heading text-lg font-extrabold text-[#0E6B73] block leading-none">
                          {g.points}
                        </span>
                        <span className="text-[9px] font-bold uppercase text-[#4B6073] tracking-wider block mt-0.5">
                          Karma Pts
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#C9D4DA]/50 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-extrabold border border-amber-200">
                        {badgeLabel}
                      </span>

                      <span className="text-[11px] text-[#4B6073] font-medium">
                        📸 {g.reportsCount} • 👥 {g.confirmationsCount} • ✓ {g.verifiedCount}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
