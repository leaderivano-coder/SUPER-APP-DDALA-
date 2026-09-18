import React, { useState } from "react";
import {
  SuperAppFulfillmentResult,
  VettedProvider,
} from "../types";
import {
  ShieldCheck,
  Zap,
  TrendingDown,
  Building2,
  CheckCircle2,
  Phone,
  MapPin,
  Award,
  Lock,
  MessageSquare,
  Sparkles,
  Volume2,
  VolumeX,
  FileCheck,
  ShoppingBag,
} from "lucide-react";
import confetti from "canvas-confetti";

interface FulfillmentResultViewProps {
  result: SuperAppFulfillmentResult;
  onLockEscrow: (provider: VettedProvider, priceUgx: number, streetPriceUgx: number) => void;
  onDispatchScout: (provider: VettedProvider) => void;
  location: string;
  clientName: string;
  requestText: string;
}

export const FulfillmentResultView: React.FC<FulfillmentResultViewProps> = ({
  result,
  onLockEscrow,
  onDispatchScout,
  location,
  clientName,
  requestText,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string>(
    result.vettedProviders[0]?.id || ""
  );

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#14b8a6", "#06b6d4", "#f59e0b"],
    });
  };

  const handleSpeakLuganda = () => {
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(result.lugandaResponse);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const selectedProvider =
    result.vettedProviders.find((p) => p.id === selectedProviderId) ||
    result.vettedProviders[0];

  return (
    <div className="space-y-6">
      {/* High-Impact Client Request Focus Box */}
      <div className="rounded-3xl bg-emerald-500/10 dark:bg-emerald-950/40 border-2 border-emerald-500/30 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-600 text-white flex items-center gap-1.5 shadow-xs">
                <ShoppingBag className="w-4 h-4" />
                YOUR ORDER SPECIFICATION
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                Deliver to: <strong>{location || "Kampala"}</strong> for <strong>{clientName || "Client"}</strong>
              </span>
            </div>

            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white font-serif tracking-tight leading-snug">
              "{requestText || result.title}"
            </div>

            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
              {result.intentSummary}
            </p>
          </div>

          <div className="shrink-0 flex md:flex-col items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-500/30">
            <div className="text-left md:text-center">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Primary Hub
              </span>
              <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono">
                {result.magicPrice.priceSourceHub}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/20 px-3 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4" />
              <span>0% Fraud Escrow</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Comparison & Scout Inspection Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Direct Wholesale Pricing Card (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-serif">
                    Direct Wholesale Price
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">No broker markups</span>
                </div>
              </div>

              <span className="text-sm font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-500/40">
                SAVE {result.magicPrice.savingsPercentage}%
              </span>
            </div>

            {/* Price Numbers Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Typical Street / Broker Price
                </span>
                <div className="text-xl sm:text-2xl font-bold text-slate-400 line-through mt-1">
                  UGX {result.magicPrice.streetBrokerPriceUgx.toLocaleString()}
                </div>
                <span className="text-xs text-rose-500 font-semibold mt-1 block">
                  + Inflated middleman fees
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/40">
                <span className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Ddala Magic Wholesale Price
                </span>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                  UGX {result.magicPrice.magicWholesalePriceUgx.toLocaleString()}
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">
                  ✓ Direct from {result.magicPrice.priceSourceHub}
                </span>
              </div>
            </div>

            {/* Net Savings Callout */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-6 h-6" />
                <span className="text-sm sm:text-base font-extrabold">Your Total Cash Savings:</span>
              </div>
              <span className="text-lg sm:text-xl font-black font-mono">
                +UGX {result.magicPrice.netSavingsUgx.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Direct Lock Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <button
              onClick={() => {
                triggerConfetti();
                onLockEscrow(
                  selectedProvider,
                  result.magicPrice.magicWholesalePriceUgx,
                  result.magicPrice.streetBrokerPriceUgx
                );
              }}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base sm:text-lg shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-3 active:scale-98 cursor-pointer"
            >
              <Lock className="w-5 h-5" />
              <span>Lock Escrow at UGX {result.magicPrice.magicWholesalePriceUgx.toLocaleString()}</span>
            </button>
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
              Funds stay 100% in safe escrow. Released only when you test the goods and enter your secret PIN.
            </p>
          </div>
        </div>

        {/* Right Column: Physical Scout Inspection & Photo Verification (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="relative h-44 w-full bg-slate-900">
            <img
              src="/src/assets/images/quality_inspection_scout_1788032318570.jpg"
              alt="Quality Inspection Scout"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
              <span className="text-xs font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-600">
                Physical Inspection
              </span>
              <span className="text-xs font-mono font-bold text-emerald-300">
                100% Genuine Verified
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Tested Before Sourcing</span>
            </h4>

            <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Anti-Counterfeit:</strong> Genuine manufacturer seal and specifications verified.</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Power & Voltage Check:</strong> Tested on Umeme power before dispatch.</span>
              </div>
            </div>

            {/* Luganda Voice Prompt */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-slate-950 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-emerald-200 truncate">
                  "{result.lugandaResponse}"
                </span>
              </div>
              <button
                onClick={handleSpeakLuganda}
                className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shrink-0 cursor-pointer"
                title="Listen in Luganda"
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Trader Card & Delivery Scout Photo */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
          <div>
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-serif flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Matched Verified Trader</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Direct physical workshop with zero-fraud record in {result.magicPrice.priceSourceHub}
            </p>
          </div>

          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/40">
            ★ {selectedProvider.rating.toFixed(2)} Rating ({selectedProvider.completedJobs} Deliveries)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-sm shrink-0">
                  {selectedProvider.initials || "VP"}
                </div>
                <div>
                  <h5 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {selectedProvider.name}
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    {selectedProvider.businessName} • {selectedProvider.hub}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{selectedProvider.physicalLandmark}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-mono">{selectedProvider.phone}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedProvider.verifiedBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{badge}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 relative h-36">
            <img
              src="/src/assets/images/escrow_delivery_handover_1788032332684.jpg"
              alt="Escrow Delivery Handover"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-2.5 left-3 right-3 text-white text-xs font-bold flex items-center justify-between">
              <span>Delivery Handover</span>
              <span className="text-emerald-300">4-Digit PIN Release</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
