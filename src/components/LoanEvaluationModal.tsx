import React, { useState } from "react";
import { PresetScenario, LoanApplication } from "../types";
import { PRESET_SCENARIOS } from "../data/mockScenarios";
import { 
  X, 
  Sparkles, 
  Zap, 
  MapPin, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  FileText
} from "lucide-react";
import { formatUGX } from "../utils/formatters";

interface LoanEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEvaluationComplete: (newApp: LoanApplication) => void;
}

export const LoanEvaluationModal: React.FC<LoanEvaluationModalProps> = ({
  isOpen,
  onClose,
  onEvaluationComplete,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("nakato-sarah");
  const [clientName, setClientName] = useState<string>("Nakato Sarah");
  const [location, setLocation] = useState<string>("Nansana West, near the mosque");
  const [hub, setHub] = useState<"Nansana" | "Makindye" | "Wakiso" | "Kampala">("Nansana");
  const [businessType, setBusinessType] = useState<string>("Retail grocery shop");
  const [requestedAsset, setRequestedAsset] = useState<string>("Commercial Deep Freezer (260 Litres)");
  const [assetCategory, setAssetCategory] = useState<LoanApplication["assetCategory"]>("Refrigeration");
  const [estimatedAssetValueUgx, setEstimatedAssetValueUgx] = useState<number>(1200000);
  const [dailyProfitUgx, setDailyProfitUgx] = useState<number>(40000);
  const [trustScore, setTrustScore] = useState<number>(85);
  const [appHistory, setAppHistory] = useState<string>(
    "Has successfully bought a Smart TV and 3 bags of rice through us last year."
  );
  const [requestText, setRequestText] = useState<string>(
    "Ssebo, nnoonya fridge (deep freezer) ey'ebintu ebinnyogoga nnyongere amagoba mu dduuka lyange. Nfuna amagoba nga 40,000 buli lunaku. Muyinza okunnyamba?"
  );
  const [phone, setPhone] = useState<string>("+256 701 459 882");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (scenario: PresetScenario) => {
    setSelectedPresetId(scenario.id);
    setClientName(scenario.clientName);
    setLocation(scenario.location);
    setHub(scenario.hub);
    setBusinessType(scenario.businessType);
    setRequestedAsset(scenario.requestedAsset);
    setAssetCategory(scenario.assetCategory);
    setEstimatedAssetValueUgx(scenario.estimatedAssetValueUgx);
    setDailyProfitUgx(scenario.dailyProfitUgx);
    setTrustScore(scenario.trustScore);
    setAppHistory(scenario.appHistory);
    setRequestText(scenario.requestText);
    setPhone(`+256 ${Math.floor(700000000 + Math.random() * 99999999)}`);
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/evaluate-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientName,
          location,
          hub,
          businessType,
          requestText,
          appHistory,
          dailyProfitUgx,
          trustScore,
          requestedAsset,
          estimatedAssetValueUgx,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Evaluation failed");
      }

      const evalResult = data.evaluation;
      const isApproved = evalResult.eligibility_score >= 8;
      const isReview = evalResult.eligibility_score >= 5 && evalResult.eligibility_score < 8;

      const newApp: LoanApplication = {
        id: `ORD-UGX-2026-${Math.floor(100 + Math.random() * 900)}`,
        clientName,
        phone,
        location,
        hub,
        businessType,
        requestText,
        appHistory,
        trustScore,
        dailyProfitUgx,
        requestedAsset,
        assetCategory,
        estimatedAssetValueUgx,
        createdAt: new Date().toISOString(),
        status: isApproved ? "approved_for_dispatch" : isReview ? "under_review" : "declined",
        evaluation: evalResult,
        repayments: isApproved
          ? Array.from({ length: evalResult.proposed_plan.duration_weeks || 20 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() + (i + 1) * 7);
              return {
                id: `REP-${i + 1}`,
                weekNumber: i + 1,
                dueDate: d.toISOString().split("T")[0],
                amountUgx: evalResult.proposed_plan.weekly_installment,
                status: "upcoming" as const,
              };
            })
          : [],
      };

      onEvaluationComplete(newApp);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to evaluate with AI Growth Partner.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-serif">
                New Equipment Order • Ddala Asset Partner
              </h2>
              <p className="text-xs text-slate-400">
                Asset-Backed Evaluation powered by Gemini for Kampala micro-entrepreneurs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Scenarios Selector Bar */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              Quick-Load Preset Test Scenarios:
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Click to populate</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {PRESET_SCENARIOS.map((scenario) => {
              const isSelected = selectedPresetId === scenario.id;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => handleSelectPreset(scenario)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-950/40 border-emerald-500/50 text-white shadow-sm"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-xs truncate block text-slate-200">
                      {scenario.clientName}
                    </strong>
                    {scenario.isFlagshipScenario && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                        Prompt Case
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {scenario.requestedAsset} ({scenario.hub})
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleEvaluate} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Client Full Name</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Nakato Sarah"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Mobile Money Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                placeholder="e.g. +256 701 459 882"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Hub */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Primary Hub</label>
              <select
                value={hub}
                onChange={(e) => setHub(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Nansana">Nansana</option>
                <option value="Makindye">Makindye</option>
                <option value="Wakiso">Wakiso</option>
                <option value="Kampala">Kampala</option>
              </select>
            </div>

            {/* Location */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Physical Business Location (Landmark)
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Nansana West, near the mosque"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Business Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Business Type / Trade</label>
              <input
                type="text"
                required
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Retail grocery shop"
              />
            </div>

            {/* Requested Asset */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                Requested Physical Asset (Equipment)
              </label>
              <input
                type="text"
                required
                value={requestedAsset}
                onChange={(e) => setRequestedAsset(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Commercial Deep Freezer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Est Asset Value */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Wholesale Asset Value (UGX)</label>
              <input
                type="number"
                step="50000"
                required
                value={estimatedAssetValueUgx}
                onChange={(e) => setEstimatedAssetValueUgx(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Daily Profit */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-teal-400" />
                Estimated Daily Profit (UGX)
              </label>
              <input
                type="number"
                step="5000"
                required
                value={dailyProfitUgx}
                onChange={(e) => setDailyProfitUgx(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Trust Score */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                Trust Score (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={trustScore}
                onChange={(e) => setTrustScore(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* App History */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">The Super App Shopping & Order History</label>
            <input
              type="text"
              value={appHistory}
              onChange={(e) => setAppHistory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Has successfully bought a Smart TV and 3 bags of rice through us last year."
            />
          </div>

          {/* Client Request Text in Luganda or English */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Client Request (Luganda, English, or mixed)</span>
              <span className="text-[10px] text-teal-400">Natural voice / text submission</span>
            </label>
            <textarea
              rows={3}
              required
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-sans"
              placeholder="e.g. Ssebo, nnoonya fridge ey'ebintu ebinnyogoga nnyongere amagoba mu dduuka lyange..."
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Evaluating with Gemini 3.7 Flash...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Evaluate Equipment Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
