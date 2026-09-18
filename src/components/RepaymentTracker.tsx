import React, { useState } from "react";
import { LoanApplication, RepaymentItem } from "../types";
import { formatUGX, formatUGXShort, getHubColor } from "../utils/formatters";
import { 
  ShieldCheck, 
  TrendingUp, 
  Smartphone, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  UserCheck
} from "lucide-react";
import confetti from "canvas-confetti";

interface RepaymentTrackerProps {
  applications: LoanApplication[];
  onRecordPayment: (appId: string, repaymentId: string, provider: "MTN Mobile Money" | "Airtel Money") => void;
}

export const RepaymentTracker: React.FC<RepaymentTrackerProps> = ({
  applications,
  onRecordPayment,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(
    applications.find((a) => a.repayments && a.repayments.length > 0)?.id || applications[0]?.id || ""
  );
  const [activeProvider, setActiveProvider] = useState<"MTN Mobile Money" | "Airtel Money">("MTN Mobile Money");

  const selectedApp = applications.find((a) => a.id === selectedAppId);

  // Portfolio aggregates
  const totalAssetsFinanced = applications.reduce((sum, a) => {
    return sum + (a.evaluation?.proposed_plan.asset_value_ugx || a.estimatedAssetValueUgx);
  }, 0);

  const totalMarkupEarned = applications.reduce((sum, a) => {
    return sum + (a.evaluation?.proposed_plan.total_markup || 0);
  }, 0);

  const handlePayInstallment = (repaymentId: string) => {
    if (!selectedApp) return;
    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.7 },
      colors: ["#10b981", "#3b82f6"],
    });
    onRecordPayment(selectedApp.id, repaymentId, activeProvider);
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Top Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Capital Deployed
          </span>
          <div className="text-xl font-bold text-white font-mono">
            {formatUGXShort(totalAssetsFinanced)}
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3 h-3" /> 100% Asset-Backed Equipment
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Middleman Markup Pipeline
          </span>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {formatUGXShort(totalMarkupEarned)}
          </div>
          <span className="text-[10px] text-slate-400">
            Average 12.5% trade spread
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Collection Success Rate
          </span>
          <div className="text-xl font-bold text-teal-400 font-mono">
            97.8%
          </div>
          <span className="text-[10px] text-teal-300/80">
            MTN MoMo & Airtel Money API
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Default Rate (Asset Protected)
          </span>
          <div className="text-xl font-bold text-slate-200 font-mono">
            0.4%
          </div>
          <span className="text-[10px] text-amber-400">
            Recoverable via City Scout network
          </span>
        </div>
      </div>

      {/* Main Split: Client Selector on Left & Schedule on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Client List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-sm font-bold text-white font-serif flex items-center justify-between">
            <span>Financed Entrepreneurs</span>
            <span className="text-[11px] font-normal text-slate-400">{applications.length} Accounts</span>
          </h3>

          <div className="space-y-2">
            {applications.map((app) => {
              const isSelected = selectedAppId === app.id;
              const hasRepayments = app.repayments && app.repayments.length > 0;
              const weeklyInst = app.evaluation?.proposed_plan.weekly_installment || 0;

              return (
                <button
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-950/40 border-emerald-500/50 shadow-md"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-xs text-white truncate block">
                      {app.clientName}
                    </strong>
                    <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${getHubColor(app.hub)}`}>
                      {app.hub}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 truncate mt-1">
                    {app.requestedAsset}
                  </div>

                  <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400">Weekly Terms:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {weeklyInst > 0 ? `${formatUGX(weeklyInst)}/wk` : "Pending Terms"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Repayment Schedule & MoMo Simulator (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {selectedApp ? (
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-5">
              {/* Client Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{selectedApp.clientName}</h3>
                    <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {selectedApp.phone}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Equipment: <strong className="text-slate-200">{selectedApp.requestedAsset}</strong> • {selectedApp.location}
                  </p>
                </div>

                {/* Mobile Money Provider Selector */}
                <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto">
                  <button
                    onClick={() => setActiveProvider("MTN Mobile Money")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeProvider === "MTN Mobile Money"
                        ? "bg-amber-400 text-slate-950"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    MTN MoMo
                  </button>
                  <button
                    onClick={() => setActiveProvider("Airtel Money")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeProvider === "Airtel Money"
                        ? "bg-rose-500 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Airtel Money
                  </button>
                </div>
              </div>

              {/* Installments Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Weekly Installment Collection Schedule
                  </h4>
                  <span className="text-[11px] text-teal-400 font-mono">
                    Installment: {formatUGX(selectedApp.evaluation?.proposed_plan.weekly_installment || 65000)} / week
                  </span>
                </div>

                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {(selectedApp.repayments || []).map((rep) => {
                    const isPaid = rep.status === "paid";
                    return (
                      <div
                        key={rep.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                          isPaid
                            ? "bg-emerald-950/20 border-emerald-500/30 text-slate-300"
                            : "bg-slate-950/70 border-slate-800 text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                            isPaid ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
                          }`}>
                            W{rep.weekNumber}
                          </div>
                          <div>
                            <span className="font-semibold block text-slate-200">
                              Week {rep.weekNumber} Installment
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" /> Due: {rep.dueDate}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-mono font-bold text-slate-100">
                            {formatUGX(rep.amountUgx)}
                          </span>

                          {isPaid ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Paid via {rep.provider || "MoMo"}
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePayInstallment(rep.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                              <span>Simulate {activeProvider === "MTN Mobile Money" ? "MTN" : "Airtel"} Pay</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              Select an approved entrepreneur to view their repayment schedule.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
