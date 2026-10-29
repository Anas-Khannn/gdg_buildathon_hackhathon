import React from "react";
import { Header } from "@/components/header";
import { AboutShowcase } from "@/components/about/about-showcase";

export const metadata = {
  title: "What We Solve & Project Architecture | AquaSentinel Peshawar",
  description:
    "Explore why AquaSentinel was built for Peshawar: AI hazard triage via Gemini 1.5 Flash Vision, AquaTwin hydrological runoff simulation, live Leaflet GIS avoid-road routing, and the 3-citizen anti-ghost fix quorum.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EAF0F2] text-[#12263A]">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-3.5 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12 pb-24 md:pb-12">
        <AboutShowcase />
      </main>
    </div>
  );
}
