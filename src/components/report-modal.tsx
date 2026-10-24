"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import imageCompression from "browser-image-compression";
import { useLanguage } from "@/components/language-provider";
import { DropletPin, SeverityType } from "@/components/droplet-pin";
import {
  Camera,
  Upload,
  X,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  MapPin,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Search,
  Globe,
  Navigation,
  Key,
  WifiOff,
} from "lucide-react";
import { saveReportOffline } from "@/lib/offline-queue";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated: (report: any) => void;
  defaultLocation: { lat: number; lng: number } | null;
  onRequestPickLocation: () => void;
}

const PESHAWAR_QUICK_AREAS = [
  { name: "Hayatabad", lat: 33.9850, lng: 71.4420 },
  { name: "University Town", lat: 34.0040, lng: 71.5030 },
  { name: "Saddar Bazar", lat: 34.0080, lng: 71.5450 },
  { name: "Kohati Gate", lat: 34.0090, lng: 71.5720 },
  { name: "Hashtnagri", lat: 34.0150, lng: 71.5830 },
  { name: "Gulbahar", lat: 34.0160, lng: 71.5950 },
  { name: "Charsadda Road", lat: 34.0380, lng: 71.5850 },
  { name: "Ring Road", lat: 33.9890, lng: 71.5650 },
];

