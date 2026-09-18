import React from "react";
import { 
  ShieldCheck, 
  Sparkles, 
  PlusCircle, 
  FileCode2, 
  Layers, 
  MapPin,
  ShoppingBag,
  Lock,
  Building2,
  Store,
  Sun,
  Moon,
  Smartphone,
  Download,
  Share2,
} from "lucide-react";

export type NavTab = "super_app" | "escrow_hub" | "vetted_directory" | "vendor_portal" | "applications" | "scouts";

interface HeaderProps {
  onNewApplication: () => void;
  onOpenSystemPrompt: () => void;
  onOpenAssetCatalog: () => void;
  onOpenInstallApp: () => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  applicationsCount: number;
  escrowOrdersCount: number;
  activeScoutMissionsCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewApplication,
  onOpenSystemPrompt,
  onOpenInstallApp,
  activeTab,
  setActiveTab,
  applicationsCount,
  escrowOrdersCount,
  activeScoutMissionsCount,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur sticky top-0 z-30 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div 
              className="relative cursor-pointer flex items-center gap-2.5" 
              onClick={() => setActiveTab("super_app")}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-black font-serif text-lg tracking-tight">
                D
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-bold text-slate-900 dark:text-white font-serif tracking-tight">
                    Ddala Super App
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                    Direct Wholesale
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Zero Fraud Escrow • Kikuubo • Katwe • Kiyembe
                </p>
              </div>
            </div>
          </div>

          {/* Clean Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 self-start md:self-auto overflow-x-auto max-w-full scrollbar-none">
            <button
              onClick={() => setActiveTab("super_app")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "super_app"
                  ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Describe & Request</span>
            </button>

            <button
              onClick={() => setActiveTab("escrow_hub")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "escrow_hub"
                  ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Escrow Tracker</span>
              {escrowOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-[10px] text-emerald-800 dark:text-emerald-300 font-bold font-mono">
                  {escrowOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("vetted_directory")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "vetted_directory"
                  ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Kampala Hubs</span>
            </button>

            <button
              onClick={() => setActiveTab("vendor_portal")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "vendor_portal"
                  ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Wholesaler / Vendor</span>
            </button>

            <button
              onClick={() => setActiveTab("applications")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "applications"
                  ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Equipment</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-900 text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                {applicationsCount}
              </span>
            </button>
          </div>

          {/* Quick Actions (Theme Toggle + App Store / Web Info + New Order) */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Theme Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
              title={isDarkMode ? "Switch to Bright Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Install / Web access button */}
            <button
              onClick={onOpenInstallApp}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Use direct on web or install to phone"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Use on Web / App Store</span>
            </button>

            {/* System Prompt */}
            <button
              onClick={onOpenSystemPrompt}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="System Prompt & Gemini API"
            >
              <FileCode2 className="w-4 h-4 text-amber-500" />
            </button>

            {/* New Asset Order */}
            <button
              onClick={onNewApplication}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Asset Order</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
