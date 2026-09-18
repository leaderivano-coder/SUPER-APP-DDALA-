import React, { useState } from "react";
import { LoanApplication } from "../types";
import { 
  X, 
  MapPin, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  Camera, 
  FileCheck, 
  User, 
  AlertTriangle,
  Send,
  Sparkles
} from "lucide-react";
import confetti from "canvas-confetti";

interface ScoutDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: LoanApplication | null;
  onSaveMission: (applicationId: string, missionData: any) => void;
}

export const ScoutDispatchModal: React.FC<ScoutDispatchModalProps> = ({
  isOpen,
  onClose,
  application,
  onSaveMission,
}) => {
  const [selectedScout, setSelectedScout] = useState<string>("Ivan Musisi (Makindye Hub)");
  const [scoutPhone, setScoutPhone] = useState<string>("+256 750 293 881");
  const [shopExists, setShopExists] = useState<boolean>(true);
  const [umemeStable, setUmemeStable] = useState<boolean>(true);
  const [nationalIdCaptured, setNationalIdCaptured] = useState<boolean>(true);
  const [premisesPhotoCaptured, setPremisesPhotoCaptured] = useState<boolean>(true);
  const [neighborConfirmed, setNeighborConfirmed] = useState<boolean>(true);
  const [fundiNeeded, setFundiNeeded] = useState<boolean>(
    application?.assetCategory === "Refrigeration" || 
    application?.assetCategory === "Metalwork & Fabrication"
  );
  const [scoutNotes, setScoutNotes] = useState<string>(
    "Shop verified at landmark. Umeme meter reading active with 220V stable phase. Client presented valid original NIRA National ID."
  );

  if (!isOpen || !application) return null;

  const SCOUTS_BY_HUB = [
    { name: "Ivan Musisi", hub: "Makindye Hub", phone: "+256 750 293 881" },
    { name: "Peter Ssempa", hub: "Nansana Hub", phone: "+256 701 884 120" },
    { name: "Kevin Nsubuga", hub: "Wakiso Hub", phone: "+256 774 390 192" },
    { name: "Hassan Kato", hub: "Kampala Central", phone: "+256 782 551 098" },
  ];

  const handleSelectScout = (scout: typeof SCOUTS_BY_HUB[0]) => {
    setSelectedScout(`${scout.name} (${scout.hub})`);
    setScoutPhone(scout.phone);
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const mission = {
      id: `MSN-${application.hub.toUpperCase().substring(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      applicationId: application.id,
      scoutName: selectedScout,
      scoutPhone,
      assignedHub: application.hub,
      dispatchedAt: new Date().toISOString(),
      status: "verified_passed",
      checklist: {
        shopExists,
        umemeStable,
        nationalIdCaptured,
        premisesPhotoCaptured,
        neighborConfirmed,
        remarks: scoutNotes,
      },
      fundiElectricianNeeded: fundiNeeded,
    };

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.5 },
      colors: ["#10b981", "#3b82f6", "#f59e0b"],
    });

    onSaveMission(application.id, mission);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-serif">
                Dispatch City Scout & Field Verification
              </h2>
              <p className="text-xs text-slate-400">
                Mandatory physical premise check for {application.clientName} ({application.hub})
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

        <form onSubmit={handleDispatch} className="p-6 space-y-5">
          {/* Target Location Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Target Business Landmark
              </span>
              <span className="text-emerald-400 font-medium font-mono">{application.id}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{application.location}</span>
            </div>
            <div className="text-xs text-slate-400">
              Asset to inspect space for: <strong className="text-slate-200">{application.requestedAsset}</strong>
            </div>
          </div>

          {/* Select Rider Scout */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Assign City Scout / Field Rider</label>
            <div className="grid grid-cols-2 gap-2">
              {SCOUTS_BY_HUB.map((scout) => {
                const isSelected = selectedScout.startsWith(scout.name);
                return (
                  <button
                    key={scout.name}
                    type="button"
                    onClick={() => handleSelectScout(scout)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-amber-950/40 border-amber-500/50 text-white"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <strong className="text-xs text-slate-200">{scout.name}</strong>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{scout.hub} • {scout.phone}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mandatory Field Verification Checklist */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Mandatory Scout Field Verification Checks</span>
              <span className="text-[10px] text-emerald-400 font-medium">All checks required for signoff</span>
            </label>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              {/* Check 1: Shop Exists */}
              <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shopExists}
                  onChange={(e) => setShopExists(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 accent-emerald-500"
                />
                <div>
                  <strong className="text-white block">1. Physical Shop / Workshop Verified</strong>
                  <span className="text-[11px] text-slate-400">
                    Signboard exists, business is active, verified with landlord/tenancy agreement.
                  </span>
                </div>
              </label>

              {/* Check 2: Umeme Power Stability Check */}
              <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={umemeStable}
                  onChange={(e) => setUmemeStable(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 accent-emerald-500"
                />
                <div>
                  <strong className="text-amber-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    2. "Umeme" Electricity & Power Stability Check
                  </strong>
                  <span className="text-[11px] text-slate-400 block">
                    Verified power supply, meter breaker, and surge protection so equipment won't blow up.
                  </span>
                </div>
              </label>

              {/* Check 3: National ID */}
              <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nationalIdCaptured}
                  onChange={(e) => setNationalIdCaptured(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 accent-emerald-500"
                />
                <div>
                  <strong className="text-white block">3. Original National ID (NIRA) Photographed</strong>
                  <span className="text-[11px] text-slate-400">
                    Front and back high-resolution photo with client portrait verification.
                  </span>
                </div>
              </label>

              {/* Check 4: Premises & Space */}
              <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={premisesPhotoCaptured}
                  onChange={(e) => setPremisesPhotoCaptured(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 accent-emerald-500"
                />
                <div>
                  <strong className="text-white block">4. Equipment Space & Ventilation Ready</strong>
                  <span className="text-[11px] text-slate-400">
                    Confirmed safe, secure space for delivery of {application.requestedAsset}.
                  </span>
                </div>
              </label>

              {/* Check 5: Neighbor Reference */}
              <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={neighborConfirmed}
                  onChange={(e) => setNeighborConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 accent-emerald-500"
                />
                <div>
                  <strong className="text-white block">5. Neighbor & LC1 Chair Confirmation</strong>
                  <span className="text-[11px] text-slate-400">
                    Adjacent shop owner confirms client has operated business here for 6+ months.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Scout Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Scout Field Remarks</label>
            <textarea
              rows={2}
              value={scoutNotes}
              onChange={(e) => setScoutNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4 fill-slate-950" />
              <span>Confirm & Dispatch Field Scout</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
