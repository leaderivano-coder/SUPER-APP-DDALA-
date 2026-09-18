import React from "react";
import { LoanApplication } from "../types";
import { formatUGX, getHubColor } from "../utils/formatters";
import { 
  MapPin, 
  User, 
  Zap, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Camera, 
  AlertTriangle,
  Send,
  Plus
} from "lucide-react";

interface ScoutMissionListProps {
  applications: LoanApplication[];
  onDispatchScoutModal: (application: LoanApplication) => void;
}

export const ScoutMissionList: React.FC<ScoutMissionListProps> = ({
  applications,
  onDispatchScoutModal,
}) => {
  // Applications eligible for scout dispatch or already dispatched
  const eligibleOrActive = applications.filter(
    (a) => a.status === "approved_for_dispatch" || a.status === "scout_dispatched" || a.status === "scout_verified" || a.scoutMission
  );

  return (
    <div className="space-y-6">
      {/* Scout Ops Header */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white font-serif flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            City Scout Field Operations Command
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Physical premise verification, "Umeme" electrical checks, and National ID capture across Kampala suburbs
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>4 Active Riders on Ground</span>
          </div>
        </div>
      </div>

      {/* Grid of Missions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {eligibleOrActive.map((app) => {
          const mission = app.scoutMission;
          const isDispatched = !!mission;

          return (
            <div
              key={app.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
            >
              {/* Card Top */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{app.clientName}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${getHubColor(app.hub)}`}>
                      {app.hub} Hub
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{app.location}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  isDispatched 
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                }`}>
                  {isDispatched ? "Rider Dispatched" : "Ready for Dispatch"}
                </span>
              </div>

              {/* Equipment to Inspect */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Growth Asset Verification:</span>
                <div className="font-bold text-white flex items-center justify-between">
                  <span>{app.requestedAsset}</span>
                  <span className="text-emerald-400 font-mono">{formatUGX(app.estimatedAssetValueUgx)}</span>
                </div>
              </div>

              {/* Mission Details or Dispatch Trigger */}
              {isDispatched ? (
                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      Assigned Scout: <strong>{mission.scoutName}</strong>
                    </span>
                    <span className="text-[10px] text-slate-400">{mission.scoutPhone}</span>
                  </div>

                  {/* Checklist Status */}
                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 grid grid-cols-2 gap-1 text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> Shop Exists
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <Zap className="w-3 h-3" /> Umeme 220V Verified
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> National ID Photographed
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> Tenancy Confirmed
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    "{mission.checklist?.remarks || "Field visit completed successfully."}"
                  </p>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    Score {app.evaluation?.eligibility_score || 9}/10 • Auto-Approved
                  </span>
                  <button
                    onClick={() => onDispatchScoutModal(app)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Dispatch Scout</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