export function ReportModal({
  isOpen,
  onClose,
  onReportCreated,
  defaultLocation,
  onRequestPickLocation,
}: ReportModalProps) {
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Flow steps: 'photo' | 'analyzing' | 'review' | 'duplicate_warning' | 'success' | 'success_offline' | 'invalid_image'
  const [step, setStep] = useState<"photo" | "analyzing" | "review" | "duplicate_warning" | "success" | "success_offline" | "invalid_image">("photo");
  const [invalidImageDetails, setInvalidImageDetails] = useState<{
    detectedContent: string;
    reason: string;
    reasonUr: string;
  } | null>(null);

  // Form State
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFilename, setPhotoFilename] = useState<string | null>(null);
  const [photoFileObj, setPhotoFileObj] = useState<File | null>(null);
  const [problemType, setProblemType] = useState<"blocked_drain" | "standing_water" | "open_manhole" | "garbage_in_drain" | "other">("blocked_drain");
  const [severity, setSeverity] = useState<SeverityType>("knee");
  const [complaintText, setComplaintText] = useState("");
  const [confidence, setConfidence] = useState<number>(0.92);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    defaultLocation || { lat: 34.0151, lng: 71.5249 }
  );

  // Free Location & Geocoding State
  const [locationAddress, setLocationAddress] = useState<string>("Detecting Peshawar location...");
  const [locationSource, setLocationSource] = useState<"gps" | "ip" | "search" | "manual" | "chip">("manual");
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [searchLocationQuery, setSearchLocationQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // Gemini Free Key State
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showKeySettings, setShowKeySettings] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Duplicate Check State
  const [duplicateData, setDuplicateData] = useState<{
    id: string;
    distanceMeters: number;
  } | null>(null);

  // Load saved Gemini Key from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("naali_gemini_api_key");
      if (savedKey) setGeminiApiKey(savedKey);
    }
  }, []);

  // Sync external default location (e.g. from map click)
  useEffect(() => {
    if (defaultLocation) {
      setLocation(defaultLocation);
      setLocationSource("manual");
      reverseGeocode(defaultLocation.lat, defaultLocation.lng);
    }
  }, [defaultLocation]);

  // Reverse geocode lat/lng to human-readable Peshawar street
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocodingLoading(true);
    try {
      const res = await fetch(`/api/geocode?action=reverse&lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data.shortTitle) {
          setLocationAddress(data.shortTitle);
        } else if (data.displayName) {
          setLocationAddress(data.displayName.split(",").slice(0, 3).join(","));
        }
      }
    } catch (err) {
      setLocationAddress(`Peshawar (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    } finally {
      setIsGeocodingLoading(false);
    }
  }, []);

  // Free Auto-Detect Location (GPS with free IP Geolocation fallback)
  const autoDetectLocation = useCallback(async () => {
    setIsGeocodingLoading(true);

    const tryIpFallback = async () => {
      try {
        const ipRes = await fetch("/api/geocode?action=ip");
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData.success) {
            const coords = { lat: ipData.lat, lng: ipData.lng };
            setLocation(coords);
            setLocationSource("ip");
            await reverseGeocode(coords.lat, coords.lng);
            return;
          }
        }
      } catch (e) {}

      // Default central Peshawar
      const defCoords = { lat: 34.0125, lng: 71.5540 };
      setLocation(defCoords);
      setLocationAddress("Peshawar City Central");
      setIsGeocodingLoading(false);
    };

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setLocation(coords);
          setLocationSource("gps");
          await reverseGeocode(coords.lat, coords.lng);
        },
        async (err) => {
          console.warn("GPS failed/denied, using free IP geolocation:", err.message);
          await tryIpFallback();
        },
        { timeout: 7000, enableHighAccuracy: true }
      );
    } else {
      await tryIpFallback();
    }
  }, [reverseGeocode]);

  // Initial location detect when modal opens
  useEffect(() => {
    if (isOpen && !location) {
      autoDetectLocation();
    } else if (isOpen && location && locationAddress === "Detecting Peshawar location...") {
      reverseGeocode(location.lat, location.lng);
    }
  }, [isOpen, location, autoDetectLocation, reverseGeocode, locationAddress]);

  // Free Location Search via OpenStreetMap Nominatim
  const handleSearchLocation = async (queryText: string) => {
    setSearchLocationQuery(queryText);
    if (!queryText.trim() || queryText.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearchingLocation(true);
    try {
      const res = await fetch(`/api/geocode?action=search&q=${encodeURIComponent(queryText)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (e) {
      console.warn("Search error:", e);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const selectSearchResult = (item: any) => {
    const coords = { lat: item.lat, lng: item.lng };
    setLocation(coords);
    setLocationAddress(item.road || item.displayName.split(",")[0]);
    setLocationSource("search");
    setSearchResults([]);
    setSearchLocationQuery("");
  };

  const selectQuickArea = (area: typeof PESHAWAR_QUICK_AREAS[0]) => {
    const coords = { lat: area.lat, lng: area.lng };
    setLocation(coords);
    setLocationAddress(area.name + ", Peshawar");
    setLocationSource("chip");
    setSearchResults([]);
    setSearchLocationQuery("");
  };

  // Save Gemini API Key
  const handleSaveGeminiKey = (key: string) => {
    setGeminiApiKey(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("naali_gemini_api_key", key);
    }
  };

  if (!isOpen) return null;

  // Handle Photo Selection & Compression
  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setStep("analyzing");

    try {
      // 1. Trigger location detect in parallel
      if (!location) {
        autoDetectLocation();
      }

      // 2. Client-side compression (~300 KB) as specified in PRD Section 5
      const options = {
        maxSizeMB: 0.35,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      setPhotoFileObj(compressedFile);

      // Local preview URL
      const previewUrl = URL.createObjectURL(compressedFile);
      setPhotoPreview(previewUrl);

      // 3. Upload and send to /api/analyze for Gemini Vision
      const formData = new FormData();
      formData.append("file", compressedFile);
      if (geminiApiKey.trim()) {
        formData.append("geminiApiKey", geminiApiKey.trim());
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = await res.json();
      setPhotoFilename(data.photoFile);

      // STRICT VALIDATION: Check if image meets the standing water / drainage hazard criteria
      if (data.isValidWaterHazard === false || data.ai?.valid === false) {
        setInvalidImageDetails({
          detectedContent: data.ai?.detected_content || "Non-water photo",
          reason:
            data.ai?.rejection_reason ||
            "Wrong image! Please upload a photo showing standing water, flooded streets, or a blocked drain that needs to be drained.",
          reasonUr:
            data.ai?.rejection_reason_ur ||
            "غلط تصویر! برائے مہربانی کھڑے پانی، بند نالے، یا نکاسی آب کے مسئلے کی تصویر اپ لوڈ کریں جسے نکاسی کی ضرورت ہو۔",
        });
        setStep("invalid_image");
        return;
      }

      if (data.ai) {
        if (data.ai.type) setProblemType(data.ai.type);
        if (data.ai.severity) setSeverity(data.ai.severity);
        if (data.ai.confidence) setConfidence(Number(data.ai.confidence));

        // Set dual-language text
        const text =
          language === "ur" || language === "ps"
            ? data.ai.complaint_ur || data.ai.complaint_en
            : data.ai.complaint_en || data.ai.description;
        setComplaintText(text || "");

        // If Gemini Vision detected an estimated Peshawar area, auto-select it if not manually placed
        if (data.ai.estimated_area) {
          const matchedArea = PESHAWAR_QUICK_AREAS.find(
            (a) => a.name.toLowerCase() === data.ai.estimated_area.toLowerCase()
          );
          if (matchedArea && locationSource !== "gps") {
            setLocation({ lat: matchedArea.lat, lng: matchedArea.lng });
            setLocationAddress(matchedArea.name + " (AI Landmark Detected)");
            setLocationSource("chip");
          }
        }
      }

      setStep("review");
    } catch (err: any) {
      console.error("Photo processing error:", err);
      setErrorMsg("We couldn't analyze the photo with AI. You can still select problem details manually.");
      setStep("review");
    }
  };

  // Pre-submit duplicate check
  const handleSubmitCheck = async () => {
    if (!location) {
      setErrorMsg("Please enable location or select a spot on the map.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // Check if duplicate within 30m exists (PRD Section 6 F7)
      const checkRes = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoFile: photoFilename || "kohati_water.jpg",
          type: problemType,
          severity,
          lat: location.lat,
          lng: location.lng,
          checkDuplicatesOnly: true,
        }),
      });

      const checkData = await checkRes.json();

      if (checkData.duplicateFound) {
        setDuplicateData({
          id: checkData.duplicateId,
          distanceMeters: checkData.distanceMeters,
        });
        setStep("duplicate_warning");
        setLoading(false);
        return;
      }

      // No duplicate, submit directly
      await finalizeSubmit();
    } catch (e: any) {
      console.error("Submit error:", e);
      setErrorMsg("Failed to submit report. Please check connection.");
      setLoading(false);
    }
  };

  // Submit report to DB
  const finalizeSubmit = async () => {
    setLoading(true);

    // If client is offline, save directly to offline queue
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      if (photoPreview) {
        saveReportOffline({
          photoDataUrl: photoPreview,
          photoName: photoFileObj?.name || "offline_hazard.jpg",
          type: problemType,
          severity,
          complaintText,
          lat: location?.lat || 34.0151,
          lng: location?.lng || 71.5249,
        });
        setStep("success_offline");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoFile: photoFilename || "kohati_water.jpg",
          type: problemType,
          severity,
          complaintText,
          lat: location?.lat || 34.0151,
          lng: location?.lng || 71.5249,
          aiConfidence: confidence,
        }),
      });

      if (!res.ok) throw new Error("Failed to save report");

      const data = await res.json();
      setStep("success");
      onReportCreated(data.report);
    } catch (e: any) {
      // Fallback: If network failed, save offline
      if (photoPreview) {
        saveReportOffline({
          photoDataUrl: photoPreview,
          photoName: photoFileObj?.name || "offline_hazard.jpg",
          type: problemType,
          severity,
          complaintText,
          lat: location?.lat || 34.0151,
          lng: location?.lng || 71.5249,
        });
        setStep("success_offline");
        return;
      }
      setErrorMsg("Error saving report.");
    } finally {
      setLoading(false);
    }
  };

  // Confirm existing duplicate instead of creating a new one
  const handleConfirmDuplicate = async () => {
    if (!duplicateData) return;
    setLoading(true);
    try {
      await fetch(`/api/reports/${duplicateData.id}/confirm`, {
        method: "POST",
      });
      setStep("success");
    } catch (e) {
      setErrorMsg("Error confirming duplicate.");
    } finally {
      setLoading(false);
    }
  };

  const problemTypesList = [
    { id: "blocked_drain", label: t.types.blocked_drain },
    { id: "standing_water", label: t.types.standing_water },
    { id: "open_manhole", label: t.types.open_manhole },
    { id: "garbage_in_drain", label: t.types.garbage_in_drain },
    { id: "other", label: t.types.other },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-[24px] sm:rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-[#C9D4DA] flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-[#C9D4DA]/60 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-heading text-lg font-bold text-[#12263A]">
              {step === "photo" && t.reportProblem}
              {step === "analyzing" && "Analyzing Drain Issue"}
              {step === "review" && "Review Report & Location"}
              {step === "invalid_image" && (language === "ur" || language === "ps" ? "غلط تصویر مسترد" : "Wrong Image Detected")}
              {step === "duplicate_warning" && t.duplicateTitle}
              {step === "success" && "Report Submitted"}
            </h3>
            <span className="text-xs text-[#4B6073]">
              {step === "photo" && t.photoStepSubtitle}
              {step === "invalid_image" && (language === "ur" || language === "ps" ? "برائے مہربانی صرف پانی یا نالے کی تصویر اپ لوڈ کریں" : "Only standing water and urban drainage problems can be reported")}
              {step === "review" && "Check details and location before sending to WSSP"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EAF0F2] hover:bg-[#C9D4DA] flex items-center justify-center text-[#12263A] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* -------------------------------------------------------------
              STEP 1: PHOTO CAPTURE & LOCATION / GEMINI KEY OPTIONS
             ------------------------------------------------------------- */}
          {step === "photo" && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#0E6B73]/40 hover:border-[#0E6B73] bg-[#EAF0F2]/50 hover:bg-[#EAF0F2] rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-16 h-16 rounded-full bg-[#0E6B73]/10 group-hover:bg-[#0E6B73]/20 flex items-center justify-center text-[#0E6B73] transition-transform group-hover:scale-105">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-heading text-base font-bold text-[#12263A]">
                    {t.takePhoto}
                  </h4>
                  <p className="text-xs text-[#4B6073] mt-0.5">
                    Snap the flooded road, open manhole or blocked drain
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-[#0E6B73] bg-white px-3 py-1 rounded-full shadow-xs border border-[#C9D4DA]">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tap to snap photo or select file</span>
                </div>
              </div>

              {/* Free Location Status Banner */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-[#C9D4DA]/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-extrabold uppercase text-[#4B6073] tracking-wider flex items-center gap-1.5">
                      <span>Detected Location</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/15 text-emerald-700 rounded font-bold">
                        100% Free
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#12263A] truncate mt-0.5">
                      {isGeocodingLoading ? "Detecting..." : locationAddress}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={autoDetectLocation}
                  disabled={isGeocodingLoading}
                  className="px-2.5 py-1.5 rounded-lg border border-[#C9D4DA] bg-white hover:bg-slate-50 text-[11px] font-bold text-[#0E6B73] shrink-0 transition flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Re-check</span>
                </button>
              </div>

              {/* Free Gemini API Key Optional Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowKeySettings(!showKeySettings)}
                  className="text-[11px] text-[#0E6B73] font-bold hover:underline flex items-center gap-1"
                >
                  <Key className="w-3 h-3" />
                  <span>
                    {geminiApiKey ? "✓ Free Gemini API Key Saved (Click to edit)" : "⚡ Use Free Gemini Vision Key (Optional)"}
                  </span>
                </button>

                {showKeySettings && (
                  <div className="mt-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
                    <p className="text-[#12263A] leading-relaxed">
                      Google provides <strong>free Gemini API keys</strong> with 15 requests/minute at{" "}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0E6B73] font-bold underline"
                      >
                        aistudio.google.com
                      </a>
                      . Paste it here to enable full vision analysis:
                    </p>
                    <input
                      type="password"
                      value={geminiApiKey}
                      onChange={(e) => handleSaveGeminiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white font-mono"
                    />
                    <div className="text-[10px] text-[#4B6073]">
                      Key is saved safely in your local browser storage. If left blank, Naali Watch uses automatic heuristic classification and free OpenStreetMap reverse geocoding.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              STEP 2: ANALYZING SPINNER
             ------------------------------------------------------------- */}
          {step === "analyzing" && (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#0E6B73] border-t-transparent rounded-full animate-spin" />
                <Sparkles className="w-6 h-6 text-amber-500 absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading text-base font-bold text-[#12263A]">
                  AI Vision Tagging & Location
                </h4>
                <p className="text-xs text-[#4B6073] max-w-xs">
                  Estimating water depth, blockage severity, and street location for Peshawar WSSP...
                </p>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              STEP 3: REVIEW DETAILS & FULL LOCATION PICKER / SEARCH
             ------------------------------------------------------------- */}
          {step === "review" && (
            <div className="space-y-4">
              {/* Photo Preview & AI Badge */}
              {photoPreview && (
                <div className="relative rounded-xl overflow-hidden border border-[#C9D4DA] max-h-48 bg-slate-900 flex items-center justify-center">
                  <img
                    src={photoPreview}
                    alt="Captured drain problem"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-[#12263A]/90 text-white text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-xs">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>AI Confidence: {Math.round(confidence * 100)}%</span>
                  </div>
                </div>
              )}

              {/* =========================================================
                  LOCATION SELECTION & FREE GEOCODING SEARCH
                 ========================================================= */}
              <div className="p-3.5 bg-slate-50 border border-[#C9D4DA] rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#12263A] uppercase tracking-wide">
                    <MapPin className="w-3.5 h-3.5 text-[#0E6B73]" />
                    <span>Problem Location (Peshawar)</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {locationSource === "gps"
                      ? "📍 GPS Active"
                      : locationSource === "ip"
                      ? "🌐 Free IP Location"
                      : locationSource === "search"
                      ? "🔍 Searched"
                      : "🗺️ Map Point"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-[#12263A] bg-white p-2.5 rounded-xl border border-[#C9D4DA]">
                  <div className="truncate pr-2">
                    {isGeocodingLoading ? "Resolving address..." : locationAddress}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRequestPickLocation();
                    }}
                    className="text-[11px] font-bold text-[#0E6B73] hover:underline shrink-0"
                  >
                    Tap on Map →
                  </button>
                </div>

                {/* Free Search Input via OpenStreetMap Nominatim */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchLocationQuery}
                    onChange={(e) => handleSearchLocation(e.target.value)}
                    placeholder="Search street, colony, or bazaar in Peshawar..."
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-[#C9D4DA] bg-white text-[#12263A] focus:outline-none focus:ring-2 focus:ring-[#0E6B73]"
                  />
                  {isSearchingLocation && (
                    <RefreshCw className="w-3 h-3 text-[#0E6B73] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  )}

                  {/* Autocomplete Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#C9D4DA] rounded-xl shadow-xl z-30 max-h-40 overflow-y-auto divide-y divide-gray-100">
                      {searchResults.map((r, i) => (
                        <div
                          key={i}
                          onClick={() => selectSearchResult(r)}
                          className="p-2.5 text-xs text-[#12263A] hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                        >
                          <span className="truncate pr-2">{r.displayName}</span>
                          <span className="text-[10px] text-[#0E6B73] font-bold shrink-0">Select</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Peshawar Area Chips */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#4B6073] font-bold uppercase tracking-wider block">
                    Quick Area Selector:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {PESHAWAR_QUICK_AREAS.map((a) => (
                      <button
                        key={a.name}
                        type="button"
                        onClick={() => selectQuickArea(a)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                          locationAddress.includes(a.name)
                            ? "bg-[#0E6B73] text-white border-[#0E6B73]"
                            : "bg-white text-[#4B6073] border-[#C9D4DA] hover:border-[#0E6B73]"
                        }`}
                      >
                        {a.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Severity Gauge Selector (Ankle, Knee, Danger) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#12263A] uppercase tracking-wide">
                  Water Severity (Gauge Level)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["ankle", "knee", "danger"] as SeverityType[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverity(s)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                        severity === s
                          ? "border-[#0E6B73] bg-[#0E6B73]/10 ring-2 ring-[#0E6B73]/30"
                          : "border-[#C9D4DA] bg-white hover:bg-[#EAF0F2]/50"
                      }`}
                    >
                      <DropletPin severity={s} size={28} />
                      <span className="text-xs font-semibold text-[#12263A] mt-1 capitalize">
                        {t.severities[s]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Problem Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#12263A] uppercase tracking-wide">
                  Problem Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {problemTypesList.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setProblemType(item.id as any)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        problemType === item.id
                          ? "bg-[#0E6B73] text-white"
                          : "bg-[#EAF0F2] text-[#12263A] hover:bg-[#C9D4DA]/50"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Complaint Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#12263A] uppercase tracking-wide">
                  Official WSSP Complaint Text
                </label>
                <textarea
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-[#C9D4DA] focus:outline-none focus:ring-2 focus:ring-[#0E6B73] text-[#12263A] bg-white"
                  placeholder="Describe the blocked drain or flooded street..."
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep("photo")}
                  className="px-4 py-3 rounded-xl border border-[#C9D4DA] text-xs font-semibold text-[#4B6073] hover:bg-[#EAF0F2]"
                >
                  Retake Photo
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmitCheck}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#0E6B73] hover:bg-[#0a545a] text-white text-sm font-bold shadow-md transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span className="text-white">{t.sendReport}</span>
                      <ChevronRight className="w-4 h-4 text-white" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              STEP: INVALID IMAGE REJECTED (NON-WATER PHOTO)
             ------------------------------------------------------------- */}
          {step === "invalid_image" && (
            <div className="space-y-4 py-2">
              <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-300 space-y-3 text-center">
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <AlertOctagon className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h4 className="font-heading text-lg font-bold text-red-900">
                    {language === "ur" || language === "ps"
                      ? "غلط تصویر! برائے مہربانی کھڑے پانی کی تصویر اپ لوڈ کریں"
                      : "Wrong Image! Please Upload a Water Image"}
                  </h4>
                  <p className="text-xs text-red-700 leading-relaxed font-medium max-w-sm mx-auto">
                    {language === "ur" || language === "ps"
                      ? (invalidImageDetails?.reasonUr || "تصویر میں کھڑا پانی یا نکاسی آب کا کوئی مسئلہ نظر نہیں آیا۔")
                      : (invalidImageDetails?.reason || "No standing water, flooded streets, or blocked drains were detected.")}
                  </p>
                </div>

                {/* AI Classification breakdown badge */}
                <div className="bg-white/90 p-3.5 rounded-xl border border-red-200 text-xs text-[#12263A] text-left space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B6073]">
                      AI Classification:
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-bold">
                      Not a Drainage Hazard
                    </span>
                  </div>
                  <p className="font-semibold text-xs text-[#12263A]">
                    Detected: <span className="text-red-700 font-bold">{invalidImageDetails?.detectedContent || "Non-water content"}</span>
                  </p>
                  <p className="text-[11px] text-[#4B6073] leading-relaxed">
                    Required: Photos must clearly show pooled/standing wastewater, flooded roads, blocked drains (naalis), or open manholes needing municipal drainage.
                  </p>
                </div>

                {/* Thumbnail of rejected photo */}
                {photoPreview && (
                  <div className="relative w-36 h-28 mx-auto rounded-xl overflow-hidden border-2 border-red-400 shadow-sm group">
                    <img
                      src={photoPreview}
                      alt="Rejected non-water upload"
                      className="w-full h-full object-cover grayscale opacity-75"
                    />
                    <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center">
                      <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
                        Rejected
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep("photo");
                    setTimeout(() => fileInputRef.current?.click(), 150);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#0E6B73] hover:bg-[#0a545a] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <span>
                    {language === "ur" || language === "ps"
                      ? "نئی تصویر اپ لوڈ کریں (پانی / نالہ)"
                      : "Take / Upload Valid Water Photo"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep("photo")}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#C9D4DA] text-xs font-bold text-[#4B6073] hover:bg-[#EAF0F2] transition text-center"
                >
                  Choose Different Photo
                </button>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              STEP 4: DUPLICATE CHECK PROMPT (<30m) (PRD SECTION 6 F7)
             ------------------------------------------------------------- */}
          {step === "duplicate_warning" && duplicateData && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-2 text-center">
                <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
                <h4 className="font-heading text-base font-bold text-amber-900">
                  {t.duplicateTitle}
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Another citizen already reported this issue just{" "}
                  <strong>{duplicateData.distanceMeters}m away</strong>. Confirming it adds your vote and increases WSSP priority without creating a duplicate!
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirmDuplicate}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#0E6B73] hover:bg-[#0a545a] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-white" />
                      <span className="text-white">{t.confirmDuplicateBtn}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={finalizeSubmit}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#C9D4DA] text-xs font-bold text-[#4B6073] hover:bg-[#EAF0F2] transition text-center"
                >
                  {t.submitAnywayBtn}
                </button>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              STEP 5: SUCCESS CONFIRMATION
             ------------------------------------------------------------- */}
          {step === "success" && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-[#2E7D4F] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading text-lg font-bold text-[#12263A]">
                  {t.reportSentToast}
                </h4>
                <p className="text-xs text-[#4B6073] max-w-sm mx-auto leading-relaxed">
                  Your report has been logged and queued for WSSP Peshawar desiltation response. Nearby citizens can now confirm the issue.
                </p>
              </div>
              <div className="p-3 bg-[#EAF0F2] rounded-xl text-xs text-[#12263A] max-w-sm mx-auto">
                📍 <strong>{locationAddress}</strong>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#0E6B73] text-white text-xs font-bold shadow-md hover:bg-[#0a545a] transition"
                >
                  Return to Live Map
                </button>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              STEP 6: OFFLINE SAVED CONFIRMATION
             ------------------------------------------------------------- */}
          {step === "success_offline" && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
                <WifiOff className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading text-lg font-bold text-[#12263A]">
                  Report Saved to Device (Offline Mode)
                </h4>
                <p className="text-xs text-[#4B6073] max-w-sm mx-auto leading-relaxed">
                  No internet connection was detected. Your photo, location, and hazard details are safely saved on your device and will automatically dispatch to WSSP as soon as your phone reconnects to 4G or Wi-Fi.
                </p>
              </div>
              <div className="p-3 bg-[#EAF0F2] rounded-xl text-xs text-[#12263A] max-w-sm mx-auto">
                📍 <strong>{locationAddress}</strong>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#0E6B73] text-white text-xs font-bold shadow-md hover:bg-[#0a545a] transition"
                >
                  Return to Live Map
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
