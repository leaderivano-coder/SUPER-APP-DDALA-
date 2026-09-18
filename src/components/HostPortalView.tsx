import React, { useState } from "react";
import {
  EscrowOrder,
  EscrowOrderStatus,
  LoanApplication,
  VettedProvider,
} from "../types";
import { formatUGX } from "../utils/formatters";
import { VETTED_PROVIDERS_DIRECTORY } from "../data/mockScenarios";
import {
  Gauge,
  ShieldCheck,
  Zap,
  Lock,
  Building2,
  Users,
  Wallet,
  Play,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileCode2,
  Layers,
  ArrowRight,
  TrendingUp,
  Search,
} from "lucide-react";
import confetti from "canvas-confetti";

interface HostPortalViewProps {
  escrowOrders: EscrowOrder[];
  applications: LoanApplication[];
  onOpenSystemPrompt: () => void;
  onOpenNewEvaluation: () => void;
  onUpdateOrderStatus: (orderId: string, status: EscrowOrderStatus) => void;
  onSimulateOrder: (order: EscrowOrder) => void;
  onEmergencyRefund: (orderId: string) => void;
  onSelectApplication: (app: LoanApplication) => void;
  onSelectProviderForRequest: (provider: VettedProvider, prompt: string) => void;
}

export const HostPortalView: React.FC<HostPortalViewProps> = ({
  escrowOrders,
  applications,
  onOpenSystemPrompt,
  onOpenNewEvaluation,
  onUpdateOrderStatus,
  onSimulateOrder,
  onEmergencyRefund,
  onSelectApplication,
  onSelectProviderForRequest,
}) => {
  const [hostTab, setHostTab] = useState<"overview" | "sandbox" | "escrow_vault" | "merchants">("overview");
  const [simulationRunning, setSimulationRunning] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick stats calculation
  const totalLockedEscrow = escrowOrders
    .filter((o) => o.status !== "funds_released" && o.status !== "dispute_refunded")
    .reduce((acc, o) => acc + o.magicPriceUgx, 0);

  const totalSettledVolume = escrowOrders
    .filter((o) => o.status === "funds_released")
    .reduce((acc, o) => acc + o.magicPriceUgx, 0) + 18500000;

  const totalBuyerSavings = escrowOrders.reduce((acc, o) => acc + o.savingsUgx, 0) + 4200000;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Run interactive end-to-end sandbox simulations
  const handleRunSimulation = (scenarioType: "wholesale_kikuubo" | "katwe_umeme" | "fraud_blocked") => {
    setSimulationRunning(scenarioType);

    if (scenarioType === "wholesale_kikuubo") {
      setTimeout(() => {
        const simOrder: EscrowOrder = {
          id: `ORD-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
          requestText: "Simulated 10 Bags Kakira Sugar Wholesale Order from Kikuubo",
          category: "WHOLESALE_BULK",
          itemTitle: "10 Bags Kakira Sugar (50kg) Direct Wholesale",
          clientName: "Grace Babirye",
          clientPhone: "+256 701 445 921",
          location: "Nansana Nabweru Road",
          matchedProvider: VETTED_PROVIDERS_DIRECTORY[0],
          magicPriceUgx: 2150000,
          streetPriceUgx: 2750000,
          savingsUgx: 600000,
          status: "escrow_locked",
          escrowRef: `ESC-SIM-${Math.floor(10000 + Math.random() * 90000)}`,
          scoutName: "Ivan Musisi",
          scoutPhone: "+256 750 293 881",
          umemeChecked: false,
          antiCounterfeitPassed: true,
          createdAt: new Date().toISOString(),
          paymentMethod: "MTN Mobile Money",
          logs: [
            {
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              note: "Simulated: Buyer locked UGX 2,150,000 via MTN MoMo in Ddala Escrow.",
              actor: "System Simulation",
            },
            {
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              note: "Simulated: Scout Ivan assigned to Kikuubo Container 14.",
              actor: "Scout Dispatch",
            },
          ],
        };
        onSimulateOrder(simOrder);
        setSimulationRunning(null);
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        showToast("🚀 Simulated Kikuubo wholesale escrow lifecycle created!");
      }, 1000);
    } else if (scenarioType === "katwe_umeme") {
      setTimeout(() => {
        const simOrder: EscrowOrder = {
          id: `ORD-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
          requestText: "Simulated Heavy-Duty Corn Posho Mill Machine from Katwe",
          category: "GROWTH_EQUIPMENT",
          itemTitle: "Katwe Heavy-Duty 3-Phase Posho Mill (15HP Motor)",
          clientName: "Samuel Kigozi",
          clientPhone: "+256 782 119 402",
          location: "Makindye Luwafu",
          matchedProvider: VETTED_PROVIDERS_DIRECTORY[2],
          magicPriceUgx: 4800000,
          streetPriceUgx: 6200000,
          savingsUgx: 1400000,
          status: "quality_inspected",
          escrowRef: `ESC-SIM-${Math.floor(10000 + Math.random() * 90000)}`,
          scoutName: "Musa Kayondo",
          scoutPhone: "+256 772 884 103",
          umemeChecked: true,
          antiCounterfeitPassed: true,
          createdAt: new Date().toISOString(),
          paymentMethod: "Airtel Money",
          logs: [
            {
              timestamp: "10:15 AM",
              note: "UGX 4,800,000 locked in Ddala Escrow Vault.",
              actor: "Buyer",
            },
            {
              timestamp: "10:45 AM",
              note: "Scout Musa verified 415V 3-Phase voltage & copper winding coil at Katwe workshop.",
              actor: "Scout Tested",
            },
          ],
        };
        onSimulateOrder(simOrder);
        setSimulationRunning(null);
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        showToast("⚡ Simulated Katwe Umeme voltage-verified escrow created!");
      }, 1000);
    } else {
      setTimeout(() => {
        const simOrder: EscrowOrder = {
          id: `ORD-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
          requestText: "Simulated Counterfeit Singer Sewing Machine (Blocked by Scout)",
          category: "QUALITY_PRODUCT",
          itemTitle: "Fake Counterfeit Singer Machine (Blocked)",
          clientName: "Prossy Nalwanga",
          clientPhone: "+256 701 992 311",
          location: "Wakiso Town",
          matchedProvider: VETTED_PROVIDERS_DIRECTORY[3],
          magicPriceUgx: 850000,
          streetPriceUgx: 1200000,
          savingsUgx: 350000,
          status: "dispute_refunded",
          escrowRef: `ESC-SIM-${Math.floor(10000 + Math.random() * 90000)}`,
          scoutName: "Ivan Musisi",
          scoutPhone: "+256 750 293 881",
          umemeChecked: false,
          antiCounterfeitPassed: false,
          createdAt: new Date().toISOString(),
          paymentMethod: "MTN Mobile Money",
          logs: [
            {
              timestamp: "09:00 AM",
              note: "Buyer locked UGX 850,000 for sewing machine.",
              actor: "Buyer",
            },
            {
              timestamp: "09:25 AM",
              note: "Scout scanned serial - Hologram FAILED (Aluminium fake head). Order blocked.",
              actor: "Scout Block",
            },
            {
              timestamp: "09:27 AM",
              note: "100% Escrow Instant Refund issued to Buyer Mobile Money. Fraud stopped at 0%.",
              actor: "Ddala Escrow Shield",
            },
          ],
        };
        onSimulateOrder(simOrder);
        setSimulationRunning(null);
        showToast("🛡️ Zero-Fraud simulation: Fake item caught & 100% money refunded!");
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 p-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl border border-emerald-500 flex items-center gap-3 text-xs font-bold animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Host Command Center Header */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-blue-500/20 text-emerald-700 dark:text-blue-400 border border-emerald-300 dark:border-blue-500/30 flex items-center justify-center font-bold shrink-0">
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30 font-bold uppercase">
                  Platform Host & Ops Command
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Kampala Zero-Fraud Protocol
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-serif mt-0.5">
                My View: Platform Operations & Escrow Master Control
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Monitor live escrow vaults, run real-time simulations, and inspect system audit trails.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSystemPrompt}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileCode2 className="w-3.5 h-3.5 text-amber-500" />
              <span>System Prompt</span>
            </button>

            <button
              onClick={onOpenNewEvaluation}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Credit Evaluation</span>
            </button>
          </div>
        </div>

        {/* Host Sub-Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setHostTab("overview")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              hostTab === "overview"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            Overview & Metrics
          </button>

          <button
            onClick={() => setHostTab("sandbox")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              hostTab === "sandbox"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            Interactive Sandbox Simulation
          </button>

          <button
            onClick={() => setHostTab("escrow_vault")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              hostTab === "escrow_vault"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            Escrow Vault Audit ({escrowOrders.length})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Active Locked Escrow
          </span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
            UGX {totalLockedEscrow.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            100% Protected from fraud
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Settled Volume
          </span>
          <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 font-mono">
            UGX {totalSettledVolume.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Across 3,400+ orders
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Buyer Cash Saved
          </span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            +UGX {totalBuyerSavings.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
            Direct wholesale prices
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Fraud Incidents
          </span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            0.00%
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Zero fraud protocol active
          </span>
        </div>
      </div>

      {/* TAB 1: Overview */}
      {hostTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Kampala Wholesale Hub Sourcing Metrics</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Live direct pricing agreements and trader verifications by market hub:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Kikuubo Lane Wholesale</span>
                  <span className="text-slate-500">Sugar, cooking oil, flour & FMCG</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">22% Avg Savings</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Katwe Light Industrial</span>
                  <span className="text-slate-500">Posho mills, welding generators, wiring</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">28% Avg Savings</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Kiyembe Lane Hub</span>
                  <span className="text-slate-500">Industrial Jack sewing machines & textiles</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">25% Avg Savings</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>City Scout Field Network</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Active motorbike inspectors on the ground verifying orders in real time:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Musa Kayondo (KLA-SCOUT-042)</span>
                  <div className="text-slate-500">Katwe & Nansana Corridor</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                  Online & Active
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Ivan Musisi (KLA-SCOUT-019)</span>
                  <div className="text-slate-500">Kikuubo & Nakasero Corridor</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                  Online & Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Sandbox Simulation */}
      {hostTab === "sandbox" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif flex items-center gap-2">
              <Play className="w-5 h-5 text-amber-500" />
              <span>One-Click End-to-End Sandbox Simulation</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Click any scenario to instantly simulate how Ddala locks escrow, performs scout inspection, and protects buyer money.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleRunSimulation("wholesale_kikuubo")}
              disabled={!!simulationRunning}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-left space-y-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Scenario A</span>
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Kikuubo Wholesale Escrow</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                10 Bags Sugar wholesale lock via Mobile Money, saving UGX 600,000.
              </p>
              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pt-2 flex items-center gap-1">
                <span>Run Simulation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            <button
              onClick={() => handleRunSimulation("katwe_umeme")}
              disabled={!!simulationRunning}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left space-y-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">Scenario B</span>
                <Zap className="w-4 h-4 text-blue-500" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Katwe Posho Mill + Umeme Test</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Posho mill equipment escrow with on-site multimeter voltage testing.
              </p>
              <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 pt-2 flex items-center gap-1">
                <span>Run Simulation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            <button
              onClick={() => handleRunSimulation("fraud_blocked")}
              disabled={!!simulationRunning}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-rose-500 text-left space-y-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">Scenario C</span>
                <ShieldCheck className="w-4 h-4 text-rose-500" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Fake Item Blocked & 100% Refund</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Counterfeit item caught by Scout barcode scan. 100% instant refund.
              </p>
              <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 pt-2 flex items-center gap-1">
                <span>Run Simulation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Escrow Vault */}
      {hostTab === "escrow_vault" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">
              Master Escrow Vault Registry
            </h3>
            <span className="text-xs text-slate-500">
              {escrowOrders.length} live records
            </span>
          </div>

          <div className="space-y-2.5">
            {escrowOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{order.escrowRef}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{order.itemTitle}</span>
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Buyer: <strong>{order.clientName}</strong> • Provider: {order.matchedProvider?.businessName || order.matchedProvider?.name || "Verified Provider"} ({order.matchedProvider?.hub || "Kampala"})
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      UGX {order.magicPriceUgx.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-500">{order.status.replace(/_/g, " ")}</span>
                  </div>

                  {order.status !== "funds_released" && order.status !== "dispute_refunded" && (
                    <button
                      onClick={() => onEmergencyRefund(order.id)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 cursor-pointer"
                    >
                      Emergency Refund
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
