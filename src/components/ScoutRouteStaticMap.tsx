import React, { useState } from "react";
import {
  MapPin,
  Bike,
  Navigation,
  ExternalLink,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { VettedProvider } from "../types";

interface ScoutRouteStaticMapProps {
  scoutName?: string;
  scoutId?: string;
  provider?: VettedProvider | null;
  destinationName?: string;
}

// Hub coordinates in Kampala commercial clusters
const HUB_COORDINATES: Record<string, { lat: number; lng: number; name: string; landmark: string }> = {
  kikuubo: {
    lat: 0.3126,
    lng: 32.5740,
    name: "Kikuubo Wholesale Commercial Hub",
    landmark: "Kikuubo Lane, Opposite Qualicel Bus Terminal, Kampala",
  },
  katwe: {
    lat: 0.3015,
    lng: 32.5750,
    name: "Katwe Engineering & Machinery Hub",
    landmark: "Katwe Road, Metalwork Artisans Strip, Kampala",
  },
  kiyembe: {
    lat: 0.3138,
    lng: 32.5785,
    name: "Kiyembe Textiles & Tailoring Arcade",
    landmark: "Kiyembe Lane, Nakasero-Market Link, Kampala",
  },
  nakasero: {
    lat: 0.3163,
    lng: 32.5822,
    name: "Nakasero Commercial Centre",
    landmark: "Duster Street, Kampala Central",
  },
  nansana: {
    lat: 0.3644,
    lng: 32.5278,
    name: "Nansana Regional Outlet",
    landmark: "Hoima Road, Nansana West",
  },
  makindye: {
    lat: 0.2882,
    lng: 32.5880,
    name: "Makindye Depot",
    landmark: "Luwafu Road, Makindye",
  },
  default: {
    lat: 0.3140,
    lng: 32.5770,
    name: "Kampala Central Vetted Trader Hub",
    landmark: "William Street / Luwum Street Corridor, Kampala",
  },
};

// Scout Musa's active field patrol coordinate in Kampala Central
const SCOUT_CURRENT_POSITION = {
  lat: 0.3148,
  lng: 32.5802,
  name: "Current Scout GPS Position (Boda-Boda in Transit)",
  landmark: "En route near Luwum Street / Kampala Road intersection",
};

export const ScoutRouteStaticMap: React.FC<ScoutRouteStaticMapProps> = ({
  scoutName = "Musa (KLA-SCOUT-042)",
  scoutId = "KLA-SCOUT-042",
  provider,
  destinationName = "Kampala Central",
}) => {
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const [imageError, setImageError] = useState(false);

  // Determine hub coordinates based on provider physical landmark or location
  const providerLocationKey = (
    provider?.physicalLandmark ||
    provider?.hubLocation ||
    provider?.location ||
    ""
  ).toLowerCase();

  let hub = HUB_COORDINATES.default;
  if (providerLocationKey.includes("kikuubo")) hub = HUB_COORDINATES.kikuubo;
  else if (providerLocationKey.includes("katwe")) hub = HUB_COORDINATES.katwe;
  else if (providerLocationKey.includes("kiyembe")) hub = HUB_COORDINATES.kiyembe;
  else if (providerLocationKey.includes("nakasero")) hub = HUB_COORDINATES.nakasero;
  else if (providerLocationKey.includes("nansana")) hub = HUB_COORDINATES.nansana;
  else if (providerLocationKey.includes("makindye")) hub = HUB_COORDINATES.makindye;

  const scout = SCOUT_CURRENT_POSITION;

  // Approximate distance calculation between Scout and Hub (Haversine formula)
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const distanceKm = calculateDistanceKm(scout.lat, scout.lng, hub.lat, hub.lng);
  const etaMinutes = Math.max(3, Math.round(parseFloat(distanceKm) * 3.5 + 2));

  // Compute map center (midpoint between scout and provider hub)
  const centerLat = ((scout.lat + hub.lat) / 2).toFixed(5);
  const centerLng = ((scout.lng + hub.lng) / 2).toFixed(5);

  // Google Maps Static API URL parameters
  const apiKey = (import.meta as unknown as { env?: { VITE_GOOGLE_MAPS_API_KEY?: string } }).env?.VITE_GOOGLE_MAPS_API_KEY || "";
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=15&size=680x260&scale=2&maptype=${mapType}&markers=color:0xf59e0b%7Clabel:S%7C${scout.lat},${scout.lng}&markers=color:0x10b981%7Clabel:H%7C${hub.lat},${hub.lng}&path=color:0x2563ebcc%7Cweight:4%7C${scout.lat},${scout.lng}%7C${hub.lat},${hub.lng}${apiKey ? `&key=${apiKey}` : ""}&solution_id=gmp_mcp_codeassist_v1_aistudio`;

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${scout.lat},${scout.lng}&destination=${hub.lat},${hub.lng}&travelmode=two_wheeler`;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs space-y-3">
      {/* Header bar */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Bike className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                Live Field Dispatch & Proximity Radar
              </h4>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live GPS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Scout relative to {provider?.businessName || hub.name}
            </p>
          </div>
        </div>

        {/* Map Type toggle & Google Maps external link */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 rounded-lg p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setMapType("roadmap")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                mapType === "roadmap"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Roadmap
            </button>
            <button
              type="button"
              onClick={() => setMapType("satellite")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                mapType === "satellite"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Satellite
            </button>
          </div>

          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-slate-200 transition-colors"
            title="Open live navigation in Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Map Display Viewport */}
      <div className="relative mx-4 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 aspect-[16/7] min-h-[190px] flex items-center justify-center">
        {/* Attempt Static Map image first; if no key or error, display stylized Kampala Map Radar */}
        {!imageError && apiKey ? (
          <img
            src={staticMapUrl}
            alt="Google Maps Static View: Scout position to Provider Hub"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          /* High-Fidelity Kampala Urban Map Placeholder & Radar */
          <div className="w-full h-full relative bg-slate-950 overflow-hidden flex flex-col justify-between p-4 select-none">
            {/* Background Grid & Street Lines */}
            <svg
              className="absolute inset-0 w-full h-full opacity-35"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="street-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#street-grid)" />
              {/* Stylized Kampala Road Arteries */}
              <line x1="0" y1="35%" x2="100%" y2="65%" stroke="#059669" strokeWidth="2.5" strokeDasharray="6,4" />
              <line x1="20%" y1="0" x2="80%" y2="100%" stroke="#475569" strokeWidth="3" />
              <line x1="75%" y1="0" x2="25%" y2="100%" stroke="#475569" strokeWidth="2" />
              {/* Route connecting Scout (left) to Hub (right) */}
              <line
                x1="28%"
                y1="48%"
                x2="72%"
                y2="52%"
                stroke="#3b82f6"
                strokeWidth="4"
                strokeDasharray="4,4"
                className="animate-pulse"
              />
            </svg>

            {/* Top Info Badges */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-white text-[11px] font-mono backdrop-blur-md">
                <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span>Sector: Kampala Central District</span>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold font-mono">
                ETA: {etaMinutes} Mins ({distanceKm} km away)
              </div>
            </div>

            {/* Visual Markers inside Radar */}
            <div className="relative z-10 flex items-center justify-between px-10 my-auto">
              {/* Scout Marker (Orange 'S') */}
              <div className="flex flex-col items-center group">
                <div className="relative">
                  <span className="absolute -inset-2 rounded-full bg-amber-500/30 animate-ping" />
                  <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/40 border-2 border-white text-xs z-10 relative">
                    S
                  </div>
                </div>
                <div className="mt-1 px-2 py-0.5 rounded-md bg-slate-900/90 border border-amber-500/40 text-amber-300 text-[10px] font-bold whitespace-nowrap shadow-xs">
                  Scout Musa (Boda)
                </div>
                <span className="text-[9px] text-slate-400 font-mono">0.3148°N, 32.5802°E</span>
              </div>

              {/* Connecting Distance Indicator */}
              <div className="flex-1 mx-4 flex flex-col items-center">
                <div className="w-full flex items-center justify-center relative">
                  <div className="h-0.5 w-full bg-blue-500/40 border-t border-dashed border-blue-400" />
                  <span className="absolute bg-slate-900 border border-blue-500/60 px-2 py-0.5 rounded-full text-[10px] font-mono text-blue-300 font-bold">
                    {distanceKm} km
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 font-semibold">
                  Via Luwum St & Duster St
                </span>
              </div>

              {/* Provider Hub Marker (Green 'H') */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <span className="absolute -inset-1.5 rounded-full bg-emerald-500/25 animate-pulse" />
                  <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-600/40 border-2 border-white text-xs z-10 relative">
                    H
                  </div>
                </div>
                <div className="mt-1 px-2 py-0.5 rounded-md bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold whitespace-nowrap shadow-xs max-w-[140px] truncate">
                  {provider?.businessName || hub.name}
                </div>
                <span className="text-[9px] text-slate-400 font-mono">{hub.lat.toFixed(4)}°N, {hub.lng.toFixed(4)}°E</span>
              </div>
            </div>

            {/* Bottom Status Ticker */}
            <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3 h-3 text-emerald-400" />
                Target Hub: {provider?.physicalLandmark || hub.landmark}
              </span>
              <span className="text-slate-500">Google Maps Platform Static Preview</span>
            </div>
          </div>
        )}

        {/* Legend Overlay at Bottom Right */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-[10px] text-slate-300">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Scout Musa
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Vetted Hub
          </span>
        </div>
      </div>

      {/* Route Details & Dispatch Logistics Footer */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
              Assigned Scout Location
            </span>
            <p className="font-bold text-slate-900 dark:text-white truncate">
              {scout.landmark}
            </p>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
              GPS: {scout.lat}, {scout.lng}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
              Vetted Provider Hub
            </span>
            <p className="font-bold text-slate-900 dark:text-white truncate">
              {provider?.businessName || hub.name}
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
              GPS: {hub.lat}, {hub.lng} ({hub.landmark.split(",")[0]})
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-500">
                Transit Distance & ETA
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {etaMinutes} min ride
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-extrabold text-slate-900 dark:text-white">
                {distanceKm} km (Boda-Boda)
              </span>
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Navigate</span>
                <Navigation className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Mandatory Attribution Line for Google Maps Platform derived content */}
        <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center justify-between">
          <span>Static Route Visualization • Solution ID: gmp_mcp_codeassist_v1_aistudio</span>
          <span className="font-semibold text-slate-500 dark:text-slate-400">Google Maps</span>
        </div>
      </div>
    </div>
  );
};
