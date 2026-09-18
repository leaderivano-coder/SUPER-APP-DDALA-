import React, { useState } from "react";
import {
  EscrowOrder,
  EscrowOrderStatus,
  LoanApplication,
} from "../types";
import { formatUGX } from "../utils/formatters";
import {
  Bike,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Camera,
  Scan,
  Smartphone,
  Phone,
  ArrowRight,
  Sparkles,
  Check,
  X,
  Clock,
  Lock,
  Wallet,
  Play,
  RotateCcw,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ScoutRouteStaticMap } from "./ScoutRouteStaticMap";

interface ScoutPortalViewProps {
  escrowOrders: EscrowOrder[];
  applications: LoanApplication[];
  onUpdateOrderStatus: (orderId: string, status: EscrowOrderStatus) => void;
  onRecordInspectionPass?: (orderId: string, notes: string) => void;
}

export const ScoutPortalView: React.FC<ScoutPortalViewProps> = ({
  escrowOrders,
  applications,
  onUpdateOrderStatus,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    escrowOrders[0]?.id || ""
  );
  const [activeTabFilter, setActiveTabFilter] = useState<"ALL" | "INSPECTION_PENDING" | "IN_TRANSIT" | "COMPLETED">("ALL");

  // Inspection tool state
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectionChecks, setInspectionChecks] = useState({
    lc1Confirmed: true,
    serialMatched: false,
    umemeTested: false,
    photoCaptured: false,
  });
  const [voltageReading, setVoltageReading] = useState<number | null>(null);
  const [serialCode, setSerialCode] = useState<string>("");
  const [inspectionNotes, setInspectionNotes] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [isTestingVoltage, setIsTestingVoltage] = useState(false);
  const [scoutEarnings, setScoutEarnings] = useState<number>(45000);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedOrder = escrowOrders.find((o) => o.id === selectedOrderId) || escrowOrders[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSimulateBarcodeScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const generatedCode = `DDL-GENUINE-OEM-${Math.floor(100000 + Math.random() * 900000)}`;
      setSerialCode(generatedCode);
      setInspectionChecks((prev) => ({ ...prev, serialMatched: true }));
      showToast("✅ Hologram & OEM Serial Verified: 100% Genuine");
    }, 1000);
  };

  const handleSimulateVoltageTest = () => {
    setIsTestingVoltage(true);
    setTimeout(() => {
      setIsTestingVoltage(false);
      const volt = 228 + Math.floor(Math.random() * 6);
      setVoltageReading(volt);
      setInspectionChecks((prev) => ({ ...prev, umemeTested: true }));
      showToast(`⚡ Umeme Multimeter reading: ${volt}V (Safe & Stable)`);
    }, 1000);
  };

  const handlePassInspection = (order: EscrowOrder) => {
    onUpdateOrderStatus(order.id, "quality_inspected");
    setScoutEarnings((prev) => prev + 15000);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#10b981", "#3b82f6"],
    });
    showToast("🎉 Mission Passed! Escrow status advanced to Quality Inspected.");
    setIsInspecting(false);
  };

  const handleFailInspection = (order: EscrowOrder) => {
    onUpdateOrderStatus(order.id, "disputed_rejected");
    showToast("⚠️ Inspection Failed. Order flagged & client escrow protected.");
    setIsInspecting(false);
  };

  const filteredOrders = escrowOrders.filter((order) => {
    if (activeTabFilter === "INSPECTION_PENDING") {
      return order.status === "scout_dispatched" || order.status === "escrow_locked";
    }
    if (activeTabFilter === "IN_TRANSIT") {
      return order.status === "quality_inspected" || order.status === "in_transit";
    }
    if (activeTabFilter === "COMPLETED") {
      return order.status === "funds_released";
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 p-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl border border-emerald-500 flex items-center gap-3 text-xs font-bold animate-bounce">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Scout Header Summary */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shrink-0">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-bold uppercase">
                  Active City Scout
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Rider ID: <strong>KLA-SCOUT-042 (Musa)</strong>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-serif mt-0.5">
                Field Inspection Terminal & Transit Escort
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                You are the physical shield preventing fraud in Kampala's markets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Today's Inspection Pay:
              </span>
              <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                UGX {scoutEarnings.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTabFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTabFilter === "ALL"
                ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            All Assigned ({escrowOrders.length})
          </button>
          <button
            onClick={() => setActiveTabFilter("INSPECTION_PENDING")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTabFilter === "INSPECTION_PENDING"
                ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            Pending Physical Check
          </button>
          <button
            onClick={() => setActiveTabFilter("IN_TRANSIT")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTabFilter === "IN_TRANSIT"
                ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            In Transit & Delivery
          </button>
        </div>
      </div>

      {/* Main Grid: Orders List vs Detailed Inspection Station */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Mission Queue */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Scout Mission Queue
            </h3>
            <span className="text-[11px] text-slate-500">
              {filteredOrders.length} order(s)
            </span>
          </div>

          <div className="space-y-2.5">
            {filteredOrders.map((order) => {
              const isSelected = order.id === (selectedOrder?.id || "");
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-white dark:bg-slate-900 border-amber-500 ring-1 ring-amber-500/50 shadow-md"
                      : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                        {order.id}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {order.status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {order.itemTitle}
                    </h4>

                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mt-2">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">From: {order.matchedProvider?.physicalLandmark || "Verified Kampala Hub"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">To: {order.location || "Buyer Location"} ({order.clientName})</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      UGX {(order.magicPriceUgx || 0).toLocaleString()}
                    </span>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      +15,000 UGX Fee
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Physical Field Inspection Station */}
        <div className="lg:col-span-7">
          {selectedOrder ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-600 dark:text-amber-400">
                    Active Inspection Station
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
                    {selectedOrder.itemTitle}
                  </h3>
                </div>

                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                  UGX {(selectedOrder.magicPriceUgx || 0).toLocaleString()} Escrowed
                </span>
              </div>

              {/* Trader & Client Contact Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Pick-up Workshop:</span>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedOrder.matchedProvider?.businessName || selectedOrder.matchedProvider?.name || "Verified Trader Workshop"}</div>
                  <div className="text-slate-600 dark:text-slate-400">{selectedOrder.matchedProvider?.physicalLandmark || "Kampala Primary Hub"}</div>
                  <div className="text-blue-600 dark:text-blue-400 font-mono font-medium">{selectedOrder.matchedProvider?.phone || "+256 700 000 000"}</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Buyer & Delivery:</span>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedOrder.clientName}</div>
                  <div className="text-slate-600 dark:text-slate-400">{selectedOrder.location || "Kampala"}</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">Locked in Safe Escrow</div>
                </div>
              </div>

              {/* Static Map View: Current Scout Location Relative to Vetted Provider Hub */}
              <ScoutRouteStaticMap
                scoutName="Musa (KLA-SCOUT-042)"
                scoutId="KLA-SCOUT-042"
                provider={selectedOrder.matchedProvider}
                destinationName={selectedOrder.location}
              />

              {/* Interactive Inspection Checklist */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Mandatory Scout Physical Inspection Protocol</span>
                </h4>

                <div className="space-y-2 text-xs">
                  {/* Step 1: LC1 Landmark Confirmation */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-slate-800 dark:text-slate-200">Physical Stall & LC1 Verified</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Confirmed</span>
                  </div>

                  {/* Step 2: OEM Serial / Hologram Scan */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      {inspectionChecks.serialMatched ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Scan className="w-4 h-4 text-amber-500" />
                      )}
                      <span className="text-slate-800 dark:text-slate-200">
                        {serialCode || "Anti-Counterfeit Barcode & Hologram"}
                      </span>
                    </div>

                    <button
                      onClick={handleSimulateBarcodeScan}
                      disabled={isScanning}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-[11px] font-bold cursor-pointer transition-all"
                    >
                      {isScanning ? "Scanning..." : inspectionChecks.serialMatched ? "Re-scan" : "Scan Serial"}
                    </button>
                  </div>

                  {/* Step 3: Umeme Multimeter Voltage Test */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      {inspectionChecks.umemeTested ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Zap className="w-4 h-4 text-blue-500" />
                      )}
                      <span className="text-slate-800 dark:text-slate-200">
                        {voltageReading ? `Tested at ${voltageReading}V (Umeme Standard)` : "Umeme Voltage Multimeter Check"}
                      </span>
                    </div>

                    <button
                      onClick={handleSimulateVoltageTest}
                      disabled={isTestingVoltage}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30 text-[11px] font-bold cursor-pointer transition-all"
                    >
                      {isTestingVoltage ? "Measuring..." : inspectionChecks.umemeTested ? "Re-test" : "Run Voltage Test"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Decision Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => handleFailInspection(selectedOrder)}
                  className="flex-1 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold text-xs hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Reject (Counterfeit / Defective)</span>
                </button>

                <button
                  onClick={() => handlePassInspection(selectedOrder)}
                  className="flex-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Pass Inspection & Initiate Escort</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
              No orders selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
