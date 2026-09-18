import React, { useState, useRef } from "react";
import {
  Sparkles,
  Search,
  ShieldCheck,
  Zap,
  Mic,
  MapPin,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Camera,
  Video,
  X,
  Play,
  Film,
  Image as ImageIcon,
} from "lucide-react";
import { UNIVERSAL_PROMPTS } from "../data/mockScenarios";
import { UniversalPromptPreset, AttachedMedia } from "../types";
import { VoiceRequestRecorder } from "./VoiceRequestRecorder";
import { MediaAttachmentModal } from "./MediaAttachmentUploader";

interface SuperAppUniversalHeroProps {
  onFulfillRequest: (prompt: string, location: string, clientName: string, media?: AttachedMedia) => Promise<void>;
  isLoading: boolean;
  activePrompt: string;
  setActivePrompt: (text: string) => void;
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  clientName: string;
  setClientName: (name: string) => void;
}

export const SuperAppUniversalHero: React.FC<SuperAppUniversalHeroProps> = ({
  onFulfillRequest,
  isLoading,
  activePrompt,
  setActivePrompt,
  selectedLocation,
  setSelectedLocation,
  clientName,
  setClientName,
}) => {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [attachedMedia, setAttachedMedia] = useState<AttachedMedia | null>(null);
  const [isInlineListening, setIsInlineListening] = useState(false);
  const [voiceVolumeLevel, setVoiceVolumeLevel] = useState(0);

  const inlineRecognitionRef = useRef<any>(null);
  const inlineAudioContextRef = useRef<AudioContext | null>(null);
  const inlineStreamRef = useRef<MediaStream | null>(null);
  const inlineAnimFrameRef = useRef<number | null>(null);

  const triggerHapticFeedback = (pattern: number | number[] = 50) => {
    try {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore unsupported
    }
  };

  const stopInlineListening = () => {
    setIsInlineListening(false);
    triggerHapticFeedback(60);

    if (inlineRecognitionRef.current) {
      try {
        inlineRecognitionRef.current.stop();
      } catch {
        // Ignore
      }
      inlineRecognitionRef.current = null;
    }

    if (inlineStreamRef.current) {
      inlineStreamRef.current.getTracks().forEach((t) => t.stop());
      inlineStreamRef.current = null;
    }

    if (inlineAudioContextRef.current) {
      inlineAudioContextRef.current.close().catch(() => {});
      inlineAudioContextRef.current = null;
    }

    if (inlineAnimFrameRef.current) {
      cancelAnimationFrame(inlineAnimFrameRef.current);
      inlineAnimFrameRef.current = null;
    }
    setVoiceVolumeLevel(0);
  };

  const startInlineListening = async () => {
    stopInlineListening();
    triggerHapticFeedback([40, 60, 40]);

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        inlineStreamRef.current = stream;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          inlineAudioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 128;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const trackVolume = () => {
            if (!inlineStreamRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setVoiceVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
            inlineAnimFrameRef.current = requestAnimationFrame(trackVolume);
          };
          trackVolume();
        }
      }
    } catch (e) {
      console.warn("Microphone access notice:", e);
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-UG"; // Supports Ugandan English & East African accents
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        let accumulatedTranscript = activePrompt ? activePrompt.trim() + " " : "";

        recognition.onstart = () => {
          setIsInlineListening(true);
        };

        recognition.onresult = (event: any) => {
          let interim = "";
          let finalSpoken = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalSpoken += transcript;
            } else {
              interim += transcript;
            }
          }

          if (finalSpoken) {
            triggerHapticFeedback(30);
            accumulatedTranscript += finalSpoken.trim() + " ";
            setActivePrompt(accumulatedTranscript.trim());
          } else if (interim) {
            triggerHapticFeedback(10);
            setActivePrompt((accumulatedTranscript + interim).trim());
          }
        };

        recognition.onerror = (err: any) => {
          console.warn("Web Speech API recognition error:", err?.error);
          if (err?.error === "not-allowed" || err?.error === "service-not-allowed") {
            alert("Microphone permission was denied. Please allow microphone access in your browser.");
          }
          stopInlineListening();
        };

        recognition.onend = () => {
          stopInlineListening();
        };

        recognition.start();
        inlineRecognitionRef.current = recognition;
        setIsInlineListening(true);
      } catch (err) {
        console.error("Failed to start SpeechRecognition:", err);
        setIsInlineListening(false);
      }
    } else {
      // Fallback simulation for unsupported browsers
      setIsInlineListening(true);
      setTimeout(() => {
        setActivePrompt((prev) => (prev ? prev + " 5 Bags Sugar (50kg) wholesale from Kikuubo" : "5 Bags Sugar (50kg) wholesale from Kikuubo"));
        stopInlineListening();
      }, 2000);
    }
  };

  const toggleInlineVoice = () => {
    if (isInlineListening) {
      stopInlineListening();
    } else {
      startInlineListening();
    }
  };

  const LOCATIONS = [
    "Nansana West (Wakiso)",
    "Makindye Luwafu",
    "Wakiso Town",
    "Kampala Central",
    "Katwe Industrial Hub",
    "Kiyembe Textile Hub",
    "Bwaise / Kawempe",
    "Rubaga / Nateete",
  ];

  const handleApplyVoiceTranscript = (transcriptText: string, autoSubmit: boolean = false) => {
    setActivePrompt(transcriptText);
    if (autoSubmit && transcriptText.trim()) {
      onFulfillRequest(transcriptText, selectedLocation, clientName || "Kampala Client", attachedMedia || undefined);
    }
  };

  const handleSelectPreset = (preset: UniversalPromptPreset) => {
    setActivePrompt(preset.title + " - " + preset.lugandaPrompt);
    setSelectedLocation(preset.location);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const promptToSend = activePrompt.trim() || (attachedMedia ? `Request for attached ${attachedMedia.type}: ${attachedMedia.name}` : "");
    if (!promptToSend || isLoading) return;
    onFulfillRequest(promptToSend, selectedLocation, clientName || "Kampala Client", attachedMedia || undefined);
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      {/* Voice-to-Text Live Modal */}
      <VoiceRequestRecorder
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onApplyTranscript={handleApplyVoiceTranscript}
        initialText={activePrompt}
        clientName={clientName}
        location={selectedLocation}
      />

      {/* Photo & 1-Min Video Attachment Modal */}
      <MediaAttachmentModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onMediaAttached={(media) => setAttachedMedia(media)}
        existingMedia={attachedMedia}
        onRemoveMedia={() => setAttachedMedia(null)}
      />

      {/* Clean Kampala Wholesale Hero Banner */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-900">
        <img
          src="/src/assets/images/kampala_wholesale_hub_1788032303603.jpg"
          alt="Kampala Wholesale Hub"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        
        {/* Banner Content */}
        <div className="absolute bottom-5 left-6 right-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black tracking-wide uppercase flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Direct Wholesale Hub
              </span>
              <span className="text-xs font-bold text-emerald-300 bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-xs">
                Kikuubo • Katwe • Kiyembe
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              What do you need sourced in Kampala?
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-3.5 py-1.5 rounded-2xl backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Safe Escrow</span>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-7 space-y-5">
        {/* Clean 3-Way Search Box */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {/* Top Prompt Header with 3 Simple Modes */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="client-need-input"
                className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Type item, speak, or upload photo/video:</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className={`text-xs font-bold px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    attachedMedia
                      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{attachedMedia ? "Photo/Video Attached ✓" : "Upload Photo / 1-min Video"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Voice Assistant</span>
                </button>
              </div>
            </div>

            {/* Prominent Large Input Box with Photo/Video preview */}
            <div className={`flex flex-col sm:flex-row items-stretch bg-slate-50 dark:bg-slate-950 border-2 rounded-2xl overflow-hidden shadow-xs transition-all duration-300 ${
              isInlineListening
                ? "border-rose-500 ring-4 ring-rose-500/20 shadow-lg shadow-rose-500/10"
                : "border-slate-300 dark:border-slate-700 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10"
            }`}>
              <div className="flex-1 flex flex-col justify-center px-4 py-3">
                {/* Attached Media Pill (if present) */}
                {attachedMedia && (
                  <div className="mb-2 flex items-center gap-2 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700/60 rounded-xl p-1.5 pr-3 w-fit shadow-xs animate-fade-in">
                    {attachedMedia.type === "image" ? (
                      <img
                        src={attachedMedia.dataUrl}
                        alt="Attached preview"
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                        <Film className="w-4 h-4 text-emerald-400" />
                      </div>
                    )}
                    <div className="text-xs">
                      <p className="font-extrabold text-slate-900 dark:text-white truncate max-w-[160px]">
                        {attachedMedia.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {attachedMedia.type === "video" ? `Video (${attachedMedia.durationSec || 30}s max 1 min)` : "Photo"} • {attachedMedia.sizeMb}MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedMedia(null)}
                      className="ml-2 p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Remove attachment"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="relative flex items-center w-full">
                  <input
                    type="text"
                    id="client-need-input"
                    value={activePrompt}
                    onChange={(e) => setActivePrompt(e.target.value)}
                    placeholder={
                      isInlineListening
                        ? "Listening... Speak your request in Luganda or English..."
                        : attachedMedia
                        ? "Add extra notes or specs (e.g. quantity, brand, power rating)..."
                        : "Describe items (e.g. 5 bags sugar 50kg, Jack A4 sewing machine, 10mm copper cable)..."
                    }
                    className="w-full bg-transparent text-base sm:text-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-semibold pr-10"
                  />

                  {/* Micro button inside the input field itself for rapid 1-click voice capture & translation */}
                  <button
                    type="button"
                    id="prompt-microphone-button"
                    onClick={() => {
                      triggerHapticFeedback(35);
                      setIsVoiceModalOpen(true);
                    }}
                    aria-label="Speak wholesale request using Web Speech API"
                    className="absolute right-0 p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer text-slate-400 hover:text-emerald-600 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                    title="Click to speak wholesale request (Web Speech API + Translation)"
                  >
                    <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </button>
                </div>

                {/* Inline Voice Feedback */}
                {isInlineListening && (
                  <div className="flex items-center gap-2 pt-1.5 animate-fade-in">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      Listening...
                    </span>
                    <div className="flex items-center gap-0.5 h-3">
                      {[30, 70, 100, 60, 90, 40, 80, 50, 95, 35].map((val, idx) => {
                        const barHeight = Math.max(3, Math.min(14, (val * voiceVolumeLevel) / 45 + 3));
                        return (
                          <div
                            key={idx}
                            className="w-1 rounded-full bg-rose-500 transition-all duration-75"
                            style={{ height: `${barHeight}px` }}
                          />
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        stopInlineListening();
                        setIsVoiceModalOpen(true);
                      }}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline ml-auto cursor-pointer"
                    >
                      Translate & Confirm
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 px-3 py-2.5 sm:py-0 bg-white dark:bg-slate-900 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800">
                {/* Photo / 1-Min Video Camera Button */}
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className={`p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                    attachedMedia
                      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  title="Upload photo or 1-minute video"
                >
                  <Camera className="w-5 h-5" />
                </button>

                {/* Tactile Pulsing Microphone Button */}
                <div className="relative flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback(35);
                      setIsVoiceModalOpen(true);
                    }}
                    className="p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Click to speak and translate wholesale request (Luganda / English)"
                  >
                    <Mic className="w-5 h-5 text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-transform" />
                  </button>
                </div>

                {/* Submit Wholesale Request Button */}
                <button
                  type="submit"
                  id="get-wholesale-price-btn"
                  disabled={isLoading || (!activePrompt.trim() && !attachedMedia)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 whitespace-nowrap"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Finding Price...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Direct Wholesale Price</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Location & Client Name */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm pt-1">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">Deliver To:</span>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer text-xs sm:text-sm"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Your Name:</span>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Sarah Nakato"
                className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none w-28 sm:w-32 text-xs sm:text-sm"
              />
            </div>

            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5 sm:ml-auto">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Zero Street Broker Markups</span>
            </div>
          </div>
        </form>

        {/* 1-Tap Popular Wholesale Chips */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick 1-Tap Samples:</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {UNIVERSAL_PROMPTS.slice(0, 3).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="p-2.5 rounded-xl text-left bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:border-emerald-400 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="truncate pr-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 block truncate">
                    {preset.title}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                    {preset.lugandaPrompt}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 shrink-0">
                  {preset.category === "WHOLESALE_BULK" ? "Kikuubo" : preset.category === "GROWTH_EQUIPMENT" ? "Katwe" : "Kiyembe"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


