import React, { useState } from "react";
import { VettedProvider } from "../types";
import { VETTED_PROVIDERS_DIRECTORY } from "../data/mockScenarios";
import {
  Building2,
  ShieldCheck,
  Phone,
  MapPin,
  CheckCircle2,
  Search,
  Lock,
  ArrowRight,
} from "lucide-react";

interface VettedDirectoryViewProps {
  onSelectProviderForRequest: (provider: VettedProvider, samplePrompt: string) => void;
}

export const VettedDirectoryView: React.FC<VettedDirectoryViewProps> = ({
  onSelectProviderForRequest,
}) => {
  const [selectedHub, setSelectedHub] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const HUBS = [
    { id: "ALL", label: "All Kampala Hubs" },
    { id: "Kikuubo", label: "Kikuubo (Wholesale Groceries)" },
    { id: "Katwe", label: "Katwe (Metal & Electricians)" },
    { id: "Kiyembe", label: "Kiyembe (Machinery & Textiles)" },
    { id: "Nakasero", label: "Nakasero (Agro & Produce)" },
    { id: "Nansana", label: "Nansana / Wakiso Hub" },
    { id: "Makindye", label: "Makindye / Luwafu" },
  ];

  const filteredProviders = VETTED_PROVIDERS_DIRECTORY.filter((p) => {
    if (selectedHub !== "ALL" && !p.hub.toLowerCase().includes(selectedHub.toLowerCase())) {
      return false;
    }
    if (
      searchQuery &&
      !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.businessName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.roleOrCategory.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.physicalLandmark.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getSamplePrompt = (provider: VettedProvider) => {
    if (provider.badgeType === "Wholesale Primary") {
      return `Njagala kufuna wholesale bulk order okuva mu dduuka lya ${provider.businessName} e ${provider.hub} ku bbeeyi ya wansi ddala.`;
    } else if (provider.badgeType === "Master Fundi" || provider.badgeType === "Certified Technician") {
      return `Nnoonya Master Fundi ${provider.name} okuva e ${provider.hub} akole audit n'omulimu ogw'amasannyalaze/plumbing ogw'omulembe.`;
    } else {
      return `Nnoonya ekyuma original eky'omulembe okuva mu sitoolo ya ${provider.businessName} e ${provider.hub} ne warranty y'omwaka mulamba.`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Directory Header Banner */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40">
                100% Physically Inspected Registry
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Zero Ghost Merchants
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-serif tracking-tight">
              Kampala Primary Hubs & Master Fundi Directory
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Every merchant & fundi in this network has an active physical workshop or stall, verified LC1 business license, and direct tier-1 wholesale pricing agreement with Ddala.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                6 Verified Primary Hubs
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                3,400+ Zero-Fraud Deliveries
              </span>
            </div>
          </div>
        </div>

        {/* Hub Filter Chips & Search Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, item, shop name, or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {HUBS.map((hub) => (
              <button
                key={hub.id}
                onClick={() => setSelectedHub(hub.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedHub === hub.id
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {hub.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-2xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0">
                    {provider.initials || "DP"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {provider.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {provider.businessName}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                    ★ {provider.rating.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {provider.completedJobs} jobs
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 my-3">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{provider.physicalLandmark} ({provider.hub})</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>{provider.phone}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {provider.verifiedBadges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{badge}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Warranty: {provider.warrantyPeriod}
              </span>

              <button
                onClick={() => onSelectProviderForRequest(provider, getSamplePrompt(provider))}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Request at Wholesale</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
