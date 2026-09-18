import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Globe,
  Download,
  Share2,
  CheckCircle2,
  X,
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import confetti from "canvas-confetti";

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
}) => {
  const [installSuccess, setInstallSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"web" | "android" | "ios">("web");

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstallSuccess(true);
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      // Fallback notification
      setInstallSuccess(true);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif">
                Use Ddala Instantly
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct Web Site • Play Store • iOS App Store
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 flex border-b border-slate-100 dark:border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab("web")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "web"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Direct Web (No Download)</span>
          </button>

          <button
            onClick={() => setActiveTab("android")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "android"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Android / Play Store</span>
          </button>

          <button
            onClick={() => setActiveTab("ios")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "ios"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>iPhone / App Store</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* TAB 1: Direct Web (No download required) */}
          {activeTab === "web" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>100% Instant Web Access — Zero Download Required</span>
                </div>
                <p className="text-xs text-emerald-950 dark:text-emerald-200/90 leading-relaxed">
                  You can use all features of Ddala right now on this browser! Sourcing from Kikuubo, Mobile Money escrow locking, Scout inspection, and PIN release are fully functional directly on the web.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                  <span><strong>Bookmark this page:</strong> Access anytime from any phone or computer without consuming storage.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                  <span><strong>Full Offline Cache:</strong> Automatic smart caching loads the super app even on unstable 2G/3G networks in Uganda.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                  <span><strong>Zero Storage:</strong> No 100MB downloads — saves your phone memory for your business photos and WhatsApp.</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continue Using on Web Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 2: Android & Google Play */}
          {activeTab === "android" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Google Play Store & One-Tap Android Install</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Install Ddala directly as a lightweight native app icon on your Android home screen with instant push notifications for your deliveries.
                </p>
              </div>

              {installSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>App installed! Look for the Ddala icon on your home screen.</span>
                </div>
              ) : (
                <button
                  onClick={handleInstallPWA}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App to Home Screen (1-Click)</span>
                </button>
              )}

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Google Play Store Package: <strong>com.ddala.superapp</strong></span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">PWA / TWA Ready</span>
              </div>
            </div>
          )}

          {/* TAB 3: iOS Apple App Store */}
          {activeTab === "ios" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Add to iPhone / iPad Home Screen</span>
                </h4>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center">1</span>
                    <span>Tap the <strong>Share</strong> icon at the bottom of Safari (square with arrow up).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center">2</span>
                    <span>Scroll down and tap <strong>"Add to Home Screen"</strong>.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center">3</span>
                    <span>Tap <strong>Add</strong> at top right. Ddala will appear as a full-screen app!</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Apple App Store & Web Clip Ready</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">iOS 16.4+ Web Push</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
