import React from "react";
import Link from "next/link";
import { Header } from "@/components/header";
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
} from "lucide-react";

export const metadata = {
  title: "What We Solve & Project Mission | Naali Watch Peshawar",
  description:
    "Learn why Naali Watch was created for Peshawar, the civic waterlogging crisis it solves, and how AI-powered citizen reporting brings transparency to WSSP desiltation.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EAF0F2] text-[#12263A]">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-3.5 sm:px-6 py-6 sm:py-12 space-y-8 sm:space-y-12 pb-24 md:pb-12">
        {/* HERO SECTION WITH EMBEDDED AUTH WIDGET */}
        <section className="bg-gradient-to-br from-[#12263A] via-[#16334f] to-[#0E6B73] rounded-3xl p-5 sm:p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-[#0E6B73]/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Mission & Problem Pitch */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-300 text-xs font-extrabold uppercase tracking-widest backdrop-blur-sm">
                <Droplet className="w-3.5 h-3.5 fill-current" />
                <span>Civic Infrastructure Mission • Peshawar, KP</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Peshawar does not lack complaints.
                <span className="block text-emerald-300 mt-1">
                  It lacks a map that makes them impossible to ignore.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#EAF0F2]/90 leading-relaxed font-normal">
                <strong>Naali Watch</strong> is an open civic technology initiative designed specifically for the streets, underpasses, and mohallahs of Peshawar. We bridge the gap between frustrated citizens navigating flooded roads and municipal sanitation teams (WSSP) through AI-verified photo complaints, live hazard routing, and democratic fix verification.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#C9D4DA]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Gemini Vision AI</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Avoid-Road Hazard Zones</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>3-Citizen Verification Quorum</span>
                </span>
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

        {/* SECTION 1: WHAT WE SOLVE (THE CRISIS) */}
        <section className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#C8321F]">
              <AlertTriangle className="w-4 h-4 text-[#C8321F]" />
              <span>The Civic Drainage Challenge</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#12263A]">
              What Problems Does Naali Watch Solve?
            </h2>
            <p className="text-sm sm:text-base text-[#4B6073] max-w-2xl">
              Every monsoon season, Peshawar faces severe municipal breakdown. Naali Watch tackles the five critical structural bottlenecks in the city&apos;s sanitation pipeline:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Problem 1 */}
            <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs hover:border-[#0E6B73]/50 transition space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-red-50 text-[#C8321F] flex items-center justify-center font-heading font-extrabold text-lg">
                <Waves className="w-6 h-6 text-[#C8321F]" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#12263A]">
                1. Monsoon Flash Urban Flooding
              </h3>
              <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
                Just 30 minutes of summer rainfall submerges arterial thoroughfares like <strong>Jamrud Road, Saddar, University Road, Kohati Gate underpasses, and Gulbahar</strong>. Storm drains choked with years of unexcavated silt cannot siphon water away, turning busy public roads into knee-deep lagoons.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs hover:border-[#0E6B73]/50 transition space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-[#E0A100] flex items-center justify-center font-heading font-extrabold text-lg">
                <FileQuestion className="w-6 h-6 text-[#E0A100]" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#12263A]">
                2. The &ldquo;Ghost Cleaned&rdquo; Drain Dilemma
              </h3>
              <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
                Municipal contractors and sanitation workers frequently mark work-orders as &ldquo;Complete&rdquo; on paper or in internal bureaucracy, even when cement slabs still conceal feet of impacted mud and solid plastic waste. Citizens have had zero tool to challenge bogus completion claims.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs hover:border-[#0E6B73]/50 transition space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-heading font-extrabold text-lg">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#12263A]">
                3. Lethal Open Manholes Under Murky Water
              </h3>
              <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
                When dirty flood water blankets streets, uncovered gutters and open manholes become invisible death traps. Every year, unsuspecting pedestrians, young children, and motorcyclists suffer severe injuries or drown in uncovered drainage conduits.
              </p>
            </div>

            {/* Problem 4 */}
            <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs hover:border-[#0E6B73]/50 transition space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0E6B73] flex items-center justify-center font-heading font-extrabold text-lg">
                <Navigation className="w-6 h-6 text-[#0E6B73]" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#12263A]">
                4. Blind Commuting & Traffic Paralysis
              </h3>
              <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
                Standard navigation apps show traffic slowdowns, but never alert drivers or ambulances about waterlogged roads. Vehicles drive straight into water that hydro-locks engines, stalling emergency transit and paralyzing Peshawar&apos;s commercial hubs.
              </p>
            </div>

            {/* Problem 5 */}
            <div className="bg-white p-6 rounded-3xl border border-[#C9D4DA] shadow-xs hover:border-[#0E6B73]/50 transition space-y-3 md:col-span-2 lg:col-span-2">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#2E7D4F] flex items-center justify-center font-heading font-extrabold text-lg">
                <BarChart3 className="w-6 h-6 text-[#2E7D4F]" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#12263A]">
                5. The Disproportionate Mohallah Accountability Gap
              </h3>
              <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
                Affluent neighborhoods often receive prompt sanitation desiltation squads, while densely populated historical Union Councils like <strong>Yakatooth, Kohati Gate, Charsadda Road, and Gulbahar</strong> wait weeks for response while raw wastewater seeps into doorsteps. Without public ward-by-ward metrics, negligence remains invisible.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: WHAT THIS PROJECT AIMS TO DO (THE SOLUTION) */}
        <section className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0E6B73]">
              <Sparkles className="w-4 h-4 text-[#0E6B73]" />
              <span>Project Vision & Capabilities</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#12263A]">
              What Naali Watch Aims To Do
            </h2>
            <p className="text-sm sm:text-base text-[#4B6073] max-w-2xl">
              We replace closed bureaucratic black boxes with an open, intelligent, community-powered civic operating system:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Aim 1 */}
            <div className="bg-white p-7 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-3 relative overflow-hidden group hover:border-[#0E6B73] transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0E6B73] text-white flex items-center justify-center shadow-md">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#12263A]">
                    1-Tap AI Depth & Hazard Classification
                  </h3>
                  <span className="text-xs font-semibold text-[#0E6B73]">Powered by Google Gemini 1.5 Vision</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
                Citizens don&apos;t have to write long descriptions or fill out complex forms while standing in the rain. Just snap one photo. Our vision engine assesses the obstruction, categorizes the problem (Blocked Drain, Standing Water, Open Manhole), and estimates water hazard depth (Ankle-deep, Knee-deep, Danger).
              </p>
            </div>

            {/* Aim 2 */}
            <div className="bg-white p-7 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-3 relative overflow-hidden group hover:border-[#0E6B73] transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C8321F] text-white flex items-center justify-center shadow-md">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#12263A]">
                    Dynamic Avoid-Road Hazard Zones
                  </h3>
                  <span className="text-xs font-semibold text-[#C8321F]">Real-time commuter safety on OpenStreetMap</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
                Whenever danger-level flooding or an open manhole is reported, a pulsating red danger perimeter activates on the map. Pedestrians, motorcyclists, rickshaws, and ambulances immediately know which streets and underpasses are impassable.
              </p>
            </div>

            {/* Aim 3 */}
            <div className="bg-white p-7 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-3 relative overflow-hidden group hover:border-[#0E6B73] transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E0A100] text-white flex items-center justify-center shadow-md">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#12263A]">
                    Spatial Deduplication & &ldquo;I See This Too&rdquo;
                  </h3>
                  <span className="text-xs font-semibold text-[#E0A100]">Clustering within 30 meters</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
                Instead of bombarding WSSP with 50 duplicate reports for the same clogged drain, Naali Watch automatically groups nearby complaints within 30 meters into one single civic ticket, allowing neighbors to tap &ldquo;I See This Too&rdquo; to elevate priority.
              </p>
            </div>

            {/* Aim 4 */}
            <div className="bg-white p-7 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-3 relative overflow-hidden group hover:border-[#0E6B73] transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2E7D4F] text-white flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#12263A]">
                    The 3-Citizen Fix Verification Quorum
                  </h3>
                  <span className="text-xs font-semibold text-[#2E7D4F]">Zero Ghost Fixes Guarantee</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
                WSSP staff can mark an issue as resolved, but the system marks it as <em>&ldquo;Marked Fixed by WSSP&rdquo;</em> (amber). It is <strong>NEVER</strong> stamped <em>&ldquo;Verified Fixed&rdquo;</em> (green) until three independent local citizens physically on-ground vote &ldquo;Yes, it is fixed&rdquo;.
              </p>
            </div>

            {/* Aim 5 */}
            <div className="bg-white p-7 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-3 relative overflow-hidden group hover:border-[#0E6B73] transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#12263A] text-white flex items-center justify-center shadow-md">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#12263A]">
                    Peshawar Drainage Scoreboard & River Gauges
                  </h3>
                  <span className="text-xs font-semibold text-[#4B6073]">Democratic municipal performance index</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
                Inspired by river staff gauges that every Pakistani understands: water level height visually denotes average days to fix per zone. The public scoreboard highlights the 3 worst-performing areas each month, creating transparent civic pressure for equitable desiltation.
              </p>
            </div>

            {/* Aim 6 */}
            <div className="bg-white p-7 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-3 relative overflow-hidden group hover:border-[#0E6B73] transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0E6B73] text-white flex items-center justify-center shadow-md">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#12263A]">
                    Trilingual & Offline-First Resiliency
                  </h3>
                  <span className="text-xs font-semibold text-[#0E6B73]">English, Urdu (اردو), and Pashto (پښتو)</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#4B6073] leading-relaxed">
                Designed for everyone in Peshawar. The entire app switches with one click into Urdu or Pashto with full RTL typography. Furthermore, with IndexedDB offline queueing, reports captured during stormy network outages are safely stored and auto-dispatched the moment connectivity resumes.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW IT WORKS STEP-BY-STEP */}
        <section className="bg-white p-7 sm:p-10 rounded-3xl border border-[#C9D4DA] shadow-xs space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0E6B73]">
              Simple 5-Step Lifecycle
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#12263A]">
              How Naali Watch Works
            </h2>
            <p className="text-xs sm:text-sm text-[#4B6073]">
              From the moment water begins accumulating on the road until the drain is verified clean.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
            {/* Step 1 */}
            <div className="bg-[#EAF0F2]/60 p-5 rounded-2xl border border-[#C9D4DA]/80 space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-[#12263A] text-white font-bold text-xs flex items-center justify-center mx-auto">
                1
              </div>
              <h4 className="font-heading text-sm font-bold text-[#12263A]">Snap Photo</h4>
              <p className="text-xs text-[#4B6073] leading-relaxed">
                Citizen spots water hazard or blocked naali and takes a photo. GPS auto-tags Peshawar coordinates.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#EAF0F2]/60 p-5 rounded-2xl border border-[#C9D4DA]/80 space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-[#0E6B73] text-white font-bold text-xs flex items-center justify-center mx-auto">
                2
              </div>
              <h4 className="font-heading text-sm font-bold text-[#12263A]">AI Vision Analysis</h4>
              <p className="text-xs text-[#4B6073] leading-relaxed">
                Gemini Vision analyzes water depth, detect silt or debris, and flags open manhole hazards.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#EAF0F2]/60 p-5 rounded-2xl border border-[#C9D4DA]/80 space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-[#C8321F] text-white font-bold text-xs flex items-center justify-center mx-auto">
                3
              </div>
              <h4 className="font-heading text-sm font-bold text-[#12263A]">Hazard Zone Live</h4>
              <p className="text-xs text-[#4B6073] leading-relaxed">
                Pulsating avoid-road zone appears on live map to steer traffic away from danger.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#EAF0F2]/60 p-5 rounded-2xl border border-[#C9D4DA]/80 space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-[#E0A100] text-white font-bold text-xs flex items-center justify-center mx-auto">
                4
              </div>
              <h4 className="font-heading text-sm font-bold text-[#12263A]">WSSP Action</h4>
              <p className="text-xs text-[#4B6073] leading-relaxed">
                Sanitation crew desilts the drain or replaces manhole cover and marks ticket as resolved.
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-[#EAF0F2]/60 p-5 rounded-2xl border border-[#C9D4DA]/80 space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-[#2E7D4F] text-white font-bold text-xs flex items-center justify-center mx-auto">
                5
              </div>
              <h4 className="font-heading text-sm font-bold text-[#12263A]">3 Citizens Verify</h4>
              <p className="text-xs text-[#4B6073] leading-relaxed">
                Ticket only turns green once 3 local neighbors physically verify: &ldquo;Yes, it is fixed&rdquo;.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: CALL TO ACTION FOOTER */}
        <section className="bg-gradient-to-r from-[#12263A] to-[#0E6B73] p-8 sm:p-12 rounded-3xl text-white text-center space-y-6 shadow-xl border border-white/10">
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Make Peshawar Flood-Resilient?
            </h3>
            <p className="text-sm sm:text-base text-[#EAF0F2]/90 leading-relaxed font-normal">
              Sign up today as a citizen to safeguard your mohallah, or sign in with your municipal credentials to respond to live desiltation tickets.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/signin?role=user"
              className="px-7 py-3.5 rounded-2xl bg-white text-[#12263A] font-bold text-sm hover:bg-emerald-50 transition shadow-lg flex items-center gap-2 group"
            >
              <span>Sign Up as Citizen</span>
              <ArrowRight className="w-4 h-4 text-[#0E6B73] group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/auth/signin?role=admin"
              className="px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition backdrop-blur-md flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Sign In as WSSP Official</span>
            </Link>

            <Link
              href="/scoreboard"
              className="px-6 py-3.5 rounded-2xl text-[#C9D4DA] hover:text-white font-semibold text-sm transition flex items-center gap-1.5"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View WSSP Scoreboard</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
