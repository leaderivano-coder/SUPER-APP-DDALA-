import React, { useState } from "react";
import {
  EscrowOrder,
  EscrowOrderStatus,
  VettedProvider,
  WholesaleInventoryItem,
} from "../types";
import { VETTED_PROVIDERS_DIRECTORY } from "../data/mockScenarios";
import {
  Store,
  Package,
  Wallet,
  ShieldCheck,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Bike,
  Phone,
  MapPin,
  TrendingUp,
  Sparkles,
  Plus,
  Zap,
  DollarSign,
  Search,
  Filter,
  Check,
  QrCode,
  Tag,
  AlertCircle,
  Receipt,
  FileCheck2,
} from "lucide-react";
import confetti from "canvas-confetti";

interface VendorPortalViewProps {
  escrowOrders: EscrowOrder[];
  onUpdateOrderStatus: (orderId: string, status: EscrowOrderStatus) => void;
  showToast?: (msg: string) => void;
}

const DEFAULT_INVENTORY_ITEMS: WholesaleInventoryItem[] = [
  {
    id: "SKU-KIK-001",
    name: "Kakira Pure White Sugar (50kg Bag) - UNBS Batch Sealed",
    hub: "Kikuubo Wholesale Hub",
    category: "Groceries & Bulk Commodities",
    wholesalePriceUgx: 215000,
    streetRetailPriceUgx: 255000,
    minOrderQty: 1,
    stockQty: 84,
    warranty: "Factory Sealed UNBS Batch Guarantee",
    unbsBatchVerified: true,
    status: "in_stock",
  },
  {
    id: "SKU-KIY-002",
    name: "Jack A4 Direct-Drive Computerized Industrial Sewing Machine",
    hub: "Kiyembe Machinery Hub",
    category: "Tailoring & Industrial Equipment",
    wholesalePriceUgx: 1350000,
    streetRetailPriceUgx: 1650000,
    minOrderQty: 1,
    stockQty: 14,
    warranty: "1 Year Official Jack Agency Warranty + Spare Parts",
    unbsBatchVerified: true,
    status: "in_stock",
  },
  {
    id: "SKU-KAT-003",
    name: "Heavy-Duty Inverter Arc Welding Machine (250 Amp) + Auto Mask",
    hub: "Katwe Light Industrial Zone",
    category: "Metalwork & Fabrication",
    wholesalePriceUgx: 750000,
    streetRetailPriceUgx: 950000,
    minOrderQty: 1,
    stockQty: 9,
    warranty: "6 Months Katwe Guild Free Servicing Guarantee",
    unbsBatchVerified: true,
    status: "in_stock",
  },
  {
    id: "SKU-SOL-004",
    name: "200Ah 12V Deep Cycle Solar Gel Battery (Tier-1 Quality)",
    hub: "Kampala Central (Luwum Street)",
    category: "Solar & Clean Energy",
    wholesalePriceUgx: 880000,
    streetRetailPriceUgx: 1100000,
    minOrderQty: 1,
    stockQty: 22,
    warranty: "2 Years Replacement Warranty with Serial Barcode",
    unbsBatchVerified: true,
    status: "in_stock",
  },
  {
    id: "SKU-NAK-005",
    name: "Commercial Drip Irrigation Complete Starter Kit (1 Acre)",
    hub: "Nakasero Agro Depot",
    category: "Agriculture & Seeds",
    wholesalePriceUgx: 620000,
    streetRetailPriceUgx: 820000,
    minOrderQty: 1,
    stockQty: 18,
    warranty: "UV-Treated Virgin Polyethylene Guarantee",
    unbsBatchVerified: true,
    status: "in_stock",
  },
  {
    id: "SKU-KAT-006",
    name: "Commercial Deep Freezer 260 Litres (Low Umeme Power Draw)",
    hub: "Katwe / Kampala",
    category: "Commercial Refrigeration",
    wholesalePriceUgx: 1200000,
    streetRetailPriceUgx: 1450000,
    minOrderQty: 1,
    stockQty: 6,
    warranty: "1 Year Compressor Guarantee",
    unbsBatchVerified: true,
    status: "in_stock",
  },
];

