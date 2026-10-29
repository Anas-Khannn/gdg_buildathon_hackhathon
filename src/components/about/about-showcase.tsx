"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AuthWidget } from "@/components/auth/auth-widget";
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
  Radio,
  Compass,
  Cpu,
  Layers,
  ExternalLink,
  Activity,
  PhoneCall,
  Check,
  Zap,
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
  { id: "aquatwin", label: "AquaTwin Simulator", shortLabel: "AquaTwin", icon: Waves, badge: "Simulator" },
  { id: "scoreboard", label: "Civic Scoreboard", shortLabel: "Scoreboard", icon: BarChart3 },
  { id: "quorum", label: "3-Citizen Quorum", shortLabel: "Quorum", icon: Users, badge: "Anti-Ghost" },
  { id: "emergency", label: "Emergency & Siren", shortLabel: "Emergency", icon: Volume2, badge: "SOS" },
  { id: "architecture", label: "Architecture", shortLabel: "Tech Stack", icon: Cpu },
];

export function AboutShowcase() {
  const [activeSection, setActiveSection] = useState<string>("crisis");
  const [selectedSimTab, setSelectedSimTab] = useState<"formula" | "catchments" | "whatif">("formula");

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
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="space-y-10 sm:space-y-16">
      {/* =========================================================================
          HERO SECTION WITH EMBEDDED AUTH WIDGET & FLOATING GLOWS
          ========================================================================= */}
      <section className="bg-gradient-to-br from-[#12263A] via-[#153450] to-[#0E6B73] rounded-3xl p-5 sm:p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden border border-white/15">
        {/* Animated background glows */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-[#0E6B73]/40 rounded-full blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-30" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Mission & Problem Pitch */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-xs font-extrabold uppercase tracking-widest backdrop-blur-md shadow-sm">
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
              <strong>AquaSentinel</strong> is Peshawar&apos;s pioneering AI-driven civic flood defense system. By uniting <strong>Google Gemini 1.5 Flash Vision</strong>, <strong>AquaTwin Hydrological Runoff Modeling</strong>, <strong>Live Avoid-Road GIS Routing</strong>, and a <strong>3-Citizen Democratic Verification Quorum</strong>, we turn chaotic monsoon inundation into actionable, accountable municipal desiltation.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
                <div className="text-xl sm:text-2xl font-extrabold font-heading text-emerald-300">8 Catchments</div>
                <div className="text-[11px] text-[#C9D4DA] uppercase font-semibold tracking-wider">Hydrology Twin</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
                <div className="text-xl sm:text-2xl font-extrabold font-heading text-cyan-300">&lt; 1.2s</div>
                <div className="text-[11px] text-[#C9D4DA] uppercase font-semibold tracking-wider">Gemini Vision AI</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
                <div className="text-xl sm:text-2xl font-extrabold font-heading text-amber-300">3-Citizen</div>
                <div className="text-[11px] text-[#C9D4DA] uppercase font-semibold tracking-wider">Fix Quorum</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
                <div className="text-xl sm:text-2xl font-extrabold font-heading text-rose-300">30m Radar</div>
                <div className="text-[11px] text-[#C9D4DA] uppercase font-semibold tracking-wider">Manhole Hazard</div>
              </div>
            </div>

            {/* Interactive Jump Links */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => scrollToSection("aquatwin")}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#12263A] font-bold text-xs sm:text-sm transition-all duration-200 shadow-md shadow-emerald-500/20 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Waves className="w-4 h-4 text-[#12263A]" />
                <span>Explore AquaTwin Simulator</span>
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
          INTERACTIVE IN-PAGE STICKY NAVIGATION BAR (USER SPECIFIC REQUIREMENT)
          "in the static page the nave bar buttons should work and take you there in the static page where the navwork is in deatil"
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
                      ? "bg-[#0E6B73] text-white shadow-md shadow-[#0E6B73]/40 ring-1 ring-emerald-400/50"
                      : "text-[#C9D4DA] hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-300" : "text-[#C9D4DA]"}`} />
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
              <AlertTriangle className="w-4 h-4 text-[#C8321F]" />
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
          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs hover:border-[#0E6B73] hover:shadow-lg transition-all duration-300 space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#C8321F] flex items-center justify-center font-heading font-extrabold text-lg group-hover:scale-110 transition-transform">
              <Waves className="w-6 h-6 text-[#C8321F]" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#12263A]">
              Monsoon Flash Inundation
            </h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              Just 30 minutes of 45mm/h cloudburst submerges arterial thoroughfares like <strong>Jamrud Road, Saddar, University Road, Kohati Gate underpasses, and Gulbahar</strong>. Decades of unexcavated silt restrict gravity flow, trapping knee-deep water.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] font-bold text-[#C8321F]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8321F]" />
              <span>Average Inundation Depth: 25cm – 60cm</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs hover:border-[#0E6B73] hover:shadow-lg transition-all duration-300 space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#E0A100] flex items-center justify-center font-heading font-extrabold text-lg group-hover:scale-110 transition-transform">
              <FileQuestion className="w-6 h-6 text-[#E0A100]" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#12263A]">
              The &ldquo;Ghost Cleaned&rdquo; Drain Dilemma
            </h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              Sanitation contractors mark work-orders as &ldquo;Resolved&rdquo; on paper to clear billing, even when concrete slabs still conceal compacted mud and plastic waste. Citizens have had zero transparent counter-verification.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] font-bold text-[#E0A100]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E0A100]" />
              <span>Solved by: 3-Citizen Quorum Protocol</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs hover:border-[#0E6B73] hover:shadow-lg transition-all duration-300 space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-heading font-extrabold text-lg group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#12263A]">
              Lethal Murky Open Manholes
            </h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              When cloudy stormwater blankets streets, dislodged or missing manhole covers become submerged death traps. Pedestrians, children, and motorcyclists suffer critical injuries or drown in uncovered deep drainage conduits.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] font-bold text-rose-600">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              <span>Solved by: Proximity Radar & Avoid Zones</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs hover:border-[#0E6B73] hover:shadow-lg transition-all duration-300 space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0E6B73] flex items-center justify-center font-heading font-extrabold text-lg group-hover:scale-110 transition-transform">
              <Navigation className="w-6 h-6 text-[#0E6B73]" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#12263A]">
              Blind Commuting & Paralyzed Ambulances
            </h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              Commercial navigation apps only calculate vehicle congestion, not flood depth. Vehicles unwittingly drive straight into waterlogged underpasses, hydro-locking engines and paralyzing vital emergency transit routes.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] font-bold text-[#0E6B73]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0E6B73]" />
              <span>Solved by: AI Safe-Route Pathfinding</span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs hover:border-[#0E6B73] hover:shadow-lg transition-all duration-300 space-y-3 md:col-span-2 lg:col-span-2 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2E7D4F] flex items-center justify-center font-heading font-extrabold text-lg group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-[#2E7D4F]" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#12263A]">
              Mohallah Inequality & Disproportionate Response
            </h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              Affluent cantonment zones often receive rapid vacuum trucks, while historic high-density Union Councils such as <strong>Yakatooth, Kohati Gate, Charsadda Road, and Gulbahar</strong> wait weeks for desiltation while raw wastewater enters courtyards.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] font-bold text-[#2E7D4F]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D4F]" />
              <span>Solved by: Public River Staff Gauge Scoreboard</span>
            </div>
          </div>
        </div>

        {/* Before vs After Comparison Card */}
        <div className="bg-[#12263A] text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
            <Zap className="w-4 h-4 text-emerald-400" />
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
          SECTION 2: GEMINI 1.5 FLASH VISION AI
          ========================================================================= */}
      <section id="vision-ai" className="scroll-mt-28 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0E6B73]">
            <Sparkles className="w-4 h-4 text-[#0E6B73]" />
            <span>Multimodal Computer Vision Engine</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#12263A]">
            2. Google Gemini 1.5 Flash Hazard Triage
          </h2>
          <p className="text-sm sm:text-base text-[#4B6073] max-w-3xl">
            Citizens standing in heavy monsoon rain cannot fill out cumbersome 10-step municipal questionnaires. AquaSentinel requires just <strong>one photo</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-4">
              <h3 className="font-heading text-lg font-bold text-[#12263A] flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#0E6B73]" />
                <span>Instant Vision Pipeline Architecture</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
                When a photo is captured, our Next.js API route streams the high-resolution frame into <strong>Google Gemini 1.5 Flash</strong> using structured JSON function calling. Within 1,200ms, the model extracts:
              </p>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#EAF0F2]/70 border border-[#C9D4DA]/70">
                  <div className="w-6 h-6 rounded-full bg-[#0E6B73] text-white flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                  <div>
                    <h4 className="text-xs font-bold text-[#12263A]">Hazard Classification</h4>
                    <p className="text-[11px] text-[#4B6073]">Distinguishes between blocked culvert silt, open missing manhole, surface water stagnation, or structural road washouts.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#EAF0F2]/70 border border-[#C9D4DA]/70">
                  <div className="w-6 h-6 rounded-full bg-[#E0A100] text-white flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                  <div>
                    <h4 className="text-xs font-bold text-[#12263A]">Depth Estimation Calibrated to Street Markers</h4>
                    <p className="text-[11px] text-[#4B6073]">Uses car tires, sidewalks, curbs, and shopfront thresholds to classify depth: Ankle-deep (~10cm), Knee-deep (~30cm), or Danger (&gt;45cm).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#EAF0F2]/70 border border-[#C9D4DA]/70">
                  <div className="w-6 h-6 rounded-full bg-[#C8321F] text-white flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                  <div>
                    <h4 className="text-xs font-bold text-[#12263A]">Immediate Trilingual Safety Warning</h4>
                    <p className="text-[11px] text-[#4B6073]">Synthesizes localized advisory in English, Urdu (اردو), and Pashto (پښتو) to broadcast on sirens or display to commuters.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vision Output Simulation Card */}
          <div className="lg:col-span-6">
            <div className="bg-[#12263A] text-white p-6 sm:p-7 rounded-3xl border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block animate-pulse" />
                  <span className="font-mono text-xs text-emerald-300 font-bold">GEMINI-1.5-FLASH-INFERENCE</span>
                </div>
                <span className="text-[11px] font-mono text-[#C9D4DA]">latency: 1.18s</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/10 space-y-2">
                  <div className="text-emerald-400 font-bold">&#123;</div>
                  <div className="pl-4 space-y-1 text-slate-300">
                    <div><span className="text-cyan-300">&quot;detected_hazard&quot;</span>: <span className="text-amber-300">&quot;Open Manhole & Silt Clog&quot;</span>,</div>
                    <div><span className="text-cyan-300">&quot;severity&quot;</span>: <span className="text-rose-400">&quot;danger&quot;</span>,</div>
                    <div><span className="text-cyan-300">&quot;estimated_depth_cm&quot;</span>: <span className="text-emerald-300">42</span>,</div>
                    <div><span className="text-cyan-300">&quot;hazard_radius_meters&quot;</span>: <span className="text-emerald-300">35</span>,</div>
                    <div><span className="text-cyan-300">&quot;requires_wssp_heavy_machinery&quot;</span>: <span className="text-amber-300">true</span>,</div>
                    <div><span className="text-cyan-300">&quot;safety_broadcast_ur&quot;</span>: <span className="text-amber-200 font-sans">&quot;خبردار: گٹر کا ڈھکن غائب ہے۔ پیدل اور موٹر سائیکل سوار سڑک استعمال نہ کریں۔&quot;</span></div>
                  </div>
                  <div className="text-emerald-400 font-bold">&#125;</div>
                </div>

                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-400/20 text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-sans font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Auto-dispatched to WSSP Dispatch Queue</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/20 px-2 py-0.5 rounded">Priority 1</span>
                </div>
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
          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-[#C8321F] flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5 text-[#C8321F]" />
            </div>
            <h3 className="font-heading text-base font-bold text-[#12263A]">Pulsating Avoid-Road Perimeters</h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              When a hazard is marked &quot;Danger&quot; or &quot;Open Manhole&quot;, a radiant red animated buffer envelops the road segment, signaling to drivers to detour before water enters intake valves.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#0E6B73] flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-[#0E6B73]" />
            </div>
            <h3 className="font-heading text-base font-bold text-[#12263A]">30-Meter Spatial Deduplication</h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              Nearby reports within 30 meters automatically cluster into a single civic ticket with an &ldquo;I See This Too&rdquo; counter, eliminating ticket flood and amplifying mohallah urgency.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-3">
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
          SECTION 4: AI SAFE-ROUTE NAVIGATOR & RADAR
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
            Standard GPS navigation apps direct you along the shortest path—even if that path passes straight through an underpass with 3 feet of water.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C9D4DA] shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-heading text-xl font-bold text-[#12263A]">
              Dynamic Pathfinding with Hazard Avoidance Penalty
            </h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              AquaSentinel combines OpenStreetMap road vectors with active hazard weights. Flooded underpasses (e.g. Kohati Gate underpass, University Town dip) receive a massive traversal cost penalty, forcing the routing algorithm to guide vehicles safely along elevated bypasses.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                <Compass className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">50-Meter Proximity Radar</span>
                  <span>When a walking pedestrian or motorbike approaches within 50 meters of an active open manhole report, the device triggers an audio chime and high-contrast screen flash.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Ambulance Safe Corridor</span>
                  <span>Connects Lady Reading Hospital (LRH), Khyber Teaching Hospital (KTH), and Hayatabad Medical Complex (HMC) avoiding flooded choke points.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#12263A] text-white p-6 rounded-3xl border border-white/10 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto animate-pulse">
              <Radio className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="font-heading text-lg font-bold">Proximity Radar Active</h4>
            <p className="text-xs text-[#C9D4DA] max-w-xs mx-auto">
              Scanning 50m radius around user GPS location for open manholes and flooded underpasses.
            </p>
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold">
              0 Hazards on Current Bearing
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: AQUATWIN HYDROLOGICAL SIMULATOR
          ========================================================================= */}
      <section id="aquatwin" className="scroll-mt-28 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-600">
            <Waves className="w-4 h-4 text-emerald-600" />
            <span>Digital Twin Science</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#12263A]">
            5. AquaTwin Hydrological Runoff & Inundation Twin
          </h2>
          <p className="text-sm sm:text-base text-[#4B6073] max-w-3xl">
            A physics-calibrated runoff and inundation model designed for the actual topography and historical urban catchments of Peshawar.
          </p>
        </div>

        {/* AquaTwin Interactive Tab Showcase */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C9D4DA] shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-[#C9D4DA]/70 pb-4 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedSimTab("formula")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                selectedSimTab === "formula"
                  ? "bg-[#0E6B73] text-white shadow-sm"
                  : "text-[#4B6073] hover:text-[#12263A] hover:bg-[#EAF0F2]"
              }`}
            >
              Rational Runoff Method (Q = CIA/360)
            </button>

            <button
              type="button"
              onClick={() => setSelectedSimTab("catchments")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                selectedSimTab === "catchments"
                  ? "bg-[#0E6B73] text-white shadow-sm"
                  : "text-[#4B6073] hover:text-[#12263A] hover:bg-[#EAF0F2]"
              }`}
            >
              8 Peshawar Catchments
            </button>

            <button
              type="button"
              onClick={() => setSelectedSimTab("whatif")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                selectedSimTab === "whatif"
                  ? "bg-[#0E6B73] text-white shadow-sm"
                  : "text-[#4B6073] hover:text-[#12263A] hover:bg-[#EAF0F2]"
              }`}
            >
              What-If Desilting Mitigation
            </button>
          </div>

          {/* Tab 1: Formula */}
          {selectedSimTab === "formula" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-center text-lg sm:text-2xl font-bold tracking-wider border border-white/10 shadow-inner">
                  Q = (C · I · A) / 360
                </div>
                <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
                  AquaTwin applies the international civil engineering <strong>Rational Runoff Method</strong>:
                </p>
                <ul className="text-xs sm:text-sm text-[#4B6073] space-y-2">
                  <li className="flex items-start gap-2">
                    <strong className="text-[#0E6B73] font-mono">Q:</strong>
                    <span>Peak runoff discharge volume in cubic meters per second (m³/s).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="text-[#0E6B73] font-mono">C:</strong>
                    <span>Dimensionless runoff coefficient based on impervious asphalt vs unpaved ground (0.75 – 0.85 in congested Peshawar bazars).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="text-[#0E6B73] font-mono">I:</strong>
                    <span>Rainfall intensity in mm/hour (user can slide from 10mm/h drizzle up to 120mm/h flash cloudburst).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="text-[#0E6B73] font-mono">A:</strong>
                    <span>Drainage basin area in hectares for that specific union council.</span>
                  </li>
                </ul>
              </div>

              <div className="md:col-span-5 bg-[#EAF0F2] p-5 rounded-2xl border border-[#C9D4DA] space-y-3">
                <h4 className="font-heading text-sm font-bold text-[#12263A]">Live Database Choke Penalty</h4>
                <p className="text-xs text-[#4B6073] leading-relaxed">
                  Unlike theoretical textbooks, AquaTwin connects to real citizen reports. For every unresolved clogged drain ticket in that catchment, the effective conduit discharge capacity drops by <strong>18% per choke point</strong>, yielding accurate real-world inundation depth!
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Catchments */}
          {selectedSimTab === "catchments" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "Jamrud Road Corridor", uc: "UC-12", area: "145 ha", risk: "Critical" },
                { name: "Kohati Gate Underpass", uc: "UC-04", area: "68 ha", risk: "Danger" },
                { name: "Saddar Commercial", uc: "UC-08", area: "92 ha", risk: "Severe" },
                { name: "University Road Hub", uc: "UC-15", area: "130 ha", risk: "Severe" },
                { name: "Gulbahar Drain Arteries", uc: "UC-21", area: "85 ha", risk: "Moderate" },
                { name: "Yakatooth Historical", uc: "UC-02", area: "54 ha", risk: "Critical" },
                { name: "Charsadda Road Culvert", uc: "UC-33", area: "110 ha", risk: "Severe" },
                { name: "Hayatabad Phase 3", uc: "UC-45", area: "175 ha", risk: "Low" },
              ].map((c) => (
                <div key={c.name} className="p-3.5 rounded-2xl bg-[#EAF0F2]/70 border border-[#C9D4DA] space-y-1">
                  <div className="text-[10px] font-extrabold uppercase text-[#0E6B73]">{c.uc} • {c.area}</div>
                  <div className="text-xs font-bold text-[#12263A] leading-tight">{c.name}</div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded inline-block ${
                    c.risk === "Critical" ? "bg-red-100 text-red-800" :
                    c.risk === "Danger" ? "bg-rose-100 text-rose-800" :
                    c.risk === "Severe" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {c.risk} Risk
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: What-If */}
          {selectedSimTab === "whatif" && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-[#4B6073]">
                WSSP municipal engineers can toggle <strong>&ldquo;Simulate Desilting&rdquo;</strong> to forecast exact flood reduction before mobilizing heavy excavation excavators:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center space-y-1">
                  <div className="text-xl font-heading font-extrabold text-[#C8321F]">48 cm</div>
                  <div className="text-xs font-bold text-[#12263A]">Current Clogged Depth</div>
                  <div className="text-[11px] text-[#4B6073]">With 3 active silt bottlenecks</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                  <div className="text-xl font-heading font-extrabold text-[#2E7D4F]">14 cm</div>
                  <div className="text-xs font-bold text-[#12263A]">After WSSP Desilting</div>
                  <div className="text-[11px] text-[#4B6073]">Safe for low-chassis cars</div>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-1">
                  <div className="text-xl font-heading font-extrabold text-[#0E6B73]">-71%</div>
                  <div className="text-xs font-bold text-[#12263A]">Risk Mitigation</div>
                  <div className="text-[11px] text-[#4B6073]">Documented ROI for WSSP</div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 text-center">
            <Link
              href="/flood-simulator"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-md shadow-emerald-600/25 active:scale-95 cursor-pointer"
            >
              <Waves className="w-4 h-4 text-emerald-200" />
              <span>Launch Full-Screen AquaTwin Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
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
          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#0E6B73] flex items-center justify-center font-bold">
              <Activity className="w-5 h-5 text-[#0E6B73]" />
            </div>
            <h3 className="font-heading text-base font-bold text-[#12263A]">Average Days to Desilt</h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              Every Union Council is scored by how many days elapsed between the first citizen report and final verified fix. High numbers cause the visual water gauge to rise into danger zones.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-[#C8321F] flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5 text-[#C8321F]" />
            </div>
            <h3 className="font-heading text-base font-bold text-[#12263A]">Top 3 Neglected Union Councils</h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              Automatically highlights the 3 lowest-performing zones in Peshawar each week, creating transparent public pressure and preventing sanitation squads from neglecting historical UCs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-3">
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
          SECTION 7: 3-CITIZEN QUORUM
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
            The core integrity innovation of AquaSentinel: Municipal contractors cannot sign off on their own work.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            <div className="bg-[#EAF0F2]/70 p-4 rounded-2xl border border-[#C9D4DA]/70 space-y-2 text-center">
              <span className="text-xs font-mono font-extrabold text-[#C8321F] bg-red-100 px-2 py-0.5 rounded-full">Step 1</span>
              <h4 className="text-xs font-bold text-[#12263A]">Citizen Reports</h4>
              <p className="text-[11px] text-[#4B6073]">Photo taken, Gemini classifies depth, red hazard zone live on map.</p>
            </div>

            <div className="bg-[#EAF0F2]/70 p-4 rounded-2xl border border-[#C9D4DA]/70 space-y-2 text-center">
              <span className="text-xs font-mono font-extrabold text-[#E0A100] bg-amber-100 px-2 py-0.5 rounded-full">Step 2</span>
              <h4 className="text-xs font-bold text-[#12263A]">WSSP Resolves</h4>
              <p className="text-[11px] text-[#4B6073]">Sanitation crew marks &ldquo;Fixed&rdquo;. Ticket turns Amber holding state.</p>
            </div>

            <div className="bg-[#EAF0F2]/70 p-4 rounded-2xl border border-[#C9D4DA]/70 space-y-2 text-center ring-2 ring-[#0E6B73]/30">
              <span className="text-xs font-mono font-extrabold text-[#0E6B73] bg-teal-100 px-2 py-0.5 rounded-full">Step 3 (Quorum)</span>
              <h4 className="text-xs font-bold text-[#12263A]">3 Citizens Vote</h4>
              <p className="text-[11px] text-[#4B6073]">Neighbors physically inspect: 3 independent &ldquo;Yes, it is clean&rdquo; required.</p>
            </div>

            <div className="bg-[#EAF0F2]/70 p-4 rounded-2xl border border-[#C9D4DA]/70 space-y-2 text-center">
              <span className="text-xs font-mono font-extrabold text-[#2E7D4F] bg-emerald-100 px-2 py-0.5 rounded-full">Step 4</span>
              <h4 className="text-xs font-bold text-[#12263A]">Verified Green</h4>
              <p className="text-[11px] text-[#4B6073]">Ticket permanently stamped verified clean. WSSP scoreboard updated.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-950 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>If citizens vote &ldquo;No, still choked&rdquo;, the ticket immediately bounces back to WSSP admin queue with a penalty flag.</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: EMERGENCY BROADCASTS & AUDIO SIREN
          ========================================================================= */}
      <section id="emergency" className="scroll-mt-28 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#C8321F]">
            <Volume2 className="w-4 h-4 text-[#C8321F]" />
            <span>Crisis Audio & Rescue Dispatch</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#12263A]">
            8. Emergency Broadcasts, Sirens & Helplines
          </h2>
          <p className="text-sm sm:text-base text-[#4B6073] max-w-3xl">
            When flash floods peak, visual apps alone aren&apos;t enough. AquaSentinel integrates audible acoustic alerts and instant rescue dispatches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#C8321F] flex items-center justify-center font-bold">
              <Volume2 className="w-6 h-6 text-[#C8321F]" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#12263A]">
              Web Audio API Dual-Tone Siren
            </h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              Synthesizes an emergency oscillating acoustic alarm (800Hz / 1200Hz frequency modulation) directly inside the browser using zero external MP3 assets. Works instantly on mobile devices during critical flood evacuations.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-[#0E6B73] flex items-center justify-center font-bold">
              <Radio className="w-6 h-6 text-[#0E6B73]" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#12263A]">
              Mosque Loudspeaker Speech Synthesis
            </h3>
            <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
              Simulates traditional Peshawar mosque public loudspeaker announcements, reading out urgent evacuation warnings in native Urdu and Pashto accents so vulnerable elderly residents are promptly alerted.
            </p>
          </div>
        </div>

        <div className="bg-[#12263A] text-white p-6 rounded-3xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-heading text-base font-bold flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-red-400" />
              <span>Official Peshawar Emergency Hotlines Available 24/7</span>
            </h4>
            <p className="text-xs text-[#C9D4DA]">
              Rescue 1122 • WSSP Sanitation Helpline 1334 • PDMA KP Flood Cell 1700 • Edhi Emergency 115
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("naali-open-emergency"))}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-[#C8321F] hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-md transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Open Emergency Dialers</span>
          </button>
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
            <div key={item.title} className={`${item.color} p-4 rounded-2xl border border-white/10 space-y-1 text-center shadow-sm`}>
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
      <section className="bg-gradient-to-r from-[#12263A] via-[#163b5e] to-[#0E6B73] p-8 sm:p-12 rounded-3xl text-white text-center space-y-6 shadow-2xl border border-white/15 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

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

