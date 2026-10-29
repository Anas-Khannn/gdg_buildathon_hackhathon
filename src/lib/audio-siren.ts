"use client";

// Web Audio API emergency warning siren generator and Text-to-Speech manager
class EmergencyAudioEngine {
  private audioCtx: AudioContext | null = null;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private isSirenRunning: boolean = false;
  private sirenInterval: any = null;

  private initContext() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  // Play a brief dual-tone municipal warning chime
  public playAlertBeep() {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      // Hi-lo emergency dispatch chime (880Hz -> 660Hz)
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(660, now + 0.15);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Audio fallback
    }
  }

  // Start continuous emergency siren loop (sweep between 580Hz and 920Hz)
  public startSiren() {
    if (this.isSirenRunning) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      this.sirenOsc = this.audioCtx.createOscillator();
      this.sirenGain = this.audioCtx.createGain();

      this.sirenOsc.type = "sawtooth";
      this.sirenOsc.connect(this.sirenGain);
      this.sirenGain.connect(this.audioCtx.destination);

      this.sirenGain.gain.setValueAtTime(0.12, now);

      let high = false;
      this.sirenOsc.frequency.setValueAtTime(620, now);

      this.sirenOsc.start(now);
      this.isSirenRunning = true;

      this.sirenInterval = setInterval(() => {
        if (!this.audioCtx || !this.sirenOsc) return;
        const t = this.audioCtx.currentTime;
        high = !high;
        this.sirenOsc.frequency.exponentialRampToValueAtTime(
          high ? 920 : 580,
          t + 0.6
        );
      }, 700);
    } catch {
      this.isSirenRunning = false;
    }
  }

  // Stop siren
  public stopSiren() {
    if (!this.isSirenRunning) return;
    try {
      if (this.sirenInterval) {
        clearInterval(this.sirenInterval);
        this.sirenInterval = null;
      }
      if (this.sirenOsc && this.audioCtx) {
        const now = this.audioCtx.currentTime;
        this.sirenGain?.gain.linearRampToValueAtTime(0.0001, now + 0.2);
        this.sirenOsc.stop(now + 0.25);
        this.sirenOsc.disconnect();
      }
    } catch {
      // Fallback
    } finally {
      this.sirenOsc = null;
      this.sirenGain = null;
      this.isSirenRunning = false;
    }
  }

  // Speak announcement in Urdu or Pashto
  public speakAnnouncement(
    text: string,
    lang: "ur" | "ps" | "en" = "ur",
    onEnd?: () => void
  ): boolean {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return false;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower for clear municipal loudspeaker effect
      utterance.pitch = 1.05;

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices();
      let matchedVoice = null;

      if (lang === "ur" || lang === "ps") {
        matchedVoice =
          voices.find((v) => v.lang.startsWith("ur") || v.lang.includes("PK")) ||
          voices.find((v) => v.lang.startsWith("ar") || v.lang.startsWith("hi")) ||
          null;
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      } else {
        utterance.lang = lang === "en" ? "en-US" : "ur-PK";
      }

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      console.warn("Speech synthesis error:", err);
      if (onEnd) onEnd();
      return false;
    }
  }

  public stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.stopSiren();
  }

  public isSirenActive(): boolean {
    return this.isSirenRunning;
  }
}

export const emergencyAudio = new EmergencyAudioEngine();