export const VendorPortalView: React.FC<VendorPortalViewProps> = ({
  escrowOrders,
  onUpdateOrderStatus,
  showToast,
}) => {
  const [selectedVendorIndex, setSelectedVendorIndex] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState<"orders" | "inventory" | "payouts" | "quick_quote">("orders");
  const [inventoryList, setInventoryList] = useState<WholesaleInventoryItem[]>(DEFAULT_INVENTORY_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  // New Item State
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Tailoring & Industrial Equipment");
  const [newItemWholesaleUgx, setNewItemWholesaleUgx] = useState("");
  const [newItemRetailUgx, setNewItemRetailUgx] = useState("");
  const [newItemStock, setNewItemStock] = useState("10");
  const [newItemWarranty, setNewItemWarranty] = useState("1 Year Official Warranty");

  // Quick Quote Generator State
  const [quoteItem, setQuoteItem] = useState("Jack A4 Industrial Sewing Machine");
  const [quoteWholesalePrice, setQuoteWholesalePrice] = useState(1350000);
  const [quoteStreetPrice, setQuoteStreetPrice] = useState(1650000);
  const [quoteClientPhone, setQuoteClientPhone] = useState("+256 701 459 882");
  const [quoteSent, setQuoteSent] = useState(false);

  const currentVendor = VETTED_PROVIDERS_DIRECTORY[selectedVendorIndex] || VETTED_PROVIDERS_DIRECTORY[0];

  // Filter orders matching this vendor or general direct orders
  const vendorOrders = escrowOrders.filter((order) => {
    return (
      order.matchedProvider?.id === currentVendor.id ||
      order.matchedProvider?.businessName === currentVendor.businessName ||
      order.matchedProvider?.hub.toLowerCase().includes(currentVendor.hub.toLowerCase().split("/")[0].trim())
    );
  });

  const displayOrders = vendorOrders.length > 0 ? vendorOrders : escrowOrders;

  // Financial calculations
  const totalVolumeUgx = displayOrders.reduce((sum, o) => sum + (o.magicPriceUgx || 0), 0) + 38500000;
  const lockedEscrowUgx = displayOrders
    .filter((o) => o.status !== "funds_released" && o.status !== "dispute_refunded")
    .reduce((sum, o) => sum + (o.magicPriceUgx || 0), 0);
  const releasedPayoutsUgx = totalVolumeUgx - lockedEscrowUgx;

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemWholesaleUgx) return;

    const wholesale = parseInt(newItemWholesaleUgx, 10) || 100000;
    const retail = parseInt(newItemRetailUgx, 10) || Math.round(wholesale * 1.25);

    const newItem: WholesaleInventoryItem = {
      id: `SKU-${Date.now().toString().slice(-4)}`,
      name: newItemName.trim(),
      hub: currentVendor.hub,
      category: newItemCategory,
      wholesalePriceUgx: wholesale,
      streetRetailPriceUgx: retail,
      minOrderQty: 1,
      stockQty: parseInt(newItemStock, 10) || 5,
      warranty: newItemWarranty,
      unbsBatchVerified: true,
      status: "in_stock",
    };

    setInventoryList([newItem, ...inventoryList]);
    setIsAddItemModalOpen(false);
    setNewItemName("");
    setNewItemWholesaleUgx("");
    setNewItemRetailUgx("");

    confetti({ particleCount: 50, spread: 60 });
    if (showToast) showToast(`✓ Added "${newItem.name}" to Wholesale Price Feed`);
  };

  const handleSendInstantQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSent(true);
    confetti({ particleCount: 40, spread: 50 });
    if (showToast) showToast(`✓ Direct Wholesale Quote dispatched to ${quoteClientPhone}`);
    setTimeout(() => setQuoteSent(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Active Wholesaler Switcher */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-900">
          <img
            src="/src/assets/images/wholesaler_vendor_counter_1788032583149.jpg"
            alt="Kampala Wholesale Vendor Counter"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-80 hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Store className="w-3.5 h-3.5" />
                  WHOLESALER & VENDOR PORTAL
                </span>
                <span className="text-xs font-bold text-emerald-300 bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
                  {currentVendor.hub}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-serif tracking-tight">
                {currentVendor.businessName}
              </h1>
            </div>

            {/* Vendor Switcher Dropdown */}
            <div className="bg-slate-950/90 border border-emerald-500/40 p-2 rounded-2xl backdrop-blur-md">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1 px-1">
                Switch Active Merchant Hub:
              </span>
              <select
                value={selectedVendorIndex}
                onChange={(e) => setSelectedVendorIndex(Number(e.target.value))}
                className="bg-slate-900 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
              >
                {VETTED_PROVIDERS_DIRECTORY.map((p, idx) => (
                  <option key={p.id} value={idx}>
                    {p.businessName} ({p.hub.split("/")[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Vendor Header Badges & Quick Stats */}
        <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                Total Volume
              </span>
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                UGX {totalVolumeUgx.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                +18.4% this month
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 shadow-2xs">
              <span className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Locked in Escrow
              </span>
              <div className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1 font-mono">
                UGX {lockedEscrowUgx.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                0% Chargeback Guaranteed
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-blue-500" />
                Instant MoMo Settled
              </span>
              <div className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 mt-1 font-mono">
                UGX {releasedPayoutsUgx.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                MTN & Airtel Direct Pay
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                Scout Pass Rate
              </span>
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                99.6% Genuine
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                ★ {currentVendor.rating} Rating
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">Store Owner: {currentVendor.name}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {currentVendor.physicalLandmark}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                {currentVendor.phone}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {currentVendor.verifiedBadges.slice(0, 2).map((b, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px] border border-emerald-200 dark:border-emerald-500/30"
                >
                  ✓ {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("orders")}
            className={`py-4 px-3 text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === "orders"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Incoming Escrow Orders</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 text-xs font-mono font-bold">
              {displayOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("inventory")}
            className={`py-4 px-3 text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === "inventory"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Wholesale Price Feed & Stock</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 text-xs font-mono font-bold">
              {inventoryList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("payouts")}
            className={`py-4 px-3 text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === "payouts"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Mobile Money Settlement Ledger</span>
          </button>

          <button
            onClick={() => setActiveSubTab("quick_quote")}
            className={`py-4 px-3 text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === "quick_quote"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Direct Wholesale Quotation Generator</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INCOMING ESCROW ORDERS */}
      {activeSubTab === "orders" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-serif">
                Orders with Guaranteed Escrow Funds
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Buyers have deposited funds into Ddala safe escrow. Prepare items for assigned scout pickup.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Upfront Funded</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {displayOrders.map((order) => {
              const isLocked = order.status === "escrow_locked";
              const isInspecting = order.status === "scout_dispatched" || order.status === "quality_inspected";
              const isInTransit = order.status === "in_transit" || order.status === "delivered_and_tested";
              const isReleased = order.status === "funds_released";

              return (
                <div
                  key={order.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-emerald-400 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
                          {order.id}
                        </span>
                        <span
                          className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                            isReleased
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                              : isLocked
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300"
                          }`}
                        >
                          {isReleased
                            ? "✓ Funds Released to MoMo"
                            : isLocked
                            ? "Escrow Locked • Awaiting Scout Pickup"
                            : isInspecting
                            ? "Scout Inspecting at Workshop"
                            : "In Transit to Buyer"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {order.itemTitle}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold uppercase text-slate-400">Wholesale Payout</span>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        UGX {(order.magicPriceUgx || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Buyer Details</span>
                      <div className="font-bold text-slate-900 dark:text-white">{order.clientName}</div>
                      <div className="text-slate-500">{order.location || "Kampala"}</div>
                      <div className="text-blue-600 font-mono">{order.clientPhone}</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Assigned Inspection Scout</span>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Bike className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{order.scoutName || "Scout Denis Kigozi"}</span>
                      </div>
                      <div className="text-slate-500">Boxer 150 (UDG 412X)</div>
                      <div className="text-blue-600 font-mono">{order.scoutPhone || "+256 701 559 881"}</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Escrow Security</span>
                      <div className="font-bold text-emerald-700 dark:text-emerald-400">
                        {isReleased ? "✓ Paid to MTN MoMo" : "✓ 100% Locked in Vault"}
                      </div>
                      <div className="text-slate-500 font-mono text-[11px]">Ref: {order.escrowRef}</div>
                      <div className="text-slate-500">Release Code: Client 4-Digit PIN</div>
                    </div>
                  </div>

                  {/* Vendor Action Bar */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>Order created {order.createdAt}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isLocked && (
                        <button
                          onClick={() => {
                            onUpdateOrderStatus(order.id, "scout_dispatched");
                            if (showToast) showToast(`✓ Package marked ready for Scout ${order.scoutName || "pickup"}`);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Mark Ready & Request Scout Pickup</span>
                        </button>
                      )}

                      {isInspecting && (
                        <button
                          onClick={() => {
                            onUpdateOrderStatus(order.id, "in_transit");
                            if (showToast) showToast("✓ Scout passed physical & electrical test. Order in transit.");
                          }}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Bike className="w-4 h-4" />
                          <span>Authorize Scout Dispatch to Buyer</span>
                        </button>
                      )}

                      {isReleased && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Payout Complete (MTN Mobile Money)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: WHOLESALE INVENTORY & PRICE FEED */}
      {activeSubTab === "inventory" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-serif">
                Wholesale Price Feed & Stock Management
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Direct importer prices streamed to customers. Eliminates broker markups.
              </p>
            </div>

            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Wholesale Product</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 shadow-2xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wholesale products, spare parts, serial numbers..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Inventory Table */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Item & Specification</th>
                    <th className="py-3 px-4">Category / Hub</th>
                    <th className="py-3 px-4">Direct Wholesale (UGX)</th>
                    <th className="py-3 px-4">Street Price (UGX)</th>
                    <th className="py-3 px-4">Buyer Savings</th>
                    <th className="py-3 px-4">In Stock</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {inventoryList
                    .filter((item) =>
                      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.category.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((item) => {
                      const savings = item.streetRetailPriceUgx - item.wholesalePriceUgx;
                      const savingsPct = Math.round((savings / item.streetRetailPriceUgx) * 100);

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{item.id}</span>
                              <span>•</span>
                              <span>{item.warranty}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block">{item.category}</span>
                            <span className="text-[11px] text-slate-400">{item.hub}</span>
                          </td>
                          <td className="py-4 px-4 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                            UGX {item.wholesalePriceUgx.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 font-mono text-slate-400 line-through">
                            UGX {item.streetRetailPriceUgx.toLocaleString()}
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-black text-[11px]">
                              SAVE {savingsPct}% (UGX {savings.toLocaleString()})
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {item.stockQty} Units
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] border border-emerald-300 dark:border-emerald-500/30">
                              ✓ In Stock
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MOBILE MONEY SETTLEMENT LEDGER */}
      {activeSubTab === "payouts" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-serif">
                Instant Mobile Money Payout Ledger
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                0% payment chargeback. Funds transfer instantly to your registered merchant account upon PIN entry.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-2 rounded-2xl border border-blue-200 dark:border-blue-800">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Registered MoMo: {currentVendor.phone} (Auto-Settled)</span>
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="space-y-3">
              {[
                {
                  ref: "MM-UGX-982134",
                  item: "Jack A4 Direct-Drive Computerized Industrial Sewing Machine",
                  client: "Namubiru Grace (Wakiso Town)",
                  amountUgx: 1350000,
                  time: "Today, 11:42 AM",
                  method: "MTN Mobile Money",
                  status: "Completed",
                },
                {
                  ref: "MM-UGX-982098",
                  item: "Heavy-Duty Inverter Arc Welding Machine (250 Amp)",
                  client: "Ssemwogerere John (Makindye Luwafu)",
                  amountUgx: 750000,
                  time: "Yesterday, 04:15 PM",
                  method: "Airtel Money",
                  status: "Completed",
                },
                {
                  ref: "MM-UGX-981870",
                  item: "5 Bags Kakira Pure Sugar (50kg Bulk Wholesale)",
                  client: "Nakato Sarah (Nansana West)",
                  amountUgx: 1075000,
                  time: "28 Aug 2026, 09:30 AM",
                  method: "MTN Mobile Money",
                  status: "Completed",
                },
                {
                  ref: "MM-UGX-981622",
                  item: "200Ah 12V Deep Cycle Solar Gel Battery (Tier-1 Quality)",
                  client: "Kato Francis (Bwaise)",
                  amountUgx: 880000,
                  time: "27 Aug 2026, 02:20 PM",
                  method: "MTN Mobile Money",
                  status: "Completed",
                },
              ].map((payout, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {payout.ref}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                        ✓ {payout.status}
                      </span>
                      <span className="text-slate-400 font-medium">{payout.method}</span>
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {payout.item}
                    </div>
                    <div className="text-slate-500">
                      Buyer: <strong>{payout.client}</strong> • {payout.time}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Net Settled Amount
                    </span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      +UGX {payout.amountUgx.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DIRECT WHOLESALE QUOTATION GENERATOR */}
      {activeSubTab === "quick_quote" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-serif">
              Instant Direct Quotation Generator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Create an instant wholesale quote link for buyers on WhatsApp or phone inquiries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quote Form */}
            <form onSubmit={handleSendInstantQuote} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>Configure Wholesale Quote</span>
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Item Description</label>
                <input
                  type="text"
                  value={quoteItem}
                  onChange={(e) => setQuoteItem(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Direct Wholesale Price (UGX)</label>
                  <input
                    type="number"
                    value={quoteWholesalePrice}
                    onChange={(e) => setQuoteWholesalePrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Street Benchmark Price (UGX)</label>
                  <input
                    type="number"
                    value={quoteStreetPrice}
                    onChange={(e) => setQuoteStreetPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-mono font-bold text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Customer Phone Number</label>
                <input
                  type="text"
                  value={quoteClientPhone}
                  onChange={(e) => setQuoteClientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Dispatch Wholesale Escrow Quote</span>
              </button>

              {quoteSent && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>SMS & WhatsApp Quote with 0% Escrow Link dispatched to {quoteClientPhone}!</span>
                </div>
              )}
            </form>

            {/* Preview Card */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono text-emerald-400 font-bold">DIGITAL QUOTE PREVIEW</span>
                  <span className="text-xs font-bold bg-emerald-600 px-2.5 py-0.5 rounded-full text-white">
                    0% Escrow Lock
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <span className="text-xs text-slate-400 block">Sender: {currentVendor.businessName}</span>
                  <h4 className="text-xl font-extrabold text-white">{quoteItem}</h4>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Direct Wholesale Price:</span>
                      <span className="text-base font-black text-emerald-400 font-mono">
                        UGX {quoteWholesalePrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Typical Street Price:</span>
                      <span className="text-xs font-bold text-slate-500 line-through font-mono">
                        UGX {quoteStreetPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-400">
                      <span>Buyer Instant Savings:</span>
                      <span>UGX {(quoteStreetPrice - quoteWholesalePrice).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 text-xs text-slate-400 space-y-1">
                <div>✓ Physical Scout inspection before pickup at {currentVendor.physicalLandmark}.</div>
                <div>✓ 4-digit PIN security release.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD WHOLESALE PRODUCT */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-600" />
                <span>Add Wholesale Product to Feed</span>
              </h3>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Product Title & Brand</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Jack A4 Direct Drive Sewing Machine"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-xs focus:outline-none"
                  >
                    <option>Tailoring & Industrial Equipment</option>
                    <option>Groceries & Bulk Commodities</option>
                    <option>Metalwork & Fabrication</option>
                    <option>Solar & Clean Energy</option>
                    <option>Agriculture & Seeds</option>
                    <option>Commercial Refrigeration</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Stock Count</label>
                  <input
                    type="number"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-emerald-700 dark:text-emerald-400">Direct Wholesale Price (UGX)</label>
                  <input
                    type="number"
                    required
                    value={newItemWholesaleUgx}
                    onChange={(e) => setNewItemWholesaleUgx(e.target.value)}
                    placeholder="1350000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-emerald-600 font-mono font-bold text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Street Benchmark Price (UGX)</label>
                  <input
                    type="number"
                    value={newItemRetailUgx}
                    onChange={(e) => setNewItemRetailUgx(e.target.value)}
                    placeholder="1650000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-400 font-mono font-bold text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Warranty & Quality Guarantee</label>
                <input
                  type="text"
                  value={newItemWarranty}
                  onChange={(e) => setNewItemWarranty(e.target.value)}
                  placeholder="1 Year Official Warranty + UNBS Batch Tested"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-xs focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md cursor-pointer"
                >
                  Save Product to Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
