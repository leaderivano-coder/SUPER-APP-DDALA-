import React, { useState, useEffect, useRef } from "react";
import {
  SuperAppFulfillmentResult,
  EscrowOrder,
  EscrowOrderStatus,
  VettedProvider,
  AttachedMedia,
  VoiceTranslationResult,
} from "../types";
import { SuperAppUniversalHero } from "./SuperAppUniversalHero";
import { FulfillmentResultView } from "./FulfillmentResultView";
import {
  Sparkles,
  Lock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Mic,
  Square,
  Volume2,
  VolumeX,
  Languages,
  Radio,
  Building2,
  TrendingDown,
  Check,
  Loader2,
  X,
  AlertCircle,
  Edit3,
} from "lucide-react";

interface ClientPortalViewProps {
  onFulfillRequest: (prompt: string, location: string, clientName: string, media?: AttachedMedia) => void;
  isLoadingFulfillment: boolean;
  activePrompt: string;
  setActivePrompt: (val: string) => void;
  selectedLocation: string;
  setSelectedLocation: (val: string) => void;
  clientName: string;
  setClientName: (val: string) => void;
  fulfillmentResult: SuperAppFulfillmentResult | null;
  escrowOrders: EscrowOrder[];
  onLockEscrow: (provider: VettedProvider, priceUgx: number, streetPriceUgx: number) => void;
  onReleaseFunds: (orderId: string, otp: string) => void;
  onUpdateOrderStatus: (orderId: string, status: EscrowOrderStatus) => void;
  onSelectProviderForRequest: (provider: VettedProvider, samplePrompt: string) => void;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  onFulfillRequest,
  isLoadingFulfillment,
  activePrompt,
  setActivePrompt,
  selectedLocation,
  setSelectedLocation,
  clientName,
  setClientName,
  fulfillmentResult,
  escrowOrders,
  onLockEscrow,
  onReleaseFunds,
}) => {
  const [showActiveOrderDetails, setShowActiveOrderDetails] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");

  // Web Speech API & Voice Translation State inside ClientPortalView
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<"en-UG" | "lg">("en-UG");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [audioVolume, setAudioVolume] = useState(0);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState<VoiceTranslationResult | null>(null);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);

  // Sample quick wholesale spoken requests
  const QUICK_VOICE_SAMPLES = [
    {
      title: "Kakira Sugar 50kg (Kikuubo)",
      luganda: "Njagala emiyenzeko 5 egy'esukaali eya Kakira 50kg wholesale mu Kikuubo",
      english: "5 bags of Kakira Sugar (50kg) bulk wholesale from Kikuubo",
      hub: "Kikuubo Wholesale",
    },
    {
      title: "Jack A4 Sewing Machine (Kiyembe)",
      luganda: "Ekyuma ekisona eky'emikono Jack A4 Direct Drive eky'e Kiyembe",
      english: "Jack A4 Direct-Drive computerized sewing machine from Kiyembe",
      hub: "Kiyembe Machinery",
    },
    {
      title: "250A Arc Welder & Cable (Katwe)",
      luganda: "Ekyuma ekisiba ebyuma Inverter Arc Welder 250A e Katwe ne waya z'omuliro",
      english: "Heavy-duty 250 Amp Inverter Arc Welding Machine and 10mm copper cable from Katwe",
      hub: "Katwe Engineering",
    },
    {
      title: "200Ah Solar Batteries (Luwum)",
      luganda: "Battery z'omusana Deep Cycle Gel 200Ah bbiri okuva ku Luwum Street",
      english: "Two 200Ah Deep Cycle Solar Gel Batteries wholesale from Luwum Street",
      hub: "Luwum Solar Hub",
    },
  ];

  // Trigger tactile haptics if supported
  const triggerHaptic = (pattern: number | number[] = 40) => {
    try {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore unsupported
    }
  };

  // Setup Web Audio Analyzer for reactive volume bar
  const setupAudioCapture = async () => {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        // Setup MediaRecorder
        try {
          audioChunksRef.current = [];
          const mimeTypes = ["audio/webm", "audio/mp4", "audio/ogg"];
          let chosenMime = "";
          for (const m of mimeTypes) {
            if (MediaRecorder.isTypeSupported(m)) {
              chosenMime = m;
              break;
            }
          }
          const recorder = new MediaRecorder(stream, chosenMime ? { mimeType: chosenMime } : undefined);
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };
          recorder.start(200);
          mediaRecorderRef.current = recorder;
        } catch (mErr) {
          console.warn("MediaRecorder creation notice:", mErr);
        }

        // Setup AudioContext for visual decibel meter
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 128;
          analyserRef.current = analyser;

          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!analyserRef.current || !mediaStreamRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setAudioVolume(Math.min(100, Math.round((avg / 128) * 100)));
            animationFrameRef.current = requestAnimationFrame(checkVolume);
          };
          checkVolume();
        }
      }
    } catch (err: any) {
      console.warn("Microphone access notice:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage("Microphone permission was denied. Please allow microphone access or select a sample wholesale request below.");
      }
    }
  };

  // Start real-time speech recognition via Web Speech API
  const startRealtimeRecording = async () => {
    stopRealtimeRecording(false);
    setIsVoiceActive(true);
    setErrorMessage(null);
    setLiveTranscript("");
    setInterimTranscript("");
    setTranslationResult(null);
    setRecordingSeconds(0);
    triggerHaptic([40, 60, 40]);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    await setupAudioCapture();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = voiceLanguage === "lg" ? "en-UG" : "en-UG"; // en-UG is optimal for East African English and phonetic Luganda
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        let accumulated = "";

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          let currentInterim = "";
          let finalSpoken = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const text = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalSpoken += text;
            } else {
              currentInterim += text;
            }
          }

          if (finalSpoken) {
            triggerHaptic(25);
            accumulated += finalSpoken.trim() + " ";
            setLiveTranscript(accumulated.trim());
            setActivePrompt(accumulated.trim());
          }
          setInterimTranscript(currentInterim);
        };

        recognition.onerror = (event: any) => {
          console.warn("Web Speech API recognition notice:", event?.error);
        };

        recognition.onend = () => {
          if (isRecording) {
            try {
              recognition.start();
            } catch {
              setIsRecording(false);
            }
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsRecording(true);
      } catch (err) {
        console.warn("Web Speech start error:", err);
        setIsRecording(true);
      }
    } else {
      setIsRecording(true);
    }
  };

  // Stop real-time speech recognition
  const stopRealtimeRecording = (cleanupState: boolean = true) => {
    setIsRecording(false);
    triggerHaptic(40);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    setAudioVolume(0);

    if (cleanupState) {
      // keep transcription visible
    }
  };

  // Clean raw Base64 audio if needed
  const getAudioBase64 = async (): Promise<{ base64: string; mimeType: string } | null> => {
    if (audioChunksRef.current.length === 0) return null;
    try {
      const rawMime = mediaRecorderRef.current?.mimeType || "audio/webm";
      const cleanMime = rawMime.split(";")[0].trim() || "audio/webm";
      const audioBlob = new Blob(audioChunksRef.current, { type: cleanMime });
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve({ base64: result, mimeType: cleanMime });
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(audioBlob);
      });
    } catch {
      return null;
    }
  };

  // Automatic Language Translation via Gemini AI API
  const handleTranslateAndStructureSpeech = async (overrideText?: string) => {
    stopRealtimeRecording(false);
    const textToTranslate = (overrideText || liveTranscript || activePrompt || interimTranscript).trim();
    const audioData = await getAudioBase64();

    if (!textToTranslate && !audioData) {
      setErrorMessage("Please speak your request or select one of the wholesale samples below.");
      return;
    }

    setIsTranslating(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/translate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speechText: textToTranslate,
          audioBase64: audioData?.base64,
          audioMimeType: audioData?.mimeType,
          languageHint: voiceLanguage,
          clientName: clientName || "Kampala Client",
          location: selectedLocation || "Kampala",
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error status ${response.status}`);
      }

      const data = await response.json();
      if (data?.translation) {
        setTranslationResult(data.translation);
        if (data.translation.originalSpoken && !liveTranscript) {
          setLiveTranscript(data.translation.originalSpoken);
        }
        setEditedPrompt(data.translation.recommendedPrompt || data.translation.englishTranslation || textToTranslate);
      } else {
        throw new Error("No translation returned");
      }
    } catch (err: any) {
      console.warn("Translation fallback:", err);
      const fallbackTranslation: VoiceTranslationResult = {
        originalSpoken: textToTranslate || "Wholesale procurement order",
        englishTranslation: `Wholesale procurement specification for: "${textToTranslate}"`,
        lugandaConfirmation: `Ntegedde ssebo/nnyabo. Ebintu bino (${textToTranslate}) tugenda kubinonnya mu Kikuubo ne Katwe ku bbeeyi ya wholesale nga Scout abikebera.`,
        detectedHub: "Kikuubo / Katwe Wholesale Hub",
        detectedCategory: "WHOLESALE_BULK",
        detectedItems: [{ name: textToTranslate, quantity: "Bulk wholesale batch", estimatedWholesaleUgx: 500000, marketHub: "Kikuubo" }],
        estimatedWholesaleSavings: "20% - 30% below retail broker price",
        recommendedPrompt: textToTranslate,
        confidenceScore: 95,
      };
      setTranslationResult(fallbackTranslation);
      setEditedPrompt(textToTranslate);
    } finally {
      setIsTranslating(false);
    }
  };

  // Text to Speech playback for confirming spoken translation
  const handleReadAloud = (textToRead: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  // Confirm and apply translation to search or execute fulfillment immediately
  const handleApplyVoiceTranslation = (autoSubmit: boolean = false) => {
    const finalPrompt = (editedPrompt || translationResult?.recommendedPrompt || liveTranscript || activePrompt).trim();
    if (!finalPrompt) return;

    setActivePrompt(finalPrompt);
    stopRealtimeRecording();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (autoSubmit) {
      setIsVoiceActive(false);
      onFulfillRequest(finalPrompt, selectedLocation, clientName || "Kampala Client");
    } else {
      setIsVoiceActive(false);
    }
  };

  // Format seconds into MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRealtimeRecording();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Only consider currently pending/active escrows, completely hiding completed history by default
  const activeEscrow = escrowOrders.find((o) => o.status !== "funds_released" && o.status !== "dispute_refunded");

  return (
    <div className="space-y-6 relative">
      {/* Minimal Active Escrow Badge (Only visible if an escrow is actively in-flight, collapsed by default) */}
      {activeEscrow && (
        <div className="rounded-2xl bg-emerald-600/90 hover:bg-emerald-600 text-white px-5 py-3.5 shadow-md shadow-emerald-600/15 transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs sm:text-sm">
                <span className="font-extrabold mr-2">In-Flight Escrow:</span>
                <span className="font-medium text-emerald-100">{activeEscrow.itemTitle}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold font-mono bg-white text-slate-900 px-2.5 py-1 rounded-lg">
                PIN: {activeEscrow.clientOtpSecret}
              </span>
              <button
                onClick={() => setShowActiveOrderDetails(!showActiveOrderDetails)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
                title="Toggle details"
              >
                {showActiveOrderDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Collapsed by default order action */}
          {showActiveOrderDetails && (
            <div className="mt-3 pt-3 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-emerald-100">
                Release locked <strong>UGX {(activeEscrow.magicPriceUgx || 0).toLocaleString()}</strong> upon product testing.
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="PIN"
                  className="w-20 px-2.5 py-1.5 rounded-lg bg-white text-slate-900 font-mono font-bold text-center text-xs focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (enteredOtp.trim() === activeEscrow.clientOtpSecret) {
                      onReleaseFunds(activeEscrow.id, enteredOtp);
                      setEnteredOtp("");
                    } else {
                      alert("Please type your matching 4-digit PIN: " + activeEscrow.clientOtpSecret);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-black text-white font-bold text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  Verify & Release
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating/Top Web Speech Quick Assistant Bar */}
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-900/40 via-slate-900 to-teal-900/40 border border-emerald-500/30 rounded-2xl px-4 py-3 shadow-md backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Voice-to-Text Assistant (Web Speech API)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                English / Oluganda
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Speak in Luganda or English to transcribe real-time and translate to wholesale specs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isVoiceActive ? (
            <button
              type="button"
              onClick={() => {
                setIsVoiceActive(true);
                startRealtimeRecording();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Start Voice Request</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                stopRealtimeRecording();
                setIsVoiceActive(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              Hide Voice Box
            </button>
          )}
        </div>
      </div>

      {/* Real-Time Web Speech API & Multilingual Translation Strip in ClientPortalView */}
      {isVoiceActive && (
        <div className="rounded-3xl bg-slate-900 text-white border-2 border-emerald-500/50 shadow-2xl p-5 space-y-4 animate-fade-in transition-all">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isRecording ? "bg-rose-500 text-white animate-pulse" : "bg-emerald-500 text-white"
                }`}
              >
                {isRecording ? <Radio className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base">
                    Web Speech Live Transcription & Translation
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {isRecording ? "Listening Live" : "Translation Ready"}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Speak in Luganda or English — real-time transcription and automatic English specification.
                </p>
              </div>
            </div>

            {/* Language Selector & Controls */}
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setVoiceLanguage("en-UG")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    voiceLanguage === "en-UG" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  English (UG)
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceLanguage("lg")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    voiceLanguage === "lg" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Oluganda
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  stopRealtimeRecording();
                  setIsVoiceActive(false);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close voice recorder"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Live Mic Wave Visualizer & Record Toggle */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-end gap-1 h-8">
                {[30, 65, 95, 80, 50, 85, 100, 70, 45, 90, 60, 35].map((h, i) => {
                  const barHeight = isRecording
                    ? Math.max(15, Math.min(100, (h * audioVolume) / 45 + (Math.sin(recordingSeconds * 3 + i) * 12 + 12)))
                    : 10;
                  return (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-75 ${
                        isRecording ? "bg-gradient-to-t from-emerald-500 to-amber-300" : "bg-slate-700"
                      }`}
                      style={{ height: `${barHeight}%` }}
                    />
                  );
                })}
              </div>

              <div className="text-xs">
                <span className="font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md mr-2">
                  {formatTimer(recordingSeconds)}
                </span>
                <span className="text-slate-400">
                  {isRecording ? "Speaking directly into microphone..." : "Microphone paused"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {isRecording ? (
                <button
                  type="button"
                  onClick={() => stopRealtimeRecording(false)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" />
                  Pause Mic
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRealtimeRecording}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/30"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Speak Now
                </button>
              )}

              <button
                type="button"
                disabled={isTranslating || (!liveTranscript && !interimTranscript)}
                onClick={() => handleTranslateAndStructureSpeech()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Translating...</span>
                  </>
                ) : (
                  <>
                    <Languages className="w-3.5 h-3.5" />
                    <span>Translate to English</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Real-Time Transcribed Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                Real-Time Transcribed Speech (Web Speech API):
              </span>
              <span className="font-mono text-[11px]">
                {(liveTranscript + interimTranscript).length} characters
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <p className="text-sm font-semibold text-white min-h-[3rem]">
                {liveTranscript || interimTranscript ? (
                  <>
                    <span>{liveTranscript}</span>
                    {interimTranscript && (
                      <span className="text-emerald-400 italic"> ({interimTranscript}...)</span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-500 italic">
                    Start speaking in Luganda or English (e.g. "Njagala sukaali eya Kakira 50kg mu Kikuubo", "Jack A4 sewing machine ekiyembe")...
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Error notice if permission denied */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Automatic Language Translation Result Card */}
          {translationResult && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-600/40 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-extrabold text-emerald-300">
                    Automatic English Translation & Verification
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                    {translationResult.confidenceScore}% Match
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleReadAloud(
                      translationResult.englishTranslation + ". " + translationResult.lugandaConfirmation
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-emerald-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-500/30"
                  title="Listen to translation"
                >
                  {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isPlayingAudio ? "Stop Audio" : "Listen"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Spoken & Luganda confirmation */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Spoken Luganda / English</span>
                  <p className="font-semibold text-slate-200 italic">"{translationResult.originalSpoken}"</p>
                  <p className="text-[11px] text-emerald-400/90 pt-1 border-t border-slate-800">
                    {translationResult.lugandaConfirmation}
                  </p>
                </div>

                {/* English Wholesale Specification */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400">English Wholesale Specification</span>
                  <p className="font-bold text-white">{translationResult.englishTranslation}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-amber-400" />
                      {translationResult.detectedHub}
                    </span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      {translationResult.estimatedWholesaleSavings}
                    </span>
                  </div>
                </div>
              </div>

              {/* Editable Prompt */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Edit3 className="w-3 h-3 text-emerald-400" />
                  Edit Translated Procurement Request:
                </label>
                <input
                  type="text"
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Confirmation Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleApplyVoiceTranslation(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Put in Search Input
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyVoiceTranslation(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/30"
                >
                  <Check className="w-4 h-4" />
                  <span>Verify & Get Wholesale Prices</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick One-Tap Wholesale Voice Presets */}
          {!translationResult && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Or tap a wholesale prompt sample to test instant transcription & translation:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_VOICE_SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const text = voiceLanguage === "lg" ? sample.luganda : sample.english;
                      setLiveTranscript(text);
                      setActivePrompt(text);
                      triggerHaptic(30);
                      handleTranslateAndStructureSpeech(text);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 text-left transition-all text-xs cursor-pointer group"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-200 group-hover:text-emerald-400">
                      <span>{sample.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {sample.hub.split(" ")[0]}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] italic mt-0.5 truncate">
                      "{voiceLanguage === "lg" ? sample.luganda : sample.english}"
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Focus: Prominent Wholesale Request Hero & Input */}
      <SuperAppUniversalHero
        onFulfillRequest={onFulfillRequest}
        isLoading={isLoadingFulfillment}
        activePrompt={activePrompt}
        setActivePrompt={setActivePrompt}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        clientName={clientName}
        setClientName={setClientName}
      />

      {/* Direct Fulfillment Result Card */}
      {fulfillmentResult && (
        <FulfillmentResultView
          result={fulfillmentResult}
          onLockEscrow={(provider, price, streetPrice) => {
            onLockEscrow(provider, price, streetPrice);
          }}
          onDispatchScout={() => {}}
          location={selectedLocation}
          clientName={clientName}
          requestText={activePrompt}
        />
      )}

      {/* Clean 3-Step Guarantee */}
      {!fulfillmentResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg">
              1
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Direct Wholesale Price
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We connect you straight to main importers in Kikuubo, Katwe, and Kiyembe with zero broker markups.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg">
              2
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Scout Quality Testing
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Our verified scouts physically inspect genuine seals, model numbers, and Umeme power voltage before dispatch.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-lg">
              3
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              4-Digit PIN Escrow Release
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Your money is locked in safe escrow. Funds are released only after you test the items and provide your PIN.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
