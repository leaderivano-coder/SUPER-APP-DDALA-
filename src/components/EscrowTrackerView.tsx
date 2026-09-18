import React, { useState } from "react";
import { EscrowOrder, EscrowOrderStatus } from "../types";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  Clock,
  Truck,
  Building2,
  Phone,
  AlertCircle,
  KeyRound,
  FileText,
  UserCheck,
  Sparkles,
  TrendingDown,
  RefreshCw,
  Search,
} from "lucide-react";
import confetti from "canvas-confetti";

interface EscrowTrackerViewProps {
  orders: EscrowOrder[];
  onReleaseFunds: (orderId: string, otp: string) => void;
  onUpdateOrderStatus: (orderId: string, nextStatus: EscrowOrderStatus) => void;
  onCreateNewRequestTab: () => void;
}

export const EscrowTrackerView: React.FC<EscrowTrackerViewProps> = ({
  orders,
  onReleaseFunds,
  onUpdateOrderStatus,
  onCreateNewRequestTab,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    orders[0]?.id || ""
  );
  const [otpInputs, setOtpInputs] = useState<{ [orderId: string]: string }>({});
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const handleOtpChange = (orderId: string, val: string) => {
    setOtpInputs((prev) => ({ ...prev, [orderId]: val }));
  };

  const handleRelease = (orderId: string) => {
    const otp = otpInputs[orderId] || "1234";
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#14b8a6", "#3b82f6"],
    });
    onReleaseFunds(orderId, otp);
  };

  const filteredOrders = orders.filter((o) => {
    if (filterCategory !== "ALL" && o.category !== filterCategory) return false;
    if (
      searchQuery &&
      !o.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !o.clientName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !o.escrowRef.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getStatusDisplay = (status: EscrowOrderStatus) => {
    switch (status) {
      case "escrow_locked":
        return {
          label: "100% Escrow Vault Locked",
          color: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
          icon: <Lock className="w-3.5 h-3.5" />,
          step: 1,
        };
      case "scout_dispatched":
        return {
          label: "City Scout Dispatched",
          color: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
          icon: <Truck className="w-3.5 h-3.5" />,
          step: 2,
        };
      case "quality_inspected":
        return {
          label: "Inspection & Multimeter Passed",
          color: "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          step: 3,
        };
      case "in_transit":
        return {
          label: "Scout Escorting Delivery",
          color: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30",
          icon: <Truck className="w-3.5 h-3.5" />,
          step: 4,
        };
      case "delivered_and_tested":
        return {
          label: "Delivered & Verified (Enter PIN)",
          color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
          icon: <KeyRound className="w-3.5 h-3.5 animate-pulse" />,
          step: 5,
        };
      case "funds_released":
        return {
          label: "Funds Released (Complete)",
          color: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/50",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          step: 6,
        };
      case "dispute_refunded":
        return {
          label: "Dispute / 100% Refunded",
          color: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          step: 0,
        };
      default:
        return {
          label: status,
          color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
          icon: <Clock className="w-3.5 h-3.5" />,
          step: 1,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Protected Escrow
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-mono">
              UGX{" "}
              {orders
                .reduce((acc, curr) => acc + curr.magicPriceUgx, 0)
                .toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              100% Guaranteed Zero Scams
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Wholesale Saved
            </span>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
              +UGX{" "}
              {orders
                .reduce((acc, curr) => acc + curr.savingsUgx, 0)
                .toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Versus street broker rates
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Scout Missions
            </span>
            <div className="text-xl font-extrabold text-blue-600 dark:text-cyan-400 mt-0.5 font-mono">
              {orders.filter((o) => o.status !== "funds_released").length} In Progress
            </div>
            <span className="text-[10px] text-blue-700 dark:text-cyan-300">
              Scouts on field in Kampala
            </span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/30">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Orders List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-serif flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Escrow Orders</span>
            </h4>
            <span className="text-xs text-slate-500 font-mono">
              ({filteredOrders.length} orders)
            </span>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search orders, client, ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Categories</option>
              <option value="WHOLESALE_BULK">Wholesale Bulk</option>
              <option value="VETTED_FUNDI_SERVICE">Fundi Services</option>
              <option value="GROWTH_EQUIPMENT">Equipment</option>
              <option value="QUALITY_PRODUCT">Products</option>
            </select>
          </div>

          {/* List of Orders */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredOrders.map((order) => {
              const isSelected = order.id === activeOrder?.id;
              const statusInfo = getStatusDisplay(order.status);

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50/50 dark:bg-slate-900 border-emerald-500 ring-1 ring-emerald-500/40 shadow-xs"
                      : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                      {order.escrowRef}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusInfo.color}`}
                    >
                      {statusInfo.icon}
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight line-clamp-1">
                    {order.itemTitle}
                  </h5>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">
                      Buyer: <strong>{order.clientName}</strong>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      UGX {order.magicPriceUgx.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Order Details & PIN Release */}
        <div className="lg:col-span-7">
          {activeOrder ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
              {/* Order Top Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {activeOrder.escrowRef}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {activeOrder.createdAt}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif mt-0.5">
                    {activeOrder.itemTitle}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                    Escrow Vault Amount
                  </span>
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    UGX {activeOrder.magicPriceUgx.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Step Progress Visualizer */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Zero-Fraud Escrow Progress
                </span>

                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-500/30">
                    1. Money Locked
                  </div>
                  <div className={`p-2 rounded-xl border font-bold ${
                    activeOrder.status !== "escrow_locked"
                      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800"
                  }`}>
                    2. Scout Inspect
                  </div>
                  <div className={`p-2 rounded-xl border font-bold ${
                    activeOrder.status === "in_transit" || activeOrder.status === "delivered_and_tested" || activeOrder.status === "funds_released"
                      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800"
                  }`}>
                    3. Transit
                  </div>
                  <div className={`p-2 rounded-xl border font-bold ${
                    activeOrder.status === "funds_released"
                      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800"
                  }`}>
                    4. PIN Release
                  </div>
                </div>
              </div>

              {/* 4-Digit Release PIN Card */}
              {activeOrder.status !== "funds_released" ? (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-2 border-emerald-500/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Release Escrow Funds to Trader
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Inspect your goods, verify working condition, then enter your 4-digit PIN.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="Enter 4-Digit PIN (e.g. 1234)"
                      value={otpInputs[activeOrder.id] || ""}
                      onChange={(e) => handleOtpChange(activeOrder.id, e.target.value)}
                      className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono tracking-widest focus:outline-none focus:border-emerald-500 flex-1"
                    />

                    <button
                      onClick={() => handleRelease(activeOrder.id)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Release Money</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Transaction complete! Funds of UGX {(activeOrder.magicPriceUgx || 0).toLocaleString()} were securely released to {activeOrder.matchedProvider?.name || activeOrder.matchedProvider?.businessName || "Verified Provider"}.
                  </span>
                </div>
              )}

              {/* Order Log History */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Immutable Escrow Audit Trail
                </span>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {activeOrder.logs.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-start justify-between gap-3"
                    >
                      <span className="text-slate-800 dark:text-slate-200">{log.note}</span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
              Select an order to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
