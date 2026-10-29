"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Droplet, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AuthWidget } from "@/components/auth/auth-widget";
import { useLanguage } from "@/components/language-provider";
import { useSession } from "@/components/providers";
import { Language } from "@/lib/i18n";

function AuthSignInContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const initialRole = searchParams.get("role") === "admin" ? "admin" : "user";
  const initialEmail = searchParams.get("email") || "";
  const initialTab =
    searchParams.get("tab") === "forgot"
      ? "forgot"
      : searchParams.get("tab") === "signup"
      ? "signup"
      : "signin";
  const isRegistered = searchParams.get("registered") === "true";
  const initialSuccessMsg = isRegistered
    ? "Account created successfully! Please sign in with your email and password."
    : undefined;

  useEffect(() => {
    // Only auto-redirect to dashboard if session exists and user is not explicitly accessing signin/signup tabs
    const hasExplicitAuthIntent =
      searchParams.has("tab") || searchParams.has("registered") || searchParams.has("email");
    if (session?.user && !hasExplicitAuthIntent) {
      window.location.replace(session.user.role === "admin" ? "/admin" : "/");
    }
  }, [session, searchParams]);

  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "ur", label: "اردو" },
    { code: "ps", label: "پښتو" },
  ];

  return (
    <div className="w-full max-w-md space-y-4 relative z-10">
      {/* Top Header & Brand */}
      <div className="flex items-center justify-between px-1">
        <Link
          href="/about"
          className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white transition font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>What We Solve</span>
        </Link>

        {/* Trilingual Toggle */}
        <div className="flex items-center bg-black/30 backdrop-blur-md p-1 rounded-xl border border-white/10 text-xs font-semibold">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              className={`px-2 py-0.5 rounded-lg transition ${
                language === l.code
                  ? "bg-[#0E6B73] text-white shadow-xs font-bold"
                  : "text-[#C9D4DA] hover:text-white"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Auth Card */}
      <AuthWidget
        initialTab={initialTab}
        initialRole={initialRole}
        initialEmail={initialEmail}
        initialSuccessMsg={initialSuccessMsg}
        onSuccessRedirect="/"
        className="w-full"
      />

      {/* Mission Banner Link */}
      <div className="text-center pt-1">
        <Link
          href="/about"
          className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white transition font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Learn what AquaSentinel solves & our civic vision for Peshawar</span>
        </Link>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-[#12263A] via-[#16334f] to-[#0E6B73] flex items-center justify-center p-3 sm:p-4 pb-24 md:pb-6 relative overflow-hidden">
      {/* Decorative animated background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#0E6B73]/35 rounded-full blur-3xl pointer-events-none animate-float-slow" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute -top-32 right-1/4 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Floating animated water bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-[12%] bottom-0 w-8 h-8 rounded-full bg-cyan-400/25 backdrop-blur-sm border border-cyan-300/30 animate-bubble-1" />
        <div className="absolute left-[28%] bottom-0 w-12 h-12 rounded-full bg-emerald-400/20 backdrop-blur-sm border border-emerald-300/30 animate-bubble-2" />
        <div className="absolute left-[54%] bottom-0 w-6 h-6 rounded-full bg-teal-300/30 backdrop-blur-sm border border-teal-200/40 animate-bubble-3" />
        <div className="absolute left-[78%] bottom-0 w-10 h-10 rounded-full bg-cyan-300/20 backdrop-blur-sm border border-cyan-200/30 animate-bubble-4" />
        <div className="absolute left-[90%] bottom-0 w-7 h-7 rounded-full bg-emerald-300/25 backdrop-blur-sm border border-emerald-200/30 animate-bubble-5" />
      </div>

      {/* Floating subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

      {/* Undulating water wave at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-16 pointer-events-none overflow-hidden opacity-30">
        <svg className="absolute bottom-0 w-[200%] h-full animate-wave-slide" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,40 C150,90 350,-20 500,40 C650,100 900,0 1200,40 L1200,120 L0,120 Z" fill="#22d3ee" fillOpacity="0.4" />
          <path d="M0,60 C200,10 400,90 600,50 C800,10 1000,80 1200,60 L1200,120 L0,120 Z" fill="#34d399" fillOpacity="0.3" />
        </svg>
      </div>

      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-8 text-center text-[#12263A] font-bold shadow-2xl border border-white/20 animate-pulse">
            Loading AquaSentinel Auth...
          </div>
        }
      >
        <AuthSignInContent />
      </Suspense>
    </div>
  );
}
