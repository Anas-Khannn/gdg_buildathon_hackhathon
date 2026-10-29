"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AuthWidget } from "@/components/auth/auth-widget";
import { emergencyAudio } from "@/lib/audio-siren";
import {
  Droplet,
  ShieldAlert,
  AlertTriangle,
  Camera,
  Sparkles,
  Users,
  CheckCircle2,
  Navigation,
  BarChart3,
  WifiOff,
  Languages,
  ArrowRight,
  ShieldCheck,
  Eye,
  FileQuestion,
  Waves,
  MapPin,
  Clock,
  Volume2,
  VolumeX,
  Radio,
  Compass,
  Cpu,
  Layers,
  ExternalLink,
  Activity,
  PhoneCall,
  Check,
  Zap,
  Play,
  RotateCcw,
  Sliders,
  Send,
  MessageCircle,
  Crosshair,
  Radar,
  Award,
} from "lucide-react";

interface NavSection {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge?: string;
}

const SECTIONS: NavSection[] = [
  { id: "crisis", label: "The Crisis", shortLabel: "Crisis", icon: AlertTriangle, badge: "Peshawar" },
  { id: "vision-ai", label: "Gemini Vision AI", shortLabel: "AI Vision", icon: Camera, badge: "1.5 Flash" },
  { id: "gis-map", label: "Live GIS Droplet Map", shortLabel: "GIS Map", icon: MapPin },
  { id: "safe-route", label: "Safe-Route Radar", shortLabel: "Safe Route", icon: Navigation },
  { id: "aquatwin", label: "AquaTwin Simulator", shortLabel: "AquaTwin", icon: Waves, badge: "Twin" },
  { id: "scoreboard", label: "Civic Scoreboard", shortLabel: "Scoreboard", icon: BarChart3 },
  { id: "quorum", label: "3-Citizen Quorum", shortLabel: "Quorum", icon: Users, badge: "Anti-Ghost" },
  { id: "emergency", label: "Emergency & Siren", shortLabel: "Emergency", icon: Volume2, badge: "Audio" },
  { id: "architecture", label: "Architecture", shortLabel: "Tech Stack", icon: Cpu },
];

const PESHAWAR_CATCHMENTS = [
  { name: "Jamrud Road Corridor", uc: "UC-12", area: 145, c: 0.85, baselineDepth: 45 },
  { name: "Kohati Gate Underpass", uc: "UC-04", area: 68, c: 0.88, baselineDepth: 60 },
  { name: "Saddar Commercial Hub", uc: "UC-08", area: 92, c: 0.82, baselineDepth: 38 },
  { name: "University Road Dip", uc: "UC-15", area: 130, c: 0.78, baselineDepth: 42 },
  { name: "Gulbahar Drain Arteries", uc: "UC-21", area: 85, c: 0.75, baselineDepth: 32 },
  { name: "Yakatooth Historical Area", uc: "UC-02", area: 54, c: 0.86, baselineDepth: 50 },
  { name: "Charsadda Road Culvert", uc: "UC-33", area: 110, c: 0.76, baselineDepth: 36 },
  { name: "Hayatabad Phase 3", uc: "UC-45", area: 175, c: 0.65, baselineDepth: 20 },
];

