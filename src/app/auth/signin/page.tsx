"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Droplet, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AuthWidget } from "@/components/auth/auth-widget";
import { useLanguage } from "@/components/language-provider";
import { Language } from "@/lib/i18n";

function AuthSignInContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "admin" ? "admin" : "user";
  const initialTab =
    searchParams.get("tab") === "forgot"
      ? "forgot"
      : searchParams.get("tab") === "signin"
      ? "signin"
      : "signup";

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
          <span>Learn what Naali Watch solves & our civic vision for Peshawar</span>
        </Link>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12263A] via-[#16334f] to-[#0E6B73] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#0E6B73]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white rounded-3xl p-8 text-center text-[#12263A] font-bold">
            Loading Naali Watch Auth...
          </div>
        }
      >
        <AuthSignInContent />
      </Suspense>
    </div>
  );
}
