"use client";

import React, { useEffect, useState } from "react";
import { syncOfflineReports, getOfflineQueue } from "@/lib/offline-queue";
import { Download, Wifi, WifiOff, CheckCircle2, X } from "lucide-react";

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial network status
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);

      // 2. Register Service Worker
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("PWA Service Worker registered with scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("SW registration error:", err);
          });
      }

      // 3. Listen to online/offline changes
      const handleOnline = async () => {
        setIsOnline(true);
        const { syncedCount } = await syncOfflineReports();
        if (syncedCount > 0) {
          setSyncToast(`✅ Back online! Successfully submitted ${syncedCount} offline report${syncedCount > 1 ? "s" : ""}.`);
          setTimeout(() => setSyncToast(null), 5000);
        }
      };

      const handleOffline = () => {
        setIsOnline(false);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // 4. Listen to PWA install prompt
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallBanner(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstall);

      // 5. Initial sync check if queue has pending items and online
      if (navigator.onLine && getOfflineQueue().length > 0) {
        syncOfflineReports().then(({ syncedCount }) => {
          if (syncedCount > 0) {
            setSyncToast(`✅ Submitted ${syncedCount} saved offline report${syncedCount > 1 ? "s" : ""}.`);
            setTimeout(() => setSyncToast(null), 5000);
          }
        });
      }

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* Offline Pill Warning Indicator */}
      {!isOnline && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-[#C8321F] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-1.5 animate-bounce">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode • Reports will save and sync when reconnected</span>
        </div>
      )}

      {/* Online Sync Success Toast */}
      {syncToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-white/20 animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{syncToast}</span>
          <button
            onClick={() => setSyncToast(null)}
            className="p-1 hover:bg-white/10 rounded-lg ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* PWA Mobile Install Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 bg-[#12263A] text-white p-3.5 rounded-2xl shadow-2xl border border-white/15 flex items-center justify-between gap-3 max-w-sm animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0E6B73] flex items-center justify-center text-white font-bold shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">Install AquaSentinel</div>
              <div className="text-[10px] text-[#C9D4DA] leading-tight">Add to Home Screen for fast offline reporting</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
            >
              Install
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="p-1 text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
