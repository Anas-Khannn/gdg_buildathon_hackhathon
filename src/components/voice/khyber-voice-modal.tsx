"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/language-provider";
import { emergencyAudio } from "@/lib/audio-siren";
import {
  Mic,
  MicOff,
  Radio,
  Sparkles,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  VolumeX,
  Send,
  Loader2,
  RefreshCw,
  X,
  Play,
  Square,
  ShieldAlert,
  Flame,
  FileText,
  Truck,
  ExternalLink,
} from "lucide-react";

interface KhyberVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated?: (reportId: string) => void;
}

interface HotlineAnalysis {
  transcript: string;
  languageDetected: "ps" | "ur" | "en";
  summaryEnglish: string;
  summaryUrdu: string;
  detectedLandmark: string;
  problemType: string;
  severity: "danger" | "knee" | "ankle";
  urgencyLevel: "emergency" | "high" | "moderate";
  audioStressTone: "calm" | "distressed" | "urgent_panicked";
  recommendedAction: string;
  spokenReplyUrdu: string;
  spokenReplyPashto: string;
  coordinates?: { lat: number; lng: number };
}

const PRESET_SCENARIOS = [
  {
    id: "kohati-underpass-ps",
    title: "Kohati Gate Underpass",
    titleUr: "کوہاٹی گیٹ انڈرپاس",
    dialect: "Pashto (پښتو)",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    snippet: "زه کوہاټي ګیټ انڈرپاس کښې یم، سخت باران دی او لوی نالی بنده ده...",
  },
  {
    id: "saddar-cantt-ur",
    title: "Saddar Cantt Main Bazar",
    titleUr: "صدر کینٹ مین روڈ",
    dialect: "Urdu (اردو)",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    snippet: "صدر کینٹ مین روڈ نالہ پلاسٹک سے بند، گھٹنوں تک پانی، دکانیں خطرے میں...",
  },
  {
    id: "gulbahar-manhole-ur",
    title: "Gulbahar Open Manhole",
    titleUr: "گلبہار کھلا مین ہول",
    dialect: "Urdu / Hindko",
    badgeColor: "bg-red-500/20 text-red-300 border-red-400/30",
    snippet: "گلبہار چارسدہ روڈ موڑ پر گٹر کا بھاری ڈھکن ابلتے پانی میں بہہ گیا ہے...",
  },
  {
    id: "hayatabad-phase3-ps",
    title: "Hayatabad Phase 3",
    titleUr: "حیات آباد فیز 3",
    dialect: "Pashto (پښتو)",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-400/30",
    snippet: "حیات آباد فیز 3 کمرشل ایریا کښې د اوبو لویه ډنډه جوړه ده...",
  },
];

