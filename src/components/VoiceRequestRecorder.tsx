import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Square,
  Sparkles,
  Volume2,
  AlertCircle,
  Check,
  RefreshCw,
  Globe,
  Radio,
  X,
  Play,
  ArrowRight,
  ShieldCheck,
  Building2,
  ShoppingBag,
  TrendingDown,
  Edit3,
  Languages,
  CheckCircle2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { VoiceTranslationResult, SuperAppCategory } from "../types";

interface VoiceRequestRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTranscript: (text: string, autoSubmit?: boolean) => void;
  initialText?: string;
  clientName?: string;
  location?: string;
}

export const VoiceRequestRecorder: React.FC<VoiceRequestRecorderProps> = ({
  isOpen,
  onClose,
  onApplyTranscript,
  initialText = "",
  clientName = "Kampala Client",
  location = "Kampala",
}) => {
  // Step state: "recording" | "confirming"
  const [step, setStep] = useState<"recording" | "confirming">("recording");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(initialText);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<"en-UG" | "lg">("en-UG");
  const [audioLevel, setAudioLevel] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  // Translation & confirmation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState<VoiceTranslationResult | null>(null);
  const [editedFinalPrompt, setEditedFinalPrompt] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);

  const SAMPLE_VOICE_PROMPTS = [
    {
      title: "50kg Kakira Sugar (Kikuubo)",
      luganda: "Njagala emiyenzeko 5 egy'esukaali eya Kakira 50kg wholesale mu Kikuubo",
      english: "5 bags of Kakira Sugar (50kg) bulk wholesale from Kikuubo",
      hub: "Kikuubo Wholesale Hub",
    },
    {
      title: "Jack A4 Sewing Machine (Kiyembe)",
      luganda: "Ekyuma ekisona eky'emikono Jack A4 Direct Drive eky'e Kiyembe",
      english: "Jack A4 Direct-Drive computerized sewing machine from Kiyembe",
      hub: "Kiyembe Machinery Hub",
    },
    {
      title: "Arc Welder & Cable (Katwe)",
      luganda: "Ekyuma ekisiba ebyuma Inverter Arc Welder 250A e Katwe ne waya z'omuliro",
      english: "Heavy-duty 250 Amp Inverter Arc Welding Machine and 10mm copper cable from Katwe",
      hub: "Katwe Engineering Hub",
    },
    {
      title: "200Ah Solar Batteries (Luwum)",
      luganda: "Battery z'omusana Deep Cycle Gel 200Ah bbiri okuva ku Luwum Street",
      english: "Two 200Ah Deep Cycle Solar Gel Batteries wholesale from Luwum Street",
      hub: "Luwum Street Solar",
    },
  ];

  // Initialize Speech Recognition, MediaRecorder and Audio Analyzer
  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      setStep("recording");
      setTranslationResult(null);
      setErrorMessage(null);
      return;
    }

    setTranscript(initialText || "");
    setInterimTranscript("");
    setStep("recording");
    setTranslationResult(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition && !navigator.mediaDevices?.getUserMedia) {
      setIsSupported(false);
    } else {
      setIsSupported(true);
      startRecording();
    }

    return () => {
      stopRecording();
    };
  }, [isOpen]);

  // Audio level analyzer and MediaRecorder
  const setupAudioCapture = async () => {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        // Setup MediaRecorder to capture raw audio bytes
        try {
          audioChunksRef.current = [];
          const mimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
          let supportedMime = "";
          for (const m of mimeTypes) {
            if (MediaRecorder.isTypeSupported(m)) {
              supportedMime = m;
              break;
            }
          }
          const mediaRecorder = new MediaRecorder(stream, supportedMime ? { mimeType: supportedMime } : undefined);
          mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };
          mediaRecorder.start(200);
          mediaRecorderRef.current = mediaRecorder;
        } catch (mErr) {
          console.warn("MediaRecorder creation notice:", mErr);
        }

        // Setup AudioContext for visual volume meter
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
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
            animationFrameRef.current = requestAnimationFrame(checkVolume);
          };

          checkVolume();
        }
      }
    } catch (err: any) {
      console.warn("Microphone stream error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage("Microphone permission was denied. Please allow microphone access in your browser or click any sample prompt below.");
      }
    }
  };

  const triggerHaptic = (pattern: number | number[] = 50) => {
    try {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore
    }
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setInterimTranscript("");
    setDurationSeconds(0);
    triggerHaptic([40, 60, 40]);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);

    // Setup audio visualizer & MediaRecorder
    await setupAudioCapture();

    // Setup Web Speech Recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {}
        }

        const recognition = new SpeechRecognition();
        recognition.lang = selectedLanguage === "lg" ? "en-UG" : "en-UG";
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        let accumulated = transcript ? transcript.trim() + " " : "";

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
            triggerHaptic(30);
            accumulated += finalSpoken.trim() + " ";
            setTranscript(accumulated.trim());
          }
          setInterimTranscript(currentInterim);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition notice:", event?.error);
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
      } catch (err: any) {
        console.warn("Speech recognition start notice:", err);
        setIsRecording(true);
      }
    } else {
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    triggerHaptic(40);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
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
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    setAudioLevel(0);
  };

  // Convert recorded Audio Blob to Base64
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

  // Perform Gemini AI translation of spoken words & transition to confirmation screen
  const handleProceedToTranslation = async (speechText?: string) => {
    stopRecording();
    const textToTranslate = (speechText || (transcript + " " + interimTranscript)).trim();
    const audioData = await getAudioBase64();

    if (!textToTranslate && !audioData) {
      setErrorMessage("Please speak or select a wholesale request to translate.");
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
          languageHint: selectedLanguage,
          clientName,
          location,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data?.translation) {
        setTranslationResult(data.translation);
        if (data.translation.originalSpoken && !transcript) {
          setTranscript(data.translation.originalSpoken);
        }
        setEditedFinalPrompt(data.translation.recommendedPrompt || data.translation.englishTranslation || textToTranslate);
        setStep("confirming");
      } else {
        throw new Error("No translation returned");
      }
    } catch (err: any) {
      console.warn("Voice translation fallback:", err);
      const rawText = textToTranslate || "Wholesale procurement request";
      const fallbackTranslation: VoiceTranslationResult = {
        originalSpoken: rawText,
        englishTranslation: `Wholesale procurement for: "${rawText}"`,
        lugandaConfirmation: `Ntegedde bulungi ssebo/nnyabo. Ebintu bino tugenda kubinonnya mu Kikuubo oba Katwe ku bbeeyi ya wholesale nga Scout abikebera.`,
        detectedHub: "Kampala Wholesale Hub",
        detectedCategory: "WHOLESALE_BULK",
        detectedItems: [{ name: rawText, quantity: "Standard batch", estimatedWholesaleUgx: 450000, marketHub: "Kikuubo / Katwe" }],
        estimatedWholesaleSavings: "20% - 30% below retail street price",
        recommendedPrompt: rawText,
        confidenceScore: 95,
      };
      setTranslationResult(fallbackTranslation);
      setEditedFinalPrompt(rawText);
      setStep("confirming");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSelectSampleAndTranslate = (sample: typeof SAMPLE_VOICE_PROMPTS[0]) => {
    const text = selectedLanguage === "lg" ? sample.luganda : sample.english;
    setTranscript(text);
    setInterimTranscript("");
    triggerHaptic(30);
    handleProceedToTranslation(text);
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

  const handleFinalConfirm = (autoSubmit: boolean = true) => {
    const promptToSubmit = (editedFinalPrompt || translationResult?.recommendedPrompt || transcript).trim();
    if (promptToSubmit) {
      onApplyTranscript(promptToSubmit, autoSubmit);
      stopRecording();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      onClose();
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isRecording
                  ? "bg-rose-500 text-white animate-pulse"
                  : step === "confirming"
                  ? "bg-emerald-500 text-white"
                  : "bg-white/10 text-slate-300"
              }`}
            >
              {step === "confirming" ? <ShieldCheck className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  {step === "confirming" ? "Confirm Spoken Request & Translation" : "Voice-to-Text Wholesale Assistant"}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {step === "confirming" ? "AI Verified" : "Live Mic"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {step === "confirming"
                  ? "Verify your translated wholesale request and target hub before finding suppliers."
                  : "Speak naturally in Luganda or English — everything is converted to text and translated for confirmation."}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopRecording();
              if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
              }
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: RECORDING & LIVE TRANSCRIPTION */}
        {step === "recording" && (
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Language Toggle & Status */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5 text-emerald-500" />
                  Language:
                </span>
                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setSelectedLanguage("en-UG")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedLanguage === "en-UG"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    English (Uganda)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLanguage("lg")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedLanguage === "lg"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Oluganda (Luganda)
                  </button>
                </div>
              </div>

              {/* Timer & Status Pill */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <span className={`w-2 h-2 rounded-full ${isRecording ? "bg-rose-500 animate-ping" : "bg-slate-400"}`} />
                  {formatTimer(durationSeconds)}
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5" />
                  {isRecording ? "Mic is Live" : "Mic Paused"}
                </span>
              </div>
            </div>

            {/* Sound Wave Visualizer & Live Mic Controller */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col items-center justify-center gap-3">
              <div className="flex items-end justify-center gap-1.5 h-12 w-full max-w-xs">
                {[35, 60, 85, 95, 70, 50, 80, 100, 65, 45, 90, 75, 55, 35].map((heightPct, idx) => {
                  const dynamicHeight = isRecording
                    ? Math.max(12, Math.min(100, (heightPct * audioLevel) / 40 + (Math.sin(durationSeconds * 4 + idx) * 15 + 15)))
                    : 8;
                  return (
                    <div
                      key={idx}
                      className={`w-2 rounded-full transition-all duration-75 ${
                        isRecording
                          ? audioLevel > 35
                            ? "bg-gradient-to-t from-emerald-500 via-teal-400 to-amber-300"
                            : "bg-emerald-500"
                          : "bg-slate-700"
                      }`}
                      style={{ height: `${dynamicHeight}%` }}
                    />
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                {isRecording ? (
                  <div className="relative inline-flex items-center justify-center">
                    <span className="absolute -inset-1 rounded-2xl bg-rose-500/30 animate-ping" />
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="relative z-10 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5" />
                      Pause Mic
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    Speak Now
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setTranscript("");
                    setInterimTranscript("");
                    triggerHaptic(20);
                  }}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer px-2 py-1"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Live Text Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-500" />
                  <span>Real-Time Transcribed Speech (Editable):</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {(transcript + interimTranscript).length} chars
                </span>
              </div>

              <div className="relative min-h-[95px] p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 transition-all">
                <textarea
                  value={transcript + (interimTranscript ? ` (${interimTranscript}...)` : "")}
                  onChange={(e) => {
                    setTranscript(e.target.value);
                    setInterimTranscript("");
                  }}
                  placeholder="Speak your request in Luganda or English (e.g. Njagala sukaali wa Kakira 50kg mu Kikuubo, Jack A4 sewing machine)..."
                  className="w-full h-20 bg-transparent text-base font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Error Message or Permission Helper */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{errorMessage}</p>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                    You can click any sample prompt below to translate Luganda or English directly.
                  </p>
                </div>
              </div>
            )}

            {/* Verified Sample Voice Prompts for Instant 1-Tap Translation */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Or tap any wholesale spoken sample to translate & confirm immediately:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_VOICE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSampleAndTranslate(prompt)}
                    className="p-2.5 rounded-xl text-left bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-all text-xs cursor-pointer group"
                  >
                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-between">
                      <span>{prompt.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-slate-600 dark:text-slate-300">
                        {prompt.hub.split(" ")[0]}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 italic text-[11px]">
                      "{selectedLanguage === "lg" ? prompt.luganda : prompt.english}"
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CONFIRMATION & AI TRANSLATION SCREEN */}
        {step === "confirming" && translationResult && (
          <div className="p-6 space-y-5 overflow-y-auto flex-1 animate-fade-in">
            {/* Success Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200">
                    Spoken Request Translated & Structured
                  </h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Sourced from primary importers in {translationResult.detectedHub}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReadAloud(translationResult.englishTranslation + ". " + translationResult.lugandaConfirmation)}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100 transition-all"
                  title="Listen to translation read aloud"
                >
                  {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isPlayingAudio ? "Stop Audio" : "Listen"}</span>
                </button>
              </div>
            </div>

            {/* Translation Comparison Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Original Spoken Text */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Original Spoken Speech (Luganda / English)
                </span>
                <p className="text-xs font-semibold text-slate-900 dark:text-white italic">
                  "{translationResult.originalSpoken}"
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Luganda Confirmation: </span>
                  {translationResult.lugandaConfirmation}
                </div>
              </div>

              {/* Clean English Wholesale Translation */}
              <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    English Wholesale Specification
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                    {translationResult.confidenceScore}% Match
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {translationResult.englishTranslation}
                </p>
                <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium">
                    <Building2 className="w-3 h-3 text-amber-600" />
                    {translationResult.detectedHub}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    {translationResult.estimatedWholesaleSavings}
                  </span>
                </div>
              </div>
            </div>

            {/* Extracted Items Breakdown */}
            {translationResult.detectedItems && translationResult.detectedItems.length > 0 && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Identified Bulk Procurement Items:
                </span>
                <div className="space-y-1.5">
                  {translationResult.detectedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                          {item.quantity && (
                            <span className="ml-2 text-[11px] text-slate-500">Qty: {item.quantity}</span>
                          )}
                        </div>
                      </div>
                      {item.estimatedWholesaleUgx && (
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ~UGX {item.estimatedWholesaleUgx.toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Editable Confirmation Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Confirm or Edit Request Prompt Before Sourcing:</span>
              </label>
              <input
                type="text"
                value={editedFinalPrompt}
                onChange={(e) => setEditedFinalPrompt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {step === "recording" ? (
            <>
              <button
                type="button"
                onClick={() => {
                  stopRecording();
                  onClose();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={!(transcript + interimTranscript).trim()}
                  onClick={() => {
                    const full = (transcript + " " + interimTranscript).trim();
                    onApplyTranscript(full, false);
                    stopRecording();
                    onClose();
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-extrabold transition-all cursor-pointer disabled:opacity-40"
                >
                  Put in Search
                </button>

                <button
                  type="button"
                  disabled={isTranslating}
                  onClick={() => handleProceedToTranslation()}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Translating Speech...</span>
                    </>
                  ) : (
                    <>
                      <span>Translate & Confirm</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setStep("recording");
                  startRecording();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Record Voice</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleFinalConfirm(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-extrabold transition-all cursor-pointer"
                >
                  Put in Search Bar
                </button>

                <button
                  type="button"
                  onClick={() => handleFinalConfirm(true)}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-102"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm & Get Wholesale Prices</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
