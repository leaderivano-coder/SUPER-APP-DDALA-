import React from "react";
import { UserRole } from "../types";
import { 
  Smartphone, 
  Store,
  Bike, 
  Gauge,
  Sparkles,
} from "lucide-react";

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeEscrowsCount: number;
  scoutMissionsCount: number;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  onRoleChange,
  activeEscrowsCount,
  scoutMissionsCount,
}) => {
  const roles: {
    id: UserRole;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: "client",
      title: "Client View",
      subtitle: "Customer & Buyer App",
      icon: <Smartphone className="w-4 h-4" />,
    },
    {
      id: "vendor",
      title: "Vendor View",
      subtitle: "Wholesaler & Merchant Hub",
      icon: <Store className="w-4 h-4" />,
      badge: activeEscrowsCount > 0 ? `${activeEscrowsCount}` : undefined,
    },
    {
      id: "scout",
      title: "Scout View",
      subtitle: "Field Inspector Terminal",
      icon: <Bike className="w-4 h-4" />,
      badge: scoutMissionsCount > 0 ? `${scoutMissionsCount}` : undefined,
    },
    {
      id: "host",
      title: "Host View",
      subtitle: "Operations Command",
      icon: <Gauge className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800/80 px-4 py-2 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Mode:
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {currentRole === "client"
              ? "Customer Direct Sourcing & Escrow"
              : currentRole === "vendor"
              ? "Wholesaler / Vendor Portal • Kikuubo, Katwe, Kiyembe"
              : currentRole === "scout"
              ? "Field Inspection & Motorbike Escort"
              : "Host & Operations Command Center"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-x-auto">
          {roles.map((r) => {
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onRoleChange(r.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                {r.icon}
                <span>{r.title}</span>
                {r.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? "bg-white text-emerald-700" : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                  }`}>
                    {r.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