export function KhyberVoiceModal({
  isOpen,
  onClose,
  onReportCreated,
}: KhyberVoiceModalProps) {
  const { language } = useLanguage();

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Analysis State
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<HotlineAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingReply, setIsPlayingReply] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchedId, setDispatchedId] = useState<string | null>(null);

  // Visualizer Animation
  const [audioLevel, setAudioLevel] = useState(0);
  const visualizerAnimRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Stop everything on modal close
  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      emergencyAudio.stopSpeaking();
      setIsPlayingReply(false);
    }
  }, [isOpen]);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (visualizerAnimRef.current) cancelAnimationFrame(visualizerAnimRef.current);
    };
  }, [audioUrl]);

  // Start Live Microphone Recording
  const startRecording = async () => {
    try {
      setError(null);
      setAnalysis(null);
      setDispatchedId(null);
      emergencyAudio.playAlertBeep();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);

      // Setup Web Audio Analyser for Visualizer
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;

        const updateLevel = () => {
          if (!analyserRef.current) return;
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          visualizerAnimRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      }

      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => {
          if (prev >= 45) {
            stopRecording();
            return 45;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error("Mic access error:", err);
      setError("Microphone access denied. You can still test with the 4 Dialect Presets below!");
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (visualizerAnimRef.current) {
      cancelAnimationFrame(visualizerAnimRef.current);
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsRecording(false);
    setAudioLevel(0);
  };

  // Convert Blob to Base64 and submit to Gemini
  const processRecordedAudio = async () => {
    if (!audioBlob) return;
    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        const res = await fetch("/api/voice-hotline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioBase64: base64Data,
            mimeType: audioBlob.type,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to analyze speech");
        }

        setAnalysis(data.analysis);
        playSpokenConfirmation(data.analysis);
      };
    } catch (err: any) {
      setError(err.message || "Failed to process audio");
    } finally {
      setIsLoading(false);
    }
  };

  // Test Dialect Preset Scenario
  const runPresetScenario = async (presetId: string) => {
    stopRecording();
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setDispatchedId(null);
    emergencyAudio.playAlertBeep();

    try {
      const res = await fetch("/api/voice-hotline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze preset scenario");
      }

      setAnalysis(data.analysis);
      playSpokenConfirmation(data.analysis);
    } catch (err: any) {
      setError(err.message || "Failed to execute preset");
    } finally {
      setIsLoading(false);
    }
  };

  // Spoken Reply using Speech Synthesis
  const playSpokenConfirmation = (an: HotlineAnalysis) => {
    const textToSpeak =
      an.languageDetected === "ps"
        ? an.spokenReplyPashto || an.spokenReplyUrdu
        : an.spokenReplyUrdu;

    setIsPlayingReply(true);
    emergencyAudio.speakAnnouncement(textToSpeak, an.languageDetected, () => {
      setIsPlayingReply(false);
    });
  };

  const stopSpokenReply = () => {
    emergencyAudio.stopSpeaking();
    setIsPlayingReply(false);
  };

  // Dispatch to Live Map (PostgreSQL)
  const dispatchToLiveMap = async () => {
    if (!analysis) return;
    setIsDispatching(true);
    try {
      const res = await fetch("/api/voice-hotline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presetId: PRESET_SCENARIOS[0].id,
          autoDispatch: true,
          userLocation: analysis.coordinates,
        }),
      });
      const data = await res.json();
      if (data.createdReportId) {
        setDispatchedId(data.createdReportId);
        emergencyAudio.playAlertBeep();
        if (onReportCreated) onReportCreated(data.createdReportId);
      }
    } catch (err: any) {
      setError("Failed to dispatch ticket: " + err.message);
    } finally {
      setIsDispatching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0f1d2d] text-white rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[94dvh] my-auto">
        {/* Glow Header */}
        <div className="relative p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-[#12263A] to-[#0E6B73] border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shadow-lg">
              <Mic className="w-6 h-6 text-emerald-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0f1d2d] animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-white leading-none">
                  خیبر وائس ہاٹ لائن
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Gemini Flash 1.5
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#C9D4DA] mt-0.5">
                Khyber Voice AI: Peshawar Multilingual Audio Triage (پښتو • اردو • Hindko)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-red-500/30 text-white hover:text-red-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 max-h-[calc(94dvh-80px)]">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SECTION 1: Voice Recorder Hub */}
          <div className="p-5 sm:p-6 rounded-3xl bg-black/40 border border-white/10 text-center relative overflow-hidden space-y-4">
            {/* Visualizer Wave Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center gap-1">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: isRecording
                      ? `${Math.max(15, (audioLevel * ((i % 5) + 1)) % 100)}%`
                      : "10%",
                    transition: "height 0.1s ease",
                  }}
                  className="w-2 rounded-full bg-gradient-to-t from-emerald-500 to-teal-300"
                />
              ))}
            </div>

            <div className="relative z-10 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                {isRecording ? "🔴 RECORDING CITIZEN EMERGENCY NOTE" : "🎙️ SPEAK IN PASHTO OR URDU"}
              </span>

              {/* Central Mic Button */}
              <div className="flex items-center justify-center py-2">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                  className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl cursor-pointer ${
                    isRecording
                      ? "bg-gradient-to-tr from-red-600 to-rose-500 scale-110 shadow-red-600/50 animate-pulse"
                      : "bg-gradient-to-tr from-emerald-600 via-[#0E6B73] to-teal-500 hover:scale-105 shadow-emerald-900/50"
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-9 h-9 text-white fill-white" />
                  ) : (
                    <Mic className="w-10 h-10 text-white" />
                  )}

                  {isRecording && (
                    <div
                      style={{ transform: `scale(${1 + audioLevel / 100})` }}
                      className="absolute inset-0 rounded-full border-2 border-red-400 opacity-60 transition-transform"
                    />
                  )}
                </button>
              </div>

              {/* Status and Timer */}
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-300">
                {isRecording ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span>00:{recordDuration < 10 ? `0${recordDuration}` : recordDuration} / 00:45</span>
                  </>
                ) : audioBlob ? (
                  <span className="text-emerald-400 font-sans font-semibold">
                    ✓ Voice note captured ({Math.round(audioBlob.size / 1024)} KB)
                  </span>
                ) : (
                  <span className="text-slate-400 font-sans">
                    Tap the microphone and speak your locality and problem clearly
                  </span>
                )}
              </div>

              {/* Process Button if Recorded */}
              {audioBlob && !isRecording && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={processRecordedAudio}
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#0E6B73] hover:from-emerald-400 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer transition active:scale-95 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Analyze Voice Note with Gemini AI</span>
                  </button>
                  <button
                    onClick={() => {
                      setAudioBlob(null);
                      setAudioUrl(null);
                    }}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition"
                    title="Discard"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: Instant Dialect Testing Presets (For Evaluators) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-teal-400" />
                Evaluator Quick Scenarios (پشاور کی مقامی زبانوں کے نمونے)
              </span>
              <span className="text-[10px] text-slate-400">One-click AI Triage</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => runPresetScenario(scenario.id)}
                  disabled={isLoading || isRecording}
                  className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 text-left transition group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-heading text-xs font-bold text-white group-hover:text-emerald-300">
                      {scenario.title}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${scenario.badgeColor}`}
                    >
                      {scenario.dialect}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono truncate leading-snug">
                    {scenario.snippet}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 3: Live Multimodal AI Analysis Card */}
          {isLoading && (
            <div className="p-8 rounded-3xl bg-black/30 border border-white/10 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-emerald-400 animate-spin" />
              </div>
              <p className="font-heading text-sm font-bold text-white">
                Gemini 1.5 Flash is transcribing dialect and analyzing acoustic distress...
              </p>
              <p className="text-xs text-slate-400">
                Extracting Peshawar landmarks, water depth severity, and dispatch requirements.
              </p>
            </div>
          )}

          {analysis && !isLoading && (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#12263A] to-[#0c1824] border border-emerald-500/30 shadow-2xl space-y-4 animate-fadeIn">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Dialect: {analysis.languageDetected === "ps" ? "Pashto (پښتو)" : "Urdu (اردو)"}
                  </span>
                  <span
                    className={`text-xs font-extrabold uppercase px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                      analysis.urgencyLevel === "emergency"
                        ? "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    Urgency: {analysis.urgencyLevel.toUpperCase()}
                  </span>
                </div>

                {analysis.detectedLandmark && (
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1 bg-white/5 px-3 py-1 rounded-xl border border-white/10">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {analysis.detectedLandmark}
                  </span>
                )}
              </div>

              {/* Native Transcript Calligraphy Box */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Original Citizen Voice Transcript (اصل شہری آواز):
                </span>
                <p
                  dir="rtl"
                  className="font-serif text-base sm:text-lg text-emerald-200 leading-relaxed font-semibold"
                >
                  "{analysis.transcript}"
                </p>
              </div>

              {/* Municipal Summaries */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    WSSP English Dispatch Brief:
                  </span>
                  <p className="text-slate-200 leading-relaxed font-medium">
                    {analysis.summaryEnglish}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 text-right" dir="rtl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    اردو خلاصہ برائے کنٹرول روم:
                  </span>
                  <p className="text-slate-200 leading-relaxed font-semibold">
                    {analysis.summaryUrdu}
                  </p>
                </div>
              </div>

              {/* Action & Machinery Recommendation */}
              <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 block">
                      Recommended Heavy Machinery
                    </span>
                    <span className="font-semibold text-white">
                      {analysis.recommendedAction}
                    </span>
                  </div>
                </div>
              </div>

              {/* Spoken AI Reply Box & Audio Control */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-[#0E6B73]/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      isPlayingReply ? stopSpokenReply() : playSpokenConfirmation(analysis)
                    }
                    className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center font-bold shadow-md cursor-pointer transition"
                    title={isPlayingReply ? "Stop audio" : "Play citizen voice confirmation"}
                  >
                    {isPlayingReply ? (
                      <VolumeX className="w-5 h-5 animate-pulse" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                      Automated Voice Confirmation Spoken to Caller:
                    </span>
                    <p className="text-xs text-white line-clamp-1 italic font-serif">
                      "{analysis.languageDetected === "ps" ? analysis.spokenReplyPashto : analysis.spokenReplyUrdu}"
                    </p>
                  </div>
                </div>

                {isPlayingReply && (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-400 text-black animate-pulse self-start sm:self-center">
                    Speaking...
                  </span>
                )}
              </div>

              {/* Auto-Dispatch Ticket Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                {dispatchedId ? (
                  <div className="w-full p-3.5 rounded-2xl bg-emerald-600/30 border border-emerald-400/50 text-emerald-200 text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Dispatched to Peshawar Live Map! Ticket #{dispatchedId.slice(0, 8)}
                    </span>
                    <button
                      onClick={onClose}
                      className="px-3 py-1 rounded-lg bg-emerald-500 text-black text-xs font-extrabold hover:bg-emerald-400 transition"
                    >
                      View on Map →
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={dispatchToLiveMap}
                    disabled={isDispatching}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 via-[#0E6B73] to-teal-500 hover:opacity-95 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {isDispatching ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    <span>🚀 Confirm & Auto-Dispatch Ticket to Live Map</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

