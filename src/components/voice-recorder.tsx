"use client";

import React, { useState, useRef } from "react";
import { Mic, Square, Loader2, Volume2, Sparkles, CheckCircle } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

interface VoiceRecorderProps {
  onVoiceExtracted: (data: {
    transcript: string;
    complaintText: string;
    detectedArea?: string | null;
    detectedType?: "blocked_drain" | "standing_water" | "open_manhole" | "garbage_in_drain" | "other";
    detectedSeverity?: "ankle" | "knee" | "danger";
  }) => void;
  customKey?: string;
}

export function VoiceRecorder({ onVoiceExtracted, customKey }: VoiceRecorderProps) {
  const { language } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      setStatusMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        await processAudio(audioBlob);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds((sec) => sec + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setStatusMessage("Microphone permission denied or not supported on this browser.");
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    setStatusMessage("Transcribing Urdu/Pashto with Gemini AI...");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        const res = await fetch("/api/voice-transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: blob.type,
            customKey,
          }),
        });

        if (!res.ok) throw new Error("Transcription failed");

        const data = await res.json();
        onVoiceExtracted(data);
        setStatusMessage(
          language === "ur" || language === "ps"
            ? "✓ آواز کامیابی سے شامل ہو گئی!"
            : "✓ Voice note transcribed & applied!"
        );
        setTimeout(() => setStatusMessage(null), 4000);
      };
    } catch (err: any) {
      console.error(err);
      setStatusMessage("Failed to analyze voice note. You can still type details.");
    } finally {
      setIsProcessing(false);
    }
  };

  const buttonLabel =
    language === "ur"
      ? "اردو یا پشتو میں بول کر بتائیں"
      : language === "ps"
      ? "په پښتو یا اردو کښې ووایاست"
      : "Record Voice Note (Urdu / Pashto)";

  return (
    <div className="space-y-2">
      {!isRecording && !isProcessing && (
        <button
          type="button"
          onClick={startRecording}
          className="w-full py-2.5 px-3.5 rounded-xl border border-[#0E6B73]/30 bg-[#0E6B73]/5 hover:bg-[#0E6B73]/10 text-[#0E6B73] font-bold text-xs transition flex items-center justify-center gap-2 group shadow-2xs"
        >
          <div className="w-6 h-6 rounded-full bg-[#0E6B73] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
            <Mic className="w-3.5 h-3.5" />
          </div>
          <span>{buttonLabel}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0E6B73]/10 font-extrabold uppercase">
            AI Voice
          </span>
        </button>
      )}

      {isRecording && (
        <div className="p-3 bg-red-50 border-2 border-red-300 rounded-2xl flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2 text-xs font-bold text-red-700">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-ping shrink-0" />
            <span>
              Listening... 0:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds} (Urdu / Pashto)
            </span>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Square className="w-3.5 h-3.5 fill-white" />
            <span>Done</span>
          </button>
        </div>
      )}

      {isProcessing && (
        <div className="p-3 bg-[#EAF0F2] border border-[#0E6B73]/30 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-[#0E6B73]">
          <Loader2 className="w-4 h-4 animate-spin text-[#0E6B73]" />
          <span>Analyzing spoken Urdu/Pashto with Gemini...</span>
        </div>
      )}

      {statusMessage && !isProcessing && !isRecording && (
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
