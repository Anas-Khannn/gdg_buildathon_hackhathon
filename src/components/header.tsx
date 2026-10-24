"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { Language } from "@/lib/i18n";
import { useSession, signOut } from "@/components/providers";
import { Droplet, BarChart3, ShieldAlert, LogIn, LogOut, UserCheck, Info } from "lucide-react";

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { data: session } = useSession();
  const pathname = usePathname();

  const userRole = (session?.user as unknown as { role?: string })?.role || "user";
  const isAdmin = userRole === "admin";

  const languages: { code: Language; label: string; shortLabel: string }[] = [
    { code: "en", label: "English", shortLabel: "EN" },
    { code: "ur", label: "اردو", shortLabel: "اردو" },
    { code: "ps", label: "پښتو", shortLabel: "پښتو" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#12263A] text-white border-b border-[#4B6073]/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Logo with Water Drop Signature */}
        <Link
          href="/"
          className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none select-none shrink-0"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0E6B73] to-[#095259] flex items-center justify-center text-white shadow-md shadow-[#0E6B73]/20 transition-transform group-hover:scale-105 border border-white/10 shrink-0">
            <Droplet className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-400 rounded-full border-2 border-[#12263A]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-white leading-none">
                {t.appName}
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/10 text-emerald-300 border border-white/10">
                Peshawar
              </span>
            </div>
            <span className="text-[11px] text-[#C9D4DA]/80 tracking-wide font-medium hidden sm:block mt-0.5">
              {t.tagline}
            </span>
          </div>
        </Link>

        {/* Center Navigation Segmented Links (Desktop Only - Mobile uses MobileNav) */}
        <nav className="hidden md:flex items-center bg-black/25 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              pathname === "/"
                ? "bg-[#0E6B73] text-white shadow-sm"
                : "text-[#EAF0F2]/80 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>{t.mapView}</span>
          </Link>

          <Link
            href="/scoreboard"
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              pathname === "/scoreboard"
                ? "bg-[#0E6B73] text-white shadow-sm"
                : "text-[#EAF0F2]/80 hover:text-white hover:bg-white/5"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t.scoreboard}</span>
          </Link>

          <Link
            href="/about"
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              pathname === "/about"
                ? "bg-[#0E6B73] text-white shadow-sm"
                : "text-[#EAF0F2]/80 hover:text-white hover:bg-white/5"
            }`}
          >
            <Info className="w-4 h-4" />
            <span>{t.about}</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                pathname === "/admin"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-amber-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden sm:inline">{t.adminPortal}</span>
            </Link>
          )}
        </nav>

        {/* Right Side: Language Switcher & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Tri-Lingual Toggle Pill */}
          <div className="flex items-center bg-black/25 p-0.5 sm:p-1 rounded-xl border border-white/10 text-xs">
            {languages.map((item) => (
              <button
                key={item.code}
                onClick={() => setLanguage(item.code)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg font-semibold text-[11px] sm:text-xs transition-all ${
                  language === item.code
                    ? "bg-[#0E6B73] text-white shadow-sm"
                    : "text-[#C9D4DA] hover:text-white"
                }`}
              >
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.shortLabel}</span>
              </button>
            ))}
          </div>

          {/* User Profile / Login */}
          {session ? (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 pl-2.5 sm:pl-3 pr-1 sm:pr-1.5 py-1 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-white max-w-[90px] truncate hidden md:inline">
                  {session.user?.name?.split(" ")[0]}
                </span>
                {isAdmin && (
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    WSSP
                  </span>
                )}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                title={t.signOut}
                className="p-1 sm:p-1.5 rounded-lg text-[#C9D4DA] hover:text-white hover:bg-white/10 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold bg-[#0E6B73] hover:bg-[#095259] text-white transition shadow-sm border border-white/15"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.signIn}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
