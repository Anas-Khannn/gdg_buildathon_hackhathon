"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { useSession } from "@/components/providers";
import {
  Droplet,
  BarChart3,
  Info,
  User,
  ShieldAlert,
  LogIn,
  Waves,
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const { data: session } = useSession();

  const userRole = (session?.user as unknown as { role?: string })?.role || "user";
  const isAdmin = userRole === "admin";

  const isMapActive = pathname === "/";
  const isFloodSimActive = pathname === "/flood-simulator";
  const isScoreboardActive = pathname === "/scoreboard";
  const isAboutActive = pathname === "/about";
  const isAdminActive = pathname === "/admin";
  const isAuthActive = pathname.startsWith("/auth");

  const handleStaticNav = (targetId: string, e: React.MouseEvent) => {
    if (isAboutActive) {
      e.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        const offset = 110;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
        window.history.replaceState(null, "", `#${targetId}`);
      }
    }
  };

  const authLabel = session?.user?.name
    ? session.user.name.split(" ")[0]
    : language === "ur"
    ? "لاگ ان"
    : language === "ps"
    ? "ننوتل"
    : "Sign In";

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#12263A]/95 backdrop-blur-md border-t border-white/10 pb-[env(safe-area-inset-bottom)] select-none shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className={`grid ${isAdmin ? "grid-cols-6" : "grid-cols-5"} h-14 max-w-md mx-auto items-center px-1`}>
        {/* Map Tab */}
        <Link
          href="/"
          onClick={(e) => handleStaticNav("gis-map", e)}
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 text-center transition-colors relative ${
            isMapActive ? "text-emerald-400 font-bold" : "text-[#C9D4DA]/70 hover:text-white"
          }`}
        >
          {isMapActive && (
            <span className="absolute top-0 w-8 h-0.5 bg-emerald-400 rounded-full" />
          )}
          <Droplet className={`w-5 h-5 ${isMapActive ? "fill-emerald-400 text-emerald-400" : ""}`} />
          <span className="text-[10px] leading-none truncate max-w-[64px]">
            {t.mapView}
          </span>
        </Link>

        {/* Flood Sim Tab */}
        <Link
          href="/flood-simulator"
          onClick={(e) => handleStaticNav("aquatwin", e)}
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 text-center transition-colors relative ${
            isFloodSimActive ? "text-emerald-400 font-bold" : "text-[#C9D4DA]/70 hover:text-white"
          }`}
        >
          {isFloodSimActive && (
            <span className="absolute top-0 w-8 h-0.5 bg-emerald-400 rounded-full" />
          )}
          <Waves className="w-5 h-5" />
          <span className="text-[10px] leading-none truncate max-w-[64px]">
            {language === "ur" ? "سمیلیٹر" : "Flood Sim"}
          </span>
        </Link>

        {/* Scoreboard Tab */}
        <Link
          href="/scoreboard"
          onClick={(e) => handleStaticNav("scoreboard", e)}
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 text-center transition-colors relative ${
            isScoreboardActive ? "text-emerald-400 font-bold" : "text-[#C9D4DA]/70 hover:text-white"
          }`}
        >
          {isScoreboardActive && (
            <span className="absolute top-0 w-8 h-0.5 bg-emerald-400 rounded-full" />
          )}
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] leading-none truncate max-w-[64px]">
            {t.scoreboard}
          </span>
        </Link>

        {/* About / What We Solve Tab */}
        <Link
          href="/about"
          onClick={(e) => handleStaticNav("crisis", e)}
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 text-center transition-colors relative ${
            isAboutActive ? "text-emerald-400 font-bold" : "text-[#C9D4DA]/70 hover:text-white"
          }`}
        >
          {isAboutActive && (
            <span className="absolute top-0 w-8 h-0.5 bg-emerald-400 rounded-full" />
          )}
          <Info className="w-5 h-5" />
          <span className="text-[10px] leading-none truncate max-w-[64px]">
            {t.about}
          </span>
        </Link>

        {/* Admin Tab (If Admin) */}
        {isAdmin && (
          <Link
            href="/admin"
            onClick={(e) => handleStaticNav("quorum", e)}
            className={`flex flex-col items-center justify-center gap-1 h-full py-1 text-center transition-colors relative ${
              isAdminActive ? "text-amber-400 font-bold" : "text-amber-300/70 hover:text-white"
            }`}
          >
            {isAdminActive && (
              <span className="absolute top-0 w-8 h-0.5 bg-amber-400 rounded-full" />
            )}
            <ShieldAlert className="w-5 h-5" />
            <span className="text-[10px] leading-none truncate max-w-[64px]">
              WSSP
            </span>
          </Link>
        )}

        {/* Auth / Profile Tab */}
        <Link
          href={session ? "/about" : "/auth/signin"}
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 text-center transition-colors relative ${
            isAuthActive ? "text-emerald-400 font-bold" : "text-[#C9D4DA]/70 hover:text-white"
          }`}
        >
          {isAuthActive && (
            <span className="absolute top-0 w-8 h-0.5 bg-emerald-400 rounded-full" />
          )}
          {session ? (
            <User className="w-5 h-5 text-emerald-400" />
          ) : (
            <LogIn className="w-5 h-5" />
          )}
          <span className="text-[10px] leading-none truncate max-w-[64px]">
            {authLabel}
          </span>
        </Link>
      </div>
    </nav>
  );
}
