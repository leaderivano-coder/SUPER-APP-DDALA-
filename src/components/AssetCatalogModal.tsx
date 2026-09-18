import React from "react";
import { 
  X, 
  ShoppingBag, 
  Check, 
  Zap, 
  ShieldCheck, 
  MapPin,
  TrendingUp,
  Award
} from "lucide-react";
import { formatUGX } from "../utils/formatters";

interface AssetCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset?: (assetName: string, valueUgx: number, category: string) => void;
}

export const AssetCatalogModal: React.FC<AssetCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectAsset,
}) => {
  if (!isOpen) return null;

  const CATALOG_ITEMS = [
    {
      name: "Commercial Chest Deep Freezer (260L - 350L)",
      category: "Refrigeration",
      estCostUgx: 1200000,
      dailyEarningImpact: "+35,000 - 55,000 UGX/day",
      suppliers: "Katwe Electronics & Industrial Area Kampala",
      fundiCheck: "Umeme voltage stabilizer (220V), grounding plug",
      typicalBusinesses: "Grocery shops, butcheries, milk dairies, bars",
    },
    {
      name: "Jack Direct-Drive Industrial Sewing Machine (A4)",
      category: "Tailoring & Textiles",
      estCostUgx: 1450000,
      dailyEarningImpact: "+30,000 - 60,000 UGX/day",
      suppliers: "Downtown Kampala Kiyembe Lane",
      fundiCheck: "Servo motor wiring, surge protector",
      typicalBusinesses: "Tailoring boutiques, uniform contractors, curtain makers",
    },
    {
      name: "Inverter Arc Welding Machine (250A) + Mask",
      category: "Metalwork & Fabrication",
      estCostUgx: 850000,
      dailyEarningImpact: "+60,000 - 100,000 UGX/day",
      suppliers: "Katwe Artisan Hardware Market",
      fundiCheck: "Phase breaker capacity (30A+), earth leakage breaker",
      typicalBusinesses: "Metal fabricators, window grill artisans, gate builders",
    },
    {
      name: "Executive Standing Hair Steamer & Hood Dryer Combo",
      category: "Salon & Beauty",
      estCostUgx: 950000,
      dailyEarningImpact: "+45,000 - 75,000 UGX/day",
      suppliers: "Nakasero & Owino Beauty Wholesalers",
      fundiCheck: "Water boiling thermal fuse & water grounding",
      typicalBusinesses: "Women's hair salons, executive barbershops",
    },
    {
      name: "Commercial Electric Posho Mill Motor (7.5HP)",
      category: "Agri-Processing",
      estCostUgx: 2400000,
      dailyEarningImpact: "+80,000 - 150,000 UGX/day",
      suppliers: "Industrial Area 6th Street",
      fundiCheck: "3-Phase industrial Umeme connection & starter switch",
      typicalBusinesses: "Maize millers, animal feeds processors",
    },
    {
      name: "Solar Powered Commercial DC Refrigerator (180L)",
      category: "Energy & Solar",
      estCostUgx: 1950000,
      dailyEarningImpact: "+40,000 - 70,000 UGX/day",
      suppliers: "Equatorial Solar Mall Kampala",
      fundiCheck: "Roof angle solar mount, Lithium battery safety enclosure",
      typicalBusinesses: "Off-grid rural Wakiso traders, roadside vendors",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-serif">
                Approved Growth Asset Catalog • Kampala Suburbs
              </h2>
              <p className="text-xs text-slate-400">
                Certified productive business tools eligible for Ddala Asset-Backed Financing
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

        {/* Catalog Grid */}
        <div className="p-6 max-h-[65vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATALOG_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    {item.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {formatUGX(item.estCostUgx)}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Target: <strong className="text-slate-300">{item.typicalBusinesses}</strong>
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Revenue Multiplier:
                  </span>
                  <span className="font-semibold text-emerald-300 font-mono text-[11px]">
                    {item.dailyEarningImpact}
                  </span>
                </div>

                <div className="flex items-start gap-1 text-[11px] text-amber-300/90 bg-amber-500/5 p-2 rounded-lg border border-amber-500/15">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Fundi Check:</strong> {item.fundiCheck}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Strictly No Cash Loans • Direct Procurement from Katwe & Kiyembe</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