export function AboutShowcase() {
  const [activeSection, setActiveSection] = useState<string>("crisis");

  // Interactive 1: Gemini Vision Scenario Explorer
  const [visionScenario, setVisionScenario] = useState<"clog" | "manhole" | "underpass">("clog");
  const [isScanning, setIsScanning] = useState<boolean>(true);

  // Interactive 2: AquaTwin Live Hydrology Playground
  const [selectedCatchmentIndex, setSelectedCatchmentIndex] = useState<number>(0);
  const [rainfallMmHr, setRainfallMmHr] = useState<number>(55);
  const [isDesiltedMitigated, setIsDesiltedMitigated] = useState<boolean>(false);

  // Interactive 3: 3-Citizen Quorum Live Walkthrough
  const [quorumStep, setQuorumStep] = useState<number>(0);

  // Interactive 4: Safe Route Proximity Radar
  const [radarDistance, setRadarDistance] = useState<number>(35);

  // Interactive 5: Audio Siren & Speech Synthesis Console
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);
  const [isSpeakingUrdu, setIsSpeakingUrdu] = useState<boolean>(false);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 110;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  // Run a quick scan trigger when changing vision scenarios
  const handleSelectScenario = (scenario: "clog" | "manhole" | "underpass") => {
    setVisionScenario(scenario);
    setIsScanning(false);
    setTimeout(() => setIsScanning(true), 150);
  };

  // AquaTwin Dynamic Calculation
  const curCatchment = PESHAWAR_CATCHMENTS[selectedCatchmentIndex];
  // Q = (C * I * A) / 360
  const peakDischargeQ = ((curCatchment.c * rainfallMmHr * curCatchment.area) / 360).toFixed(2);
  const baseDepth = curCatchment.baselineDepth * (rainfallMmHr / 40);
  const simulatedWaterDepth = Math.max(
    8,
    Math.round(isDesiltedMitigated ? baseDepth * 0.28 : baseDepth)
  );

  // Audio Siren Handler
  const toggleSiren = () => {
    if (isSirenActive) {
      emergencyAudio.stopSiren();
      setIsSirenActive(false);
    } else {
      emergencyAudio.startSiren();
      setIsSirenActive(true);
    }
  };

  // Mosque Urdu TTS Handler
  const playMosqueBroadcast = () => {
    setIsSpeakingUrdu(true);
    emergencyAudio.playAlertBeep();
    setTimeout(() => {
      emergencyAudio.speakAnnouncement(
        "حکومتی تنبیہ: پشاور میں شدید بارشوں کے باعث برساتی نالے ابل پڑے ہیں۔ شہری کوہاٹی گیٹ اور جمروڈ روڈ کے نشیبی راستوں سے دور رہیں۔",
        "ur",
        () => setIsSpeakingUrdu(false)
      );
    }, 450);
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* =========================================================================
          HERO SECTION WITH EMBEDDED AUTH WIDGET & ANIMATED GLOWS
          ========================================================================= */}
      <section className="bg-gradient-to-br from-[#12263A] via-[#153450] to-[#0E6B73] rounded-3xl p-5 sm:p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden border-2 border-white/20 animate-glow-border">
        {/* Animated dynamic background glows */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-[#0E6B73]/40 rounded-full blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Floating animated water bubbles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute left-[10%] bottom-0 w-8 h-8 rounded-full bg-cyan-400/20 backdrop-blur-sm border border-cyan-300/30 animate-bubble-1" />
          <div className="absolute left-[35%] bottom-0 w-12 h-12 rounded-full bg-emerald-400/20 backdrop-blur-sm border border-emerald-300/30 animate-bubble-2" />
          <div className="absolute left-[65%] bottom-0 w-7 h-7 rounded-full bg-teal-300/25 backdrop-blur-sm border border-teal-200/40 animate-bubble-3" />
          <div className="absolute left-[85%] bottom-0 w-10 h-10 rounded-full bg-cyan-300/20 backdrop-blur-sm border border-cyan-200/30 animate-bubble-4" />
        </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

        {/* Undulating water wave at bottom of Hero */}
        <div className="absolute bottom-0 inset-x-0 h-14 pointer-events-none overflow-hidden opacity-35">
          <svg className="absolute bottom-0 w-[200%] h-full animate-wave-slide" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,40 C150,90 350,-20 500,40 C650,100 900,0 1200,40 L1200,120 L0,120 Z" fill="#22d3ee" fillOpacity="0.4" />
            <path d="M0,60 C200,10 400,90 600,50 C800,10 1000,80 1200,60 L1200,120 L0,120 Z" fill="#34d399" fillOpacity="0.3" />
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Mission & Problem Pitch */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/25 text-emerald-300 text-xs font-extrabold uppercase tracking-widest backdrop-blur-md shadow-sm animate-wave-bob">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <Droplet className="w-3.5 h-3.5 fill-current" />
              <span>Civic Climate Intelligence • Peshawar, KP</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Peshawar does not lack complaints.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 mt-1">
                It lacks a map that makes them impossible to ignore.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#EAF0F2]/90 leading-relaxed font-normal max-w-2xl">
              <strong>AquaSentinel</strong> is Peshawar&apos;s open civic flood defense system. We eliminate municipal black boxes by combining <strong>Google Gemini 1.5 Flash Vision AI</strong>, the <strong>AquaTwin Hydrological Runoff Engine</strong>, <strong>Dynamic Avoid-Road GIS Routing</strong>, and a <strong>3-Citizen Fix Quorum</strong> to make urban drainage accountable.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center transition-all duration-300 hover:scale-105 hover:bg-white/15 shadow-lg">
                <div className="text-xl sm:text-2xl font-extrabold font-heading text-emerald-300">8 Basins</div>
                <div className="text-[11px] text-[#C9D4DA] uppercase font-semibold tracking-wider">Hydrology Twin</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center transition-all duration-300 hover:scale-105 hover:bg-white/15 shadow-lg">
                <div className="text-xl sm:text-2xl font-extrabold font-heading text-cyan-300">&lt; 1.2s</div>
                <div className="text-[11px] text-[#C9D4DA] uppercase font-semibold tracking-wider">Gemini Vision AI</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center transition-all duration-300 hover:scale-105 hover:bg-white/15 shadow-lg">
                <div className="text-xl sm:text-2xl font-extrabold font-heading text-amber-300">3-Citizen</div>
                <div className="text-[11px] text-[#C9D4DA] uppercase font-semibold tracking-wider">Fix Quorum</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center transition-all duration-300 hover:scale-105 hover:bg-white/15 shadow-lg">
                <div className="text-xl sm:text-2xl font-extrabold font-heading text-rose-300">50m Radar</div>
                <div className="text-[11px] text-[#C9D4DA] uppercase font-semibold tracking-wider">Manhole Alert</div>
              </div>
            </div>

            {/* Interactive Jump Links */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => scrollToSection("aquatwin")}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#12263A] font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-md shadow-emerald-500/25 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Waves className="w-4 h-4 text-[#12263A]" />
                <span>Jump to AquaTwin Simulator</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("crisis")}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>Read Peshawar Crisis Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Embedded Sign Up / Sign In / Forgot Password Widget */}
          <div className="lg:col-span-5 w-full">
            <AuthWidget
              initialTab="signup"
              onSuccessRedirect="/"
              className="w-full max-w-md mx-auto"
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE IN-PAGE STICKY NAVIGATION BAR
          ========================================================================= */}
      <nav
        aria-label="In-page section navigator"
        className="sticky top-14 sm:top-16 z-30 -mx-3.5 sm:-mx-6 px-3.5 sm:px-6 py-2.5 bg-[#12263A]/95 backdrop-blur-xl border-y border-white/10 shadow-xl transition-all duration-200"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer ${
                    isActive
                      ? "bg-[#0E6B73] text-white shadow-md shadow-[#0E6B73]/40 ring-2 ring-emerald-400/60 scale-105"
                      : "text-[#C9D4DA] hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-300 animate-pulse" : "text-[#C9D4DA]"}`} />
                  <span className="hidden md:inline">{section.label}</span>
                  <span className="md:hidden">{section.shortLabel}</span>
                  {section.badge && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase ${
                      isActive ? "bg-emerald-400/30 text-emerald-200" : "bg-white/10 text-white/70"
                    }`}>
                      {section.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick jump to live map */}
          <Link
            href="/"
            className="shrink-0 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#12263A] font-extrabold text-xs transition-all duration-200 shadow-sm flex items-center gap-1.5 group"
          >
            <span>Launch Live App</span>
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* =========================================================================
          SECTION 1: THE CRISIS & BOTTLENECKS
          ========================================================================= */}
      <section id="crisis" className="scroll-mt-28 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#C8321F]">
              <AlertTriangle className="w-4 h-4 text-[#C8321F] animate-pulse" />
              <span>Peshawar Municipal Reality</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#12263A]">
              1. The Peshawar Urban Drainage Crisis
            </h2>
            <p className="text-sm sm:text-base text-[#4B6073] max-w-3xl">
              Every monsoon season, torrential rainfall turns Peshawar&apos;s commercial lifelines and ancient mohallahs into perilous lagoons. AquaSentinel systematically demolishes the 5 systemic bottlenecks in the civic pipeline:
            </p>
          </div>
        </div>

        {/* 5 Crisis Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs hover:border-[#0E6B73] hover:shadow-xl transition-all duration-300 space-y-3 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#C8321F] flex items-center justify-center font-heading font-extrabold text-lg group-hover:scale-110 transition-transform shadow-xs">
              <Waves className="w-6 h-6 text-[#C8321F]" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#12263A]">
              Monsoon Flash Inundation
            </h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              Just 30 minutes of 45mm/h cloudburst submerges arterial thoroughfares like <strong>Jamrud Road, Saddar, University Road, Kohati Gate underpasses, and Gulbahar</strong>. Decades of unexcavated silt restrict gravity flow, trapping knee-deep water.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] font-bold text-[#C8321F]">
              <span className="w-2 h-2 rounded-full bg-[#C8321F] animate-ping" />
              <span>Average Inundation Depth: 25cm – 60cm</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs hover:border-[#0E6B73] hover:shadow-xl transition-all duration-300 space-y-3 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#E0A100] flex items-center justify-center font-heading font-extrabold text-lg group-hover:scale-110 transition-transform shadow-xs">
              <FileQuestion className="w-6 h-6 text-[#E0A100]" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#12263A]">
              The &ldquo;Ghost Cleaned&rdquo; Drain Dilemma
            </h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              Sanitation contractors mark work-orders as &ldquo;Resolved&rdquo; on paper to clear billing, even when concrete slabs still conceal compacted mud and plastic waste. Citizens have had zero transparent counter-verification.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] font-bold text-[#E0A100]">
              <span className="w-2 h-2 rounded-full bg-[#E0A100]" />
              <span>Solved by: 3-Citizen Quorum Protocol</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs hover:border-[#0E6B73] hover:shadow-xl transition-all duration-300 space-y-3 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-heading font-extrabold text-lg group-hover:scale-110 transition-transform shadow-xs">
              <ShieldAlert className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#12263A]">
              Lethal Murky Open Manholes
            </h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              When cloudy stormwater blankets streets, dislodged or missing manhole covers become submerged death traps. Pedestrians, children, and motorcyclists suffer critical injuries or drown in uncovered deep drainage conduits.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] font-bold text-rose-600">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
              <span>Solved by: Proximity Radar & Avoid Zones</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs hover:border-[#0E6B73] hover:shadow-xl transition-all duration-300 space-y-3 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0E6B73] flex items-center justify-center font-heading font-extrabold text-lg group-hover:scale-110 transition-transform shadow-xs">
              <Navigation className="w-6 h-6 text-[#0E6B73]" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#12263A]">
              Blind Commuting & Paralyzed Ambulances
            </h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              Commercial navigation apps only calculate vehicle congestion, not flood depth. Vehicles unwittingly drive straight into waterlogged underpasses, hydro-locking engines and paralyzing vital emergency transit routes.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] font-bold text-[#0E6B73]">
              <span className="w-2 h-2 rounded-full bg-[#0E6B73]" />
              <span>Solved by: AI Safe-Route Pathfinding</span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs hover:border-[#0E6B73] hover:shadow-xl transition-all duration-300 space-y-3 md:col-span-2 lg:col-span-2 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2E7D4F] flex items-center justify-center font-heading font-extrabold text-lg group-hover:scale-110 transition-transform shadow-xs">
              <BarChart3 className="w-6 h-6 text-[#2E7D4F]" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#12263A]">
              Mohallah Inequality & Disproportionate Response
            </h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              Affluent cantonment zones often receive rapid vacuum trucks, while historic high-density Union Councils such as <strong>Yakatooth, Kohati Gate, Charsadda Road, and Gulbahar</strong> wait weeks for desiltation while raw wastewater enters courtyards.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] font-bold text-[#2E7D4F]">
              <span className="w-2 h-2 rounded-full bg-[#2E7D4F]" />
              <span>Solved by: Public River Staff Gauge Scoreboard</span>
            </div>
          </div>
        </div>

        {/* Before vs After Comparison Card */}
        <div className="bg-[#12263A] text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
            <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Civic Paradigm Shift</span>
          </div>
          <h3 className="font-heading text-xl sm:text-2xl font-bold">
            Before vs. With AquaSentinel
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-950/40 p-5 rounded-2xl border border-red-800/40 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>The Old Bureaucratic Model (Pre-AquaSentinel)</span>
              </div>
              <ul className="text-xs sm:text-sm text-[#C9D4DA] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 shrink-0 font-bold">✕</span>
                  <span>Citizens call overwhelmed landlines with zero tracking number or proof.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 shrink-0 font-bold">✕</span>
                  <span>Contractors sign paper sheets claiming drains were cleared without inspection.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 shrink-0 font-bold">✕</span>
                  <span>Motorists navigate flooded underpasses blindly until engines stall.</span>
                </li>
              </ul>
            </div>

            <div className="bg-emerald-950/40 p-5 rounded-2xl border border-emerald-700/40 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>The AquaSentinel Autonomous Model</span>
              </div>
              <ul className="text-xs sm:text-sm text-[#C9D4DA] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                  <span>1-Tap Gemini Vision auto-triages depth, category, and precise GPS in 1.2s.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                  <span>Zero ghost fixes: A ticket stays amber until 3 local citizens verify &ldquo;Yes, it is fixed&rdquo;.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                  <span>Live avoid-road perimeters and manhole radar warn drivers 50m in advance.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: GEMINI 1.5 FLASH VISION AI PLAYGROUND (ANIMATED LASER SCAN)
          ========================================================================= */}
      <section id="vision-ai" className="scroll-mt-28 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0E6B73]">
            <Sparkles className="w-4 h-4 text-[#0E6B73] animate-pulse" />
            <span>Multimodal Computer Vision Engine</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#12263A]">
            2. Google Gemini 1.5 Flash Hazard Triage
          </h2>
          <p className="text-sm sm:text-base text-[#4B6073] max-w-3xl">
            Citizens standing in heavy monsoon rain cannot fill out cumbersome 10-step municipal questionnaires. AquaSentinel requires just <strong>one photo</strong>. Try the interactive inspector below:
          </p>
        </div>

        {/* Interactive Vision Triage Playground */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C9D4DA] shadow-xs space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0E6B73] block">
                Interactive Telemetry Simulator
              </span>
              <h3 className="font-heading text-lg font-bold text-[#12263A]">
                Select a Peshawar Hazard Sample to Test AI Vision
              </h3>
            </div>

            <div className="flex items-center gap-2 bg-[#EAF0F2] p-1 rounded-2xl border border-[#C9D4DA]/70">
              <button
                type="button"
                onClick={() => handleSelectScenario("clog")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  visionScenario === "clog" ? "bg-[#0E6B73] text-white shadow-sm" : "text-[#4B6073] hover:text-[#12263A]"
                }`}
              >
                1. Silt Clogged Drain
              </button>
              <button
                type="button"
                onClick={() => handleSelectScenario("manhole")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  visionScenario === "manhole" ? "bg-[#0E6B73] text-white shadow-sm" : "text-[#4B6073] hover:text-[#12263A]"
                }`}
              >
                2. Open Manhole Trap
              </button>
              <button
                type="button"
                onClick={() => handleSelectScenario("underpass")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  visionScenario === "underpass" ? "bg-[#0E6B73] text-white shadow-sm" : "text-[#4B6073] hover:text-[#12263A]"
                }`}
              >
                3. Underpass Flash Flood
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Visual Scan Frame with Continuous Laser & Reticles */}
            <div className="lg:col-span-5 relative rounded-2xl overflow-hidden bg-slate-950 p-6 text-white min-h-[280px] flex flex-col justify-between border-2 border-cyan-500/40 shadow-2xl">
              {/* Continuous Laser Scanning Beam */}
              {isScanning && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] animate-laser-scan z-20 pointer-events-none" />
              )}

              {/* Target Corner Reticles */}
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-cyan-400" />

              <div className="flex items-center justify-between text-xs font-mono text-cyan-300 z-10">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>AI_OPTICAL_FEED: LIVE</span>
                </span>
                <span>GEO: 34.0151° N, 71.5249° E</span>
              </div>

              {/* Central Target Reticle */}
              <div className="py-6 text-center space-y-2 relative z-10">
                <div className="relative w-20 h-20 rounded-2xl bg-white/10 mx-auto flex items-center justify-center border border-white/20 shadow-inner">
                  <div className="absolute inset-0 rounded-2xl border border-cyan-400/40 animate-ping opacity-30" />
                  {visionScenario === "clog" && <Layers className="w-10 h-10 text-amber-400 animate-wave-bob" />}
                  {visionScenario === "manhole" && <ShieldAlert className="w-10 h-10 text-rose-500 animate-pulse" />}
                  {visionScenario === "underpass" && <Waves className="w-10 h-10 text-cyan-400 animate-pulse" />}
                </div>

                <div className="font-heading font-extrabold text-lg text-white">
                  {visionScenario === "clog" && "Saddar Bazar Drain Obstruction"}
                  {visionScenario === "manhole" && "Submerged Missing Manhole Cover"}
                  {visionScenario === "underpass" && "Kohati Gate Underpass Submersion"}
                </div>
                <div className="text-xs text-[#C9D4DA]">
                  {visionScenario === "clog" && "Plastic bottles, solid silt and construction debris choking culvert"}
                  {visionScenario === "manhole" && "Severe pedestrian hazard: 4.5ft depth drop beneath dark water"}
                  {visionScenario === "underpass" && "Gravity outflow saturated; vehicles submerged to hubcaps"}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono border-t border-white/10 pt-2 text-[#C9D4DA] z-10">
                <span>Inference: gemini-1.5-flash</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Confidence: 98.6%</span>
                </span>
              </div>
            </div>

            {/* Structured Telemetry JSON Card */}
            <div className="lg:col-span-7 bg-[#12263A] text-white p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-xs text-emerald-300 font-bold">STRUCTURED JSON RESPONSE</span>
                </div>
                <span className="text-[11px] font-mono text-[#C9D4DA]">1,180ms round-trip</span>
              </div>

              <div className="font-mono text-xs bg-black/40 p-4 rounded-xl border border-white/10 space-y-1 text-slate-300">
                <div><span className="text-cyan-300">&quot;hazard_type&quot;</span>: <span className="text-amber-300">&quot;{visionScenario === "clog" ? "Blocked Culvert Silt" : visionScenario === "manhole" ? "Lethal Open Manhole" : "Critical Urban Inundation"}&quot;</span>,</div>
                <div><span className="text-cyan-300">&quot;severity&quot;</span>: <span className="text-rose-400">&quot;{visionScenario === "clog" ? "high" : "danger"}&quot;</span>,</div>
                <div><span className="text-cyan-300">&quot;estimated_depth_cm&quot;</span>: <span className="text-emerald-300">{visionScenario === "clog" ? 22 : visionScenario === "manhole" ? 48 : 65}</span>,</div>
                <div><span className="text-cyan-300">&quot;requires_vacuum_sucker&quot;</span>: <span className="text-amber-300">{visionScenario !== "manhole" ? "true" : "false"}</span>,</div>
                <div><span className="text-cyan-300">&quot;broadcast_ur&quot;</span>: <span className="text-emerald-200 font-sans">&quot;{visionScenario === "clog" ? "نالے میں گاد اور کچرا جمع ہے۔ صفائی ٹیم طلب کریں۔" : visionScenario === "manhole" ? "خبردار! گٹر کا ڈھکن غائب ہے۔ پیدل چلنے والے دور رہیں۔" : "انڈر پاس زیرِ آب ہے۔ تمام گاڑیاں متبادل راستہ اختیار کریں۔"}&quot;</span></div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Auto-dispatched to WSSP municipal queue</span>
                </span>
                <span className="font-mono text-[10px] uppercase bg-rose-500/20 text-rose-300 border border-rose-400/30 px-2 py-0.5 rounded">
                  Priority 1 Dispatch
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: LIVE GIS DROPLET MAP
          ========================================================================= */}
      <section id="gis-map" className="scroll-mt-28 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0E6B73]">
            <MapPin className="w-4 h-4 text-[#0E6B73]" />
            <span>Interactive Spatial Cartography</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#12263A]">
            3. Live Leaflet GIS Droplet Map
          </h2>
          <p className="text-sm sm:text-base text-[#4B6073] max-w-3xl">
            A purpose-built cartographic interface for Peshawar, plotting verified water hazards and municipal fix statuses in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-3 hover:border-red-400 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-[#C8321F] flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5 text-[#C8321F] animate-pulse" />
            </div>
            <h3 className="font-heading text-base font-bold text-[#12263A]">Pulsating Avoid-Road Perimeters</h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              When a hazard is marked &quot;Danger&quot; or &quot;Open Manhole&quot;, a radiant red animated buffer envelops the road segment, signaling to drivers to detour before water enters intake valves.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-3 hover:border-[#0E6B73] hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#0E6B73] flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-[#0E6B73]" />
            </div>
            <h3 className="font-heading text-base font-bold text-[#12263A]">30-Meter Spatial Deduplication</h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              Nearby reports within 30 meters automatically cluster into a single civic ticket with an &ldquo;I See This Too&rdquo; counter, eliminating ticket flood and amplifying mohallah urgency.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-3 hover:border-emerald-500 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#2E7D4F] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5 text-[#2E7D4F]" />
            </div>
            <h3 className="font-heading text-base font-bold text-[#12263A]">Color-Coded Status Lifecycle</h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              Visual markers shift from Red (Unverified Danger), to Amber (Marked Fixed by WSSP Sanitation Team), to Verified Green (Confirmed Clean by 3 Local Residents).
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center pt-2">
          <Link
            href="/"
            className="px-6 py-3 rounded-2xl bg-[#0E6B73] hover:bg-[#095259] text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-[#0E6B73]/25 flex items-center gap-2 group cursor-pointer"
          >
            <span>Open Real Working Peshawar GIS Map</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: AI SAFE-ROUTE NAVIGATOR & ROTATING RADAR
          ========================================================================= */}
      <section id="safe-route" className="scroll-mt-28 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0E6B73]">
            <Navigation className="w-4 h-4 text-[#0E6B73]" />
            <span>Anti-Flood Dynamic Routing</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#12263A]">
            4. AI Safe-Route Navigator with Manhole Radar
          </h2>
          <p className="text-sm sm:text-base text-[#4B6073] max-w-3xl">
            Standard GPS apps direct traffic straight through impassable underpasses. AquaSentinel routes vehicles around water hazards and triggers a real-time proximity radar alert.
          </p>
        </div>

        {/* Interactive Proximity Radar Playground */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C9D4DA] shadow-xs space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-heading text-xl font-bold text-[#12263A]">
                Dynamic Pathfinding with Hazard Avoidance Penalty
              </h3>
              <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
                When active flood reports exist, road segments receive heavy traversal weight penalties. Ambulances and motorists are routed through safe, elevated bypass roads.
              </p>

              {/* Interactive Distance Slider */}
              <div className="p-4 rounded-2xl bg-[#EAF0F2]/80 border border-[#C9D4DA] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#12263A]">
                  <span>Test Proximity Radar Distance:</span>
                  <span className="font-mono text-[#0E6B73] bg-[#0E6B73]/10 px-2 py-0.5 rounded font-extrabold">
                    {radarDistance} meters from open hazard
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={radarDistance}
                  onChange={(e) => setRadarDistance(Number(e.target.value))}
                  className="w-full accent-[#0E6B73] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#4B6073]">
                  <span>10m (Critical Danger)</span>
                  <span>50m (Warning Threshold)</span>
                  <span>100m (Safe)</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {radarDistance <= 30 ? (
                  <div className="p-3.5 rounded-xl bg-red-100 border border-red-300 text-xs font-bold text-[#C8321F] flex items-center gap-2 animate-pulse">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>CRITICAL WARNING: Open Manhole 18m ahead! Do not proceed through water.</span>
                  </div>
                ) : radarDistance <= 60 ? (
                  <div className="p-3.5 rounded-xl bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900 flex items-center gap-2">
                    <Compass className="w-5 h-5 shrink-0 text-amber-700" />
                    <span>CAUTION: Flooded road segment within 50 meters. Suggested detour active.</span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-700" />
                    <span>Clear Corridor: Route free of documented submerged manholes.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Radar Visual Display with Continuous Sweep Needle */}
            <div className="lg:col-span-5 bg-[#12263A] text-white p-6 rounded-3xl border border-white/10 space-y-4 text-center relative overflow-hidden">
              <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                {/* Concentric Radar Rings */}
                <div className="absolute inset-0 rounded-full border border-cyan-500/25" />
                <div className="absolute inset-5 rounded-full border border-cyan-500/20" />
                <div className="absolute inset-10 rounded-full border border-cyan-500/15" />
                <div className="absolute inset-16 rounded-full border border-cyan-500/10" />

                {/* Radar Grid Crosshairs */}
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-cyan-500/20" />
                <div className="absolute inset-y-0 left-1/2 w-[1px] bg-cyan-500/20" />

                {/* Continuously Sweeping Radar Beam */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400/30 via-emerald-400/10 to-transparent animate-radar-spin origin-center pointer-events-none" />

                {/* Animated Hazard Radar Blip */}
                <div
                  className={`absolute w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center ${
                    radarDistance <= 30
                      ? "bg-red-500 shadow-[0_0_15px_#ef4444]"
                      : radarDistance <= 60
                      ? "bg-amber-400 shadow-[0_0_12px_#f59e0b]"
                      : "bg-emerald-400 shadow-[0_0_10px_#10b981]"
                  }`}
                  style={{
                    transform: `translate(${radarDistance > 50 ? 46 : 20}px, -${radarDistance > 50 ? 38 : 15}px)`,
                  }}
                >
                  <span className="w-full h-full rounded-full bg-white animate-ping opacity-75" />
                </div>

                {/* Center User Pin */}
                <div className="w-10 h-10 rounded-full bg-white text-[#12263A] flex items-center justify-center font-bold text-xs shadow-lg z-10 border-2 border-emerald-400">
                  <Navigation className="w-5 h-5 text-[#0E6B73]" />
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-heading text-base font-bold flex items-center justify-center gap-1.5">
                  <Radar className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>50m Manhole Proximity Radar</span>
                </h4>
                <p className="text-xs text-[#C9D4DA]">
                  Active scanning with hardware Web Audio chime alerts on mobile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: AQUATWIN HYDROLOGICAL SIMULATOR (ANIMATED WATER TANK)
          ========================================================================= */}
      <section id="aquatwin" className="scroll-mt-28 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-600">
            <Waves className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>Digital Twin Science</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#12263A]">
            5. AquaTwin Hydrological Runoff & Inundation Twin
          </h2>
          <p className="text-sm sm:text-base text-[#4B6073] max-w-3xl">
            A physics-calibrated runoff and inundation model designed for the actual topography and historical urban catchments of Peshawar.
          </p>
        </div>

        {/* AquaTwin Interactive Runoff Playground */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C9D4DA] shadow-xs space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Controls */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0E6B73]">
                  Interactive Hydrology Controls
                </span>
                <span className="text-xs font-mono font-bold bg-[#0E6B73]/10 text-[#0E6B73] px-2 py-0.5 rounded">
                  Rational Formula: Q = CIA/360
                </span>
              </div>

              {/* Catchment Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#12263A] block">
                  Select Peshawar Urban Basin:
                </label>
                <select
                  value={selectedCatchmentIndex}
                  onChange={(e) => setSelectedCatchmentIndex(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D4DA] text-xs sm:text-sm font-semibold text-[#12263A] bg-white focus:outline-none focus:ring-2 focus:ring-[#0E6B73]"
                >
                  {PESHAWAR_CATCHMENTS.map((c, idx) => (
                    <option key={c.name} value={idx}>
                      {c.name} ({c.uc} • {c.area} ha • Runoff Coeff: {c.c})
                    </option>
                  ))}
                </select>
              </div>

              {/* Rainfall Slider */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-[#EAF0F2]/70 border border-[#C9D4DA]">
                <div className="flex items-center justify-between text-xs font-bold text-[#12263A]">
                  <span>Rainfall Cloudburst Intensity:</span>
                  <span className="font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {rainfallMmHr} mm / hour
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  value={rainfallMmHr}
                  onChange={(e) => setRainfallMmHr(Number(e.target.value))}
                  className="w-full accent-[#0E6B73] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#4B6073]">
                  <span>10 mm/h (Drizzle)</span>
                  <span>50 mm/h (Monsoon Downpour)</span>
                  <span>120 mm/h (Cloudburst)</span>
                </div>
              </div>

              {/* What-If Desilt Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border-2 border-dashed border-[#0E6B73]/40 bg-[#0E6B73]/5">
                <div>
                  <div className="text-xs font-bold text-[#12263A]">Simulate WSSP Desiltation Work:</div>
                  <div className="text-[11px] text-[#4B6073]">Removes silt bottlenecks & increases conduit flow by 72%</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDesiltedMitigated(!isDesiltedMitigated)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isDesiltedMitigated
                      ? "bg-[#2E7D4F] text-white shadow-md"
                      : "bg-white border border-[#C9D4DA] text-[#4B6073]"
                  }`}
                >
                  {isDesiltedMitigated ? "✓ Desilting Active" : "Enable Desilting"}
                </button>
              </div>
            </div>

            {/* Live Calculation with Visual Glass Hydrological Water Tank */}
            <div className="lg:col-span-5 bg-[#12263A] text-white p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="font-mono text-xs text-emerald-300 font-bold">HYDROLOGICAL OUTPUT</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  simulatedWaterDepth > 45 ? "bg-red-500/20 text-red-300 animate-pulse" :
                  simulatedWaterDepth > 25 ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
                }`}>
                  {simulatedWaterDepth > 45 ? "Danger Level" : simulatedWaterDepth > 25 ? "Moderate Waterlogging" : "Safe Flow"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10">
                  <div className="text-2xl font-heading font-extrabold text-cyan-300">{peakDischargeQ} m³/s</div>
                  <div className="text-[10px] text-[#C9D4DA] uppercase tracking-wider">Peak Discharge Q</div>
                </div>

                <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10">
                  <div className={`text-2xl font-heading font-extrabold ${
                    simulatedWaterDepth > 45 ? "text-red-400" : simulatedWaterDepth > 25 ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {simulatedWaterDepth} cm
                  </div>
                  <div className="text-[10px] text-[#C9D4DA] uppercase tracking-wider">Inundation Depth</div>
                </div>
              </div>

              {/* Animated Visual Inundation Water Chamber Tank */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] text-[#C9D4DA]">
                  <span>Basin Inundation Chamber</span>
                  <span className="font-bold text-cyan-300">{simulatedWaterDepth} cm</span>
                </div>

                <div className="relative h-20 rounded-2xl bg-black/50 border border-white/20 overflow-hidden">
                  {/* Vertical measurement ticks */}
                  <div className="absolute inset-y-0 right-2 flex flex-col justify-between text-[9px] font-mono text-[#C9D4DA]/60 pointer-events-none py-1 z-20">
                    <span>80cm</span>
                    <span>50cm</span>
                    <span>20cm</span>
                    <span>0cm</span>
                  </div>

                  {/* Water Body with Animated Wave Crest */}
                  <div
                    className={`absolute bottom-0 inset-x-0 transition-all duration-500 overflow-hidden ${
                      simulatedWaterDepth > 45
                        ? "bg-gradient-to-t from-red-800 to-rose-600"
                        : simulatedWaterDepth > 25
                        ? "bg-gradient-to-t from-amber-700 to-yellow-600"
                        : "bg-gradient-to-t from-teal-700 to-cyan-500"
                    }`}
                    style={{ height: `${Math.min(95, Math.max(15, (simulatedWaterDepth / 80) * 100))}%` }}
                  >
                    {/* Undulating Wave Crest SVG */}
                    <div className="absolute top-0 inset-x-0 h-4 overflow-hidden -mt-2">
                      <svg className="w-[200%] h-full animate-wave-slide" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M0,40 C150,90 350,-20 500,40 C650,100 900,0 1200,40 L1200,120 L0,120 Z" fill="#ffffff" fillOpacity="0.3" />
                      </svg>
                    </div>

                    {/* Rising Chamber Bubbles */}
                    <div className="absolute left-6 bottom-0 w-2 h-2 rounded-full bg-white/40 animate-bubble-1" />
                    <div className="absolute left-24 bottom-0 w-2.5 h-2.5 rounded-full bg-white/40 animate-bubble-3" />
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <Link
                  href="/flood-simulator"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#12263A] font-extrabold text-xs transition-all duration-200 shadow-md flex items-center justify-center gap-1.5 group cursor-pointer"
                >
                  <span>Launch Full-Screen 2D Map Twin</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: CIVIC SCOREBOARD & RIVER GAUGES
          ========================================================================= */}
      <section id="scoreboard" className="scroll-mt-28 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0E6B73]">
            <BarChart3 className="w-4 h-4 text-[#0E6B73]" />
            <span>Democratic Municipal Accountability</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#12263A]">
            6. Peshawar Drainage Scoreboard & River Gauges
          </h2>
          <p className="text-sm sm:text-base text-[#4B6073] max-w-3xl">
            Inspired by historical Indus and Kabul river staff gauges, our public scoreboard makes sanitation performance visible to every citizen and ward representative.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-3 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#0E6B73] flex items-center justify-center font-bold">
              <Activity className="w-5 h-5 text-[#0E6B73]" />
            </div>
            <h3 className="font-heading text-base font-bold text-[#12263A]">Average Days to Desilt</h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              Every Union Council is scored by how many days elapsed between the first citizen report and final verified fix. High numbers cause the visual water gauge to rise into danger zones.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-3 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-[#C8321F] flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5 text-[#C8321F]" />
            </div>
            <h3 className="font-heading text-base font-bold text-[#12263A]">Top 3 Neglected Union Councils</h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              Automatically highlights the 3 lowest-performing zones in Peshawar each week, creating transparent public pressure and preventing sanitation squads from neglecting historical UCs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-3 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#E0A100] flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-[#E0A100]" />
            </div>
            <h3 className="font-heading text-base font-bold text-[#12263A]">Citizen Guardian Leaderboard</h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              Recognizes active neighborhood guardians who verify fixes on the ground, rewarding honest community vigilance with civic credibility badges.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center pt-2">
          <Link
            href="/scoreboard"
            className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-[#C9D4DA] text-[#12263A] font-bold text-xs sm:text-sm transition-all duration-200 shadow-sm flex items-center gap-2 group cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-[#0E6B73]" />
            <span>View Full Live WSSP Scoreboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: 3-CITIZEN QUORUM INTERACTIVE CELEBRATION
          ========================================================================= */}
      <section id="quorum" className="scroll-mt-28 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#2E7D4F]">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D4F]" />
            <span>Anti-Ghost Fix Protocol</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#12263A]">
            7. The 3-Citizen Democratic Verification Quorum
          </h2>
          <p className="text-sm sm:text-base text-[#4B6073] max-w-3xl">
            Municipal contractors cannot sign off on their own invoices. A ticket only turns green when 3 independent local citizens verify that the drain has been physically cleaned.
          </p>
        </div>

        {/* Interactive Quorum Walkthrough */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D4F]">Interactive Quorum Test</span>
              <h3 className="font-heading text-lg font-bold text-[#12263A]">
                Ticket #PSH-842: Clogged Storm Drain at Yakatooth Gate
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setQuorumStep(0)}
              className="px-3 py-1.5 rounded-xl border border-[#C9D4DA] hover:bg-slate-50 text-xs font-bold text-[#4B6073] transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Simulator</span>
            </button>
          </div>

          {/* Ticket State Banner with Animated Celebration */}
          <div className={`p-5 rounded-2xl border-2 transition-all duration-500 relative overflow-hidden flex items-center justify-between ${
            quorumStep === 0 ? "bg-red-50 border-red-300 text-red-900" :
            quorumStep < 4 ? "bg-amber-50 border-amber-300 text-amber-900" :
            "bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border-emerald-400 text-emerald-950 shadow-xl"
          }`}>
            {quorumStep === 4 && (
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(52,211,153,0.2),transparent)] animate-shimmer pointer-events-none" />
            )}

            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md transition-transform duration-300 ${
                quorumStep === 0 ? "bg-[#C8321F] animate-pulse" :
                quorumStep < 4 ? "bg-[#E0A100]" :
                "bg-[#2E7D4F] scale-110 ring-4 ring-emerald-300"
              }`}>
                {quorumStep === 0 ? <AlertTriangle className="w-6 h-6" /> :
                 quorumStep < 4 ? <Clock className="w-6 h-6" /> :
                 <Check className="w-6 h-6 animate-bounce" />}
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wide">
                  {quorumStep === 0 && "Status: Active Citizen Hazard (Red Alert)"}
                  {quorumStep === 1 && "Status: Marked Fixed by WSSP (Amber Holding State)"}
                  {quorumStep === 2 && "Status: Quorum 1/3 Votes (Awaiting 2 More Neighbors)"}
                  {quorumStep === 3 && "Status: Quorum 2/3 Votes (Awaiting Final Verification)"}
                  {quorumStep === 4 && "Status: VERIFIED GREEN BY 3-CITIZEN QUORUM (Clean)"}
                </div>
                <div className="text-xs text-opacity-90 mt-0.5">
                  {quorumStep === 0 && "Citizen reported knee-deep water. WSSP has not dispatched."}
                  {quorumStep === 1 && "WSSP sanitation team claims desiltation complete. Quorum opened."}
                  {quorumStep === 2 && "Citizen Dawood verified on-ground. 2 more votes required."}
                  {quorumStep === 3 && "Citizen Asma verified on-ground. 1 vote remaining."}
                  {quorumStep === 4 && "Final vote cast by Citizen Bilal. Ticket closed & contractor verified."}
                </div>
              </div>
            </div>

            <div className="text-right relative z-10">
              <span className={`text-xs font-extrabold px-3 py-1.5 rounded-full shadow-sm ${
                quorumStep === 4 ? "bg-emerald-600 text-white animate-pulse" : "bg-black/10 text-[#12263A]"
              }`}>
                {quorumStep <= 1 ? "0/3 Votes" : `${quorumStep - 1}/3 Votes`}
              </span>
            </div>
          </div>

          {/* Interactive Step Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <button
              type="button"
              disabled={quorumStep !== 0}
              onClick={() => setQuorumStep(1)}
              className="p-3.5 rounded-2xl border border-[#C9D4DA] hover:border-amber-500 bg-white text-left transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:shadow-md"
            >
              <div className="text-[10px] font-bold uppercase text-amber-700">Step 1</div>
              <div className="text-xs font-bold text-[#12263A]">WSSP Crew Clears</div>
              <div className="text-[10px] text-[#4B6073]">Marks &ldquo;Fixed&rdquo; on portal</div>
            </button>

            <button
              type="button"
              disabled={quorumStep !== 1}
              onClick={() => setQuorumStep(2)}
              className="p-3.5 rounded-2xl border border-[#C9D4DA] hover:border-[#0E6B73] bg-white text-left transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:shadow-md"
            >
              <div className="text-[10px] font-bold uppercase text-[#0E6B73]">Step 2</div>
              <div className="text-xs font-bold text-[#12263A]">Citizen 1: Dawood</div>
              <div className="text-[10px] text-[#4B6073]">Votes: &ldquo;Yes, Clean&rdquo;</div>
            </button>

            <button
              type="button"
              disabled={quorumStep !== 2}
              onClick={() => setQuorumStep(3)}
              className="p-3.5 rounded-2xl border border-[#C9D4DA] hover:border-[#0E6B73] bg-white text-left transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:shadow-md"
            >
              <div className="text-[10px] font-bold uppercase text-[#0E6B73]">Step 3</div>
              <div className="text-xs font-bold text-[#12263A]">Citizen 2: Asma</div>
              <div className="text-[10px] text-[#4B6073]">Votes: &ldquo;Yes, Clean&rdquo;</div>
            </button>

            <button
              type="button"
              disabled={quorumStep !== 3}
              onClick={() => setQuorumStep(4)}
              className="p-3.5 rounded-2xl border border-[#C9D4DA] hover:border-emerald-600 bg-white text-left transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:shadow-md"
            >
              <div className="text-[10px] font-bold uppercase text-emerald-700">Step 4 (Final)</div>
              <div className="text-xs font-bold text-[#12263A]">Citizen 3: Bilal</div>
              <div className="text-[10px] text-[#4B6073]">Unlocks Verified Green</div>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: EMERGENCY BROADCASTS & AUDIO SIREN (ANIMATED SOUNDWAVES)
          ========================================================================= */}
      <section id="emergency" className="scroll-mt-28 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#C8321F]">
            <Volume2 className="w-4 h-4 text-[#C8321F] animate-pulse" />
            <span>Crisis Audio & Rescue Dispatch</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#12263A]">
            8. Emergency Broadcasts, Sirens & Helplines
          </h2>
          <p className="text-sm sm:text-base text-[#4B6073] max-w-3xl">
            When flash floods peak, visual apps alone aren&apos;t enough. AquaSentinel integrates audible acoustic alerts and instant rescue dispatches.
          </p>
        </div>

        {/* Live Audio Console */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Siren Card with Animated Equalizer Waves */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 space-y-4 ${
              isSirenActive ? "bg-red-50 border-red-400 ring-2 ring-red-400 shadow-xl" : "bg-red-50/70 border-red-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shadow-md ${
                    isSirenActive ? "animate-pulse" : ""
                  }`}>
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-red-950">
                      Dual-Tone Acoustic Web Siren
                    </h3>
                    <span className="text-xs text-red-700">800Hz / 1200Hz Frequency Modulation</span>
                  </div>
                </div>

                {/* Animated Soundwave Equalizer Bars */}
                {isSirenActive && (
                  <div className="flex items-end gap-1 h-8">
                    <span className="w-1.5 bg-red-600 rounded-full animate-bounce h-7" />
                    <span className="w-1.5 bg-red-500 rounded-full animate-ping h-5" />
                    <span className="w-1.5 bg-red-600 rounded-full animate-bounce h-8" />
                    <span className="w-1.5 bg-red-500 rounded-full animate-pulse h-6" />
                  </div>
                )}
              </div>

              <p className="text-xs text-red-900/80 leading-relaxed">
                Synthesized directly using browser Web Audio API oscillators. Requires zero network MP3 downloads, functioning even with 0 kbps connection.
              </p>
              <button
                type="button"
                onClick={toggleSiren}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  isSirenActive
                    ? "bg-red-700 text-white ring-4 ring-red-400/50 animate-pulse"
                    : "bg-red-600 hover:bg-red-500 text-white"
                }`}
              >
                {isSirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSirenActive ? "Stop Acoustic Siren Alarm" : "Test Live Web Audio Siren (Oscillator)"}</span>
              </button>
            </div>

            {/* Mosque Loudspeaker TTS */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 space-y-4 ${
              isSpeakingUrdu ? "bg-teal-100/70 border-[#0E6B73] ring-2 ring-[#0E6B73]" : "bg-teal-50 border-teal-200"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-[#0E6B73] text-white flex items-center justify-center font-bold shadow-md ${
                  isSpeakingUrdu ? "animate-pulse" : ""
                }`}>
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-[#12263A]">
                    Mosque Loudspeaker Broadcast
                  </h3>
                  <span className="text-xs text-[#0E6B73]">Urdu & Pashto Voice Synthesis</span>
                </div>
              </div>
              <p className="text-xs text-[#4B6073] leading-relaxed">
                Simulates traditional mohallah mosque loudspeaker announcements, alerting pedestrians in native accents before entering submerged avenues.
              </p>
              <button
                type="button"
                onClick={playMosqueBroadcast}
                className="w-full py-3 px-4 rounded-xl bg-[#0E6B73] hover:bg-[#095259] text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>{isSpeakingUrdu ? "Broadcasting in Urdu..." : "Play Mosque Flood Alert (Urdu TTS)"}</span>
              </button>
            </div>
          </div>

          <div className="bg-[#12263A] text-white p-5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="font-heading text-sm font-bold flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-red-400" />
                <span>Official Peshawar 24/7 Crisis Helplines</span>
              </h4>
              <p className="text-xs text-[#C9D4DA]">
                Rescue 1122 • WSSP Sanitation Helpline 1334 • PDMA KP Flood Cell 1700 • Edhi 115
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("naali-open-emergency"))}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-[#C8321F] hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Open Emergency Dialers</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: ARCHITECTURE & TECH STACK
          ========================================================================= */}
      <section id="architecture" className="scroll-mt-28 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0E6B73]">
            <Cpu className="w-4 h-4 text-[#0E6B73]" />
            <span>Under the Hood</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#12263A]">
            9. Full-Stack Architecture & Offline Resiliency
          </h2>
          <p className="text-sm sm:text-base text-[#4B6073] max-w-3xl">
            Engineered with modern, production-grade web technologies for speed, security, and extreme storm resilience.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { title: "Next.js 15 App Router", tech: "React 19 & SSR", color: "bg-slate-900 text-white" },
            { title: "Tailwind CSS v4", tech: "Modern Tokens", color: "bg-teal-900 text-teal-200" },
            { title: "Neon PostgreSQL", tech: "Serverless SQL", color: "bg-emerald-950 text-emerald-200" },
            { title: "Google Gemini 1.5", tech: "Multimodal AI", color: "bg-blue-950 text-cyan-200" },
            { title: "Leaflet OpenStreetMap", tech: "GIS Cartography", color: "bg-amber-950 text-amber-200" },
            { title: "IndexedDB PWA", tech: "Offline Store", color: "bg-purple-950 text-purple-200" },
          ].map((item) => (
            <div key={item.title} className={`${item.color} p-4 rounded-2xl border border-white/10 space-y-1 text-center shadow-sm hover:scale-105 transition-transform duration-200`}>
              <div className="text-xs font-extrabold font-heading">{item.title}</div>
              <div className="text-[10px] opacity-80 uppercase tracking-wider">{item.tech}</div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0E6B73]">
            <WifiOff className="w-4 h-4 text-[#0E6B73]" />
            <span>Storm Outage Offline-First Guarantees</span>
          </div>
          <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
            During intense cloudbursts, cellular towers in Peshawar frequently lose power. AquaSentinel features client-side <strong>IndexedDB local queueing</strong>. Reports taken during a blackout are saved locally with GPS metadata and camera captures, and automatically sync to the server the second mobile data returns.
          </p>
        </div>
      </section>

      {/* =========================================================================
          CALL TO ACTION FOOTER BANNER
          ========================================================================= */}
      <section className="bg-gradient-to-r from-[#12263A] via-[#163b5e] to-[#0E6B73] p-8 sm:p-12 rounded-3xl text-white text-center space-y-6 shadow-2xl border-2 border-white/20 relative overflow-hidden animate-glow-border">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />

        <div className="max-w-2xl mx-auto space-y-3 relative z-10">
          <h3 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Safeguard Peshawar with AquaSentinel?
          </h3>
          <p className="text-sm sm:text-base text-[#EAF0F2]/90 leading-relaxed font-normal">
            Join hundreds of Peshawar residents, university students, and municipal engineers creating a flood-resilient, accountable city.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
          <Link
            href="/auth/signin?role=user"
            className="px-7 py-3.5 rounded-2xl bg-white text-[#12263A] font-bold text-sm hover:bg-emerald-50 transition-all duration-200 shadow-lg flex items-center gap-2 group cursor-pointer active:scale-95"
          >
            <span>Sign Up as Citizen</span>
            <ArrowRight className="w-4 h-4 text-[#0E6B73] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/auth/signin?role=admin"
            className="px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all duration-200 backdrop-blur-md flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Sign In as WSSP Official</span>
          </Link>

          <Link
            href="/"
            className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#12263A] font-bold text-sm transition-all duration-200 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <MapPin className="w-4 h-4" />
            <span>Explore Live Map</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
