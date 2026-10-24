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
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const { data: session } = useSession();

  const userRole = (session?.user as unknown as { role?: string })?.role || "user";
  const isAdmin = userRole === "admin";

  const isMapActive = pathname === "/";
  const isScoreboardActive = pathname === "/scoreboard";
  const isAboutActive = pathname === "/about";
  const isAdminActive = pathname === "/admin";
  const isAuthActive = pathname.startsWith("/auth");

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
      <div className={`grid ${isAdmin ? "grid-cols-5" : "grid-cols-4"} h-14 max-w-md mx-auto items-center px-1`}>
        {/* Map Tab */}
        <Link
          href="/"
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

        {/* Scoreboard Tab */}
        <Link
          href="/scoreboard"
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
