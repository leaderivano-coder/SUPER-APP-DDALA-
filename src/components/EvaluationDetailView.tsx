import React, { useState } from "react";
import { 
  LoanApplication 
} from "../types";
import { formatUGX, getScoreColor, getHubColor } from "../utils/formatters";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  MapPin, 
  ShoppingBag, 
  TrendingUp, 
  Zap, 
  UserCheck, 
  MessageSquare, 
  Copy, 
  Check, 
  Send, 
  Sparkles,
  Sliders,
  DollarSign,
  Calendar,
  Volume2
} from "lucide-react";
import confetti from "canvas-confetti";

interface EvaluationDetailViewProps {
  application: LoanApplication;
  onDispatchScout: (application: LoanApplication) => void;
  onStatusChange: (id: string, newStatus: LoanApplication["status"]) => void;
  onUpdatePlan?: (id: string, updatedPlan: LoanApplication["evaluation"]) => void;
}

export const EvaluationDetailView: React.FC<EvaluationDetailViewProps> = ({
  application,
  onDispatchScout,
  onStatusChange,
}) => {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [customDepositPercent, setCustomDepositPercent] = useState<number>(20);
  const [customWeeks, setCustomWeeks] = useState<number>(
    application.evaluation?.proposed_plan.duration_weeks || 20
  );

  const evaluation = application.evaluation;
  if (!evaluation) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
        <p className="text-slate-400">Order pending AI Partner evaluation...</p>
      </div>
    );
  }

  const scoreMeta = getScoreColor(evaluation.eligibility_score);
  const isApproved = evaluation.eligibility_score >= 8;
  const isReview = evaluation.eligibility_score >= 5 && evaluation.eligibility_score < 8;
  const isDeclined = evaluation.eligibility_score < 5;

  // Middleman recalculations based on interactive sliders
  const baseAssetCost = evaluation.proposed_plan.asset_value_ugx || application.estimatedAssetValueUgx;
  const calculatedDeposit = Math.round(baseAssetCost * (customDepositPercent / 100));
  const calculatedMarkup = Math.round(baseAssetCost * 0.125);
  const totalPrincipalPlusMarkup = baseAssetCost + calculatedMarkup;
  const remainingBalance = totalPrincipalPlusMarkup - calculatedDeposit;
  const calculatedWeekly = Math.round(remainingBalance / customWeeks);
  const dailyInstallmentEquivalent = Math.round(calculatedWeekly / 7);
  const cashflowCoverage = application.dailyProfitUgx > 0 
    ? (application.dailyProfitUgx / dailyInstallmentEquivalent).toFixed(1) 
    : "N/A";

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(evaluation.client_message);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleTriggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#3b82f6", "#f59e0b", "#14b8a6"],
    });
    onDispatchScout(application);
  };

  const handleSimulateAudio = () => {
    setIsPlayingAudio(true);
    // Use speech synthesis if available, otherwise just visual feedback
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(evaluation.client_message);
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 3500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Client Quick Summary & Approval Action */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Client Bio */}
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 flex items-center justify-center text-xl font-bold text-white font-serif shrink-0">
              {application.clientName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {application.clientName}
                </h2>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getHubColor(application.hub)}`}>
                  {application.hub} Hub
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {application.businessType}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {application.location}
                </span>
                <span>•</span>
                <span>Trust Score: <strong className="text-emerald-400">{application.trustScore}/100</strong></span>
                <span>•</span>
                <span>Daily Profit: <strong className="text-slate-200">{formatUGX(application.dailyProfitUgx)}/day</strong></span>
              </div>
            </div>
          </div>

          {/* Eligibility Score & Instant Green Dispatch Highlight */}
          <div className="flex items-center gap-4">
            <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 ${scoreMeta.bg} ${scoreMeta.border}`}>
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Eligibility
                </span>
                <span className={`text-2xl font-black ${scoreMeta.text}`}>
                  {evaluation.eligibility_score}<span className="text-xs font-normal text-slate-500">/10</span>
                </span>
              </div>
              <div className="border-l border-slate-700/50 pl-3">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  {isApproved && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isReview && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  {isDeclined && <XCircle className="w-4 h-4 text-rose-400" />}
                  {scoreMeta.label}
                </div>
                <div className="text-[11px] text-slate-400 max-w-[210px] truncate">
                  {scoreMeta.recommendation}
                </div>
              </div>
            </div>

            {/* Quick Action */}
            {isApproved && (
              <button
                onClick={handleTriggerConfetti}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Dispatch Scout Now</span>
              </button>
            )}
          </div>
        </div>

        {/* Green Notification Highlight for Score >= 8 (As specified in prompt) */}
        {isApproved && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Automatic Approval Threshold Reached:</strong> Score {evaluation.eligibility_score}/10. Ready for instant Scout dispatch to {application.location}.
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-200">
              GREEN_DISPATCH_TRIGGERED
            </span>
          </div>
        )}
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Translation, Risk Analysis, Scout Checklist (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Luganda <-> English Translation Card */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-serif">
                <MessageSquare className="w-4 h-4 text-teal-400" />
                Client Request & Translation
              </h3>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Original Language: Luganda
              </span>
            </div>

            {/* Original Luganda */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs leading-relaxed space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Original Luganda Audio / Text Request</span>
                <span className="text-teal-400">Client Submission</span>
              </div>
              <p className="text-slate-200 italic font-medium">
                "{application.requestText}"
              </p>
            </div>

            {/* AI Translation */}
            <div className="p-3.5 rounded-xl bg-teal-950/20 border border-teal-500/20 text-xs leading-relaxed space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                AI Verified English Translation
              </div>
              <p className="text-teal-100">
                "{evaluation.translation}"
              </p>
            </div>
          </div>

          {/* Risk Analysis & Ddala Evaluation */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-serif">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Ddala Equipment Procurement & Growth Assessment
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Gemini 3.7 Flash Evaluation
              </span>
            </div>

            {/* Key Risk Indicators Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Asset Validity</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <Check className="w-3 h-3" /> Growth Asset
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cashflow Multiplier</span>
                <span className="text-xs font-bold text-teal-300 mt-0.5 block">
                  {cashflowCoverage}x Daily Coverage
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hub Proximity</span>
                <span className="text-xs font-bold text-slate-200 mt-0.5 block">
                  {application.hub} Suburb
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Trade History</span>
                <span className="text-xs font-bold text-amber-300 mt-0.5 block">
                  {application.trustScore >= 70 ? "Proven History" : "New Client (30)"}
                </span>
              </div>
            </div>

            {/* Analysis Rationale Text */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
              <div className="font-semibold text-slate-200">Executive Summary:</div>
              <p>{evaluation.analysis}</p>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                <strong>Super App Purchase History:</strong> {application.appHistory}
              </div>
            </div>
          </div>

          {/* City Scout Instructions & Fundi Power Check */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-serif">
                <UserCheck className="w-4 h-4 text-amber-400" />
                City Scout Mission Instructions & "Fundi" Check
              </h3>
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Mandatory Physical Visit
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-100 leading-relaxed space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <Zap className="w-3.5 h-3.5" />
                Field Rider Verification Protocol:
              </div>
              <p>{evaluation.scout_instruction}</p>
            </div>

            {/* Fundi specific requirements */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                Required Field Evidence Checklist:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <span>Confirm physical shop existence & signboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                  <span><strong>"Umeme" Check:</strong> Voltage & stable power meter</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <span>Photograph Original National ID card (NIRA)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <span>Confirm shop tenancy / landlord agreement</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Transparent Middleman Plan & Luganda Message (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Middleman Asset Financing Blueprint */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-serif">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Asset-Backed Middleman Plan
              </h3>
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                No Cash • Equipment Only
              </span>
            </div>

            {/* Asset Headline Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Physical Growth Asset</span>
                  <strong className="text-xs text-white block">{application.requestedAsset}</strong>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Asset Purchase Value</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {formatUGX(baseAssetCost)}
                </span>
              </div>
            </div>

            {/* Interactive Terms Adjuster */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-teal-400" />
                  Deposit & Duration Terms
                </span>
                <span className="text-[11px] text-teal-400 font-mono">
                  Deposit {customDepositPercent}% • {customWeeks} Weeks
                </span>
              </div>

              {/* Deposit Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Upfront Deposit</span>
                  <span className="font-bold text-slate-200 font-mono">{formatUGX(calculatedDeposit)} ({customDepositPercent}%)</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="5"
                  value={customDepositPercent}
                  onChange={(e) => setCustomDepositPercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Weeks Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Repayment Period</span>
                  <span className="font-bold text-slate-200 font-mono">{customWeeks} Weeks ({Math.round(customWeeks / 4.3)} Months)</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="36"
                  step="2"
                  value={customWeeks}
                  onChange={(e) => setCustomWeeks(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>
            </div>

            {/* Transparent Financial Breakdown */}
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Wholesale Asset Cost:</span>
                <span className="font-mono font-medium">{formatUGX(baseAssetCost)}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-400">
                <span className="flex items-center gap-1">
                  Transparent Middleman Markup:
                  <span className="text-[10px] text-emerald-400/70">(No hidden interest)</span>
                </span>
                <span className="font-mono font-bold">+{formatUGX(calculatedMarkup)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Client Upfront Deposit:</span>
                <span className="font-mono font-medium text-amber-300">-{formatUGX(calculatedDeposit)}</span>
              </div>
              <div className="pt-2 border-t border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-slate-300 block font-bold">Weekly Installment:</span>
                  <span className="text-[10px] text-slate-400">Every Monday via MoMo</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {formatUGX(calculatedWeekly)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    x {customWeeks} installments
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Polite Luganda Client Response Message Card */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-serif">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Polite Luganda Client Message
              </h3>
              <button
                onClick={handleSimulateAudio}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-teal-400 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                title="Play Audio Speech Simulation"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? "animate-pulse text-emerald-400" : ""}`} />
                <span>{isPlayingAudio ? "Playing..." : "Speak"}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans relative">
              <p className="whitespace-pre-line">
                {evaluation.client_message}
              </p>
            </div>

            {/* Message Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMessage}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
              >
                {copiedMessage ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Luganda Text</span>
                  </>
                )}
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(evaluation.client_message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
