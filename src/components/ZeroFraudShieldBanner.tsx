import React, { useState } from "react";
import {
  ShieldCheck,
  Building2,
  CheckCircle,
  Cpu,
  Lock,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";

export const ZeroFraudShieldBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const PILLARS = [
    {
      number: "01",
      title: "Physical Landmark & LC1 Registry",
      short: "Every seller & fundi has a scout-verified physical shop with LC1 verification.",
      details: "No ghost numbers or anonymous brokers. Our City Scouts visit the physical stall/workshop, capture GPS coordinates, and confirm trade legitimacy.",
      icon: <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      badge: "Zero Ghost Sellers",
    },
    {
      number: "02",
      title: "100% Locked Escrow Protection",
      short: "Money is never released until the product/job is physically verified on-site.",
      details: "Buyer funds stay locked safely in the Ddala Escrow Vault. Funds are only disbursed when you input your personal 4-digit PIN after testing.",
      icon: <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      badge: "Risk-Free Escrow",
    },
    {
      number: "03",
      title: "Anti-Counterfeit & Voltage Test",
      short: "Mandatory serial checks, barcode scans, and electrical phase testing.",
      details: "For electronics, sewing machines, freezers, and welders: Scouts scan manufacturer hologram serials and test voltage to prevent burnt motors.",
      icon: <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      badge: "Anti-Counterfeit Seal",
    },
    {
      number: "04",
      title: "Magic Wholesale Price Guarantee",
      short: "Direct sourcing from Kikuubo, Katwe, Kiyembe & Nakasero primary hubs.",
      details: "By connecting buyers directly to tier-1 importers and master artisans, we strip away 3-4 layers of street broker commissions, saving 20% to 45%.",
      icon: <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      badge: "Wholesale Direct",
    },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-serif">
                Ddala 4-Pillar Zero-Fraud Protocol
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 font-bold uppercase">
                100% Genuine
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              How Ddala protects your money across Kampala, Nansana, Wakiso, and Makindye.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <span>{isExpanded ? "Hide Protocol" : "How Protection Works"}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        {PILLARS.map((pillar) => (
          <div
            key={pillar.number}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  {pillar.icon}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 font-mono">
                  {pillar.badge}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {pillar.title}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {isExpanded ? pillar.details : pillar.short}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
