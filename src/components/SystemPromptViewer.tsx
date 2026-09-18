import React, { useState } from "react";
import { 
  X, 
  Copy, 
  Check, 
  Terminal, 
  Code2, 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  Cpu,
  Layers,
  ArrowRight
} from "lucide-react";

interface SystemPromptViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemPromptViewer: React.FC<SystemPromptViewerProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"prompt" | "schema" | "code" | "philosophy">("prompt");
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const UNIVERSAL_SUPER_APP_PROMPT = `You are the AI Core of "The Super App (Ddala)" in Kampala, Uganda.
"Ddala" means "100% Real, Genuine & Authentic" in Luganda.

YOUR CORE MISSION:
1. "Just describe what you want": The user can describe ANY product, service, fundi (electrician, plumber, mechanic), machinery, bulk groceries, or daily need in Luganda, English, Swahili, or mixed local dialect.
2. "Eliminate Fraud to Zero":
   - Africa commerce is plagued by fake brokers, counterfeit electronics, ghost fundis, and bait-and-switch pricing.
   - You enforce Ddala's 4-Pillar Zero-Fraud Shield:
     1) Vetted Merchant & Fundi verification with physical shop landmarks and LC1 background checks.
     2) City Scout Physical Inspection & Escrow Hold (funds are NEVER released until physical verification passes).
     3) Anti-counterfeit serial check & Umeme (electrical stability) testing.
     4) Safe milestone escrow release.
3. "Magic Wholesale Price":
   - Compare typical street broker price (which has 25% to 50% arbitrary markup) with the direct Ddala Wholesale Magic Price sourced from Kampala primary trade hubs (Kikuubo for groceries, Katwe for metal/machinery, Kiyembe for tailoring/textiles, Nakasero for fresh produce, Nasser/Nkrumah for printing/tech).
   - Calculate exact UGX savings.
4. "Best Service Providers & Quality Sellers":
   - Match the user with top-tier vetted suppliers or master fundis in Kampala/Nansana/Makindye/Wakiso.
5. "Cultural Warmth":
   - Respond with polite Luganda greetings ("Tusanyukidde nnyo okukulaba", "Nnyabo", "Ssebo", "Ddala buli kimu kyetugamba kyakutuukirira") alongside clear English explanations.`;

  const SYSTEM_PROMPT_TEXT = `You are the Ddala Equipment Partner for "The Super App." Your role is to evaluate equipment procurement and growth asset orders from local entrepreneurs in Kampala, Nansana, Wakiso, and Makindye.

CORE PROCUREMENT PHILOSOPHY:
1. No Cash Loans: We never issue cash. We strictly buy the physical equipment (e.g., a fridge, sewing machine, arc welder, or solar panel) directly for the entrepreneur's shop. We are the trusted trade middleman.
2. Ddala Verification: You must ensure the requested equipment is a genuine "Growth Asset" (something that directly generates recurring daily income), not a luxury or personal consumer item.
3. The Scout's Role: A City Scout must physically visit the business location to verify the shop and inspect space/power before final equipment delivery.

EVALUATION LOGIC:
- Trust Score: 0-100. New users start at 30. Successful shopping orders increase the score.
- Capacity: Can they afford the weekly payment from their business revenue? (Daily profit should be at least 3x the daily installment equivalent).
- Location: Must be within Nansana, Makindye, Wakiso, or Kampala.
- The "Fundi" Requirement: For equipment involving electronics or high-power machinery (like commercial freezers, welders, hair dryers, posho mills), the AI will automatically instruct the Scout to check the "Umeme" (power stability/voltage meter) at the shop so equipment is safe from electrical damage.
- Transparent Middleman Markup: Instead of scary interest rates or loan fees, use a transparent "Middleman Trade Markup" (we buy at wholesale price and deliver on structured installment terms).
- Luganda Support: The AI automatically uses polite Luganda ("Nnyabo," "Ssebo," "Mwebale nnyo") to build trust with local business owners in Nansana, Wakiso, Makindye, and Kampala.`;


  const CODE_INTEGRATION_EXAMPLE = `// TypeScript / Node.js Backend Integration with @google/genai SDK
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
});

export async function evaluateOrderRequest(orderRequest) {
  const response = await ai.models.generateContent({
    model: "gemini-3.7-flash",
    contents: \`Client: \${orderRequest.clientName}
Location: \${orderRequest.location}
Business: \${orderRequest.businessType}
Request (Luganda): "\${orderRequest.requestText}"
App History: \${orderRequest.appHistory}\`,
    config: {
      systemInstruction: DDALA_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          translation: { type: Type.STRING },
          analysis: { type: Type.STRING },
          eligibility_score: { type: Type.INTEGER },
          proposed_plan: {
            type: Type.OBJECT,
            properties: {
              asset_value_ugx: { type: Type.INTEGER },
              deposit_ugx: { type: Type.INTEGER },
              weekly_installment: { type: Type.INTEGER },
              duration_weeks: { type: Type.INTEGER },
              total_markup: { type: Type.INTEGER }
            },
            required: ["asset_value_ugx", "deposit_ugx", "weekly_installment", "duration_weeks", "total_markup"]
          },
          scout_instruction: { type: Type.STRING },
          client_message: { type: Type.STRING }
        },
        required: ["translation", "analysis", "eligibility_score", "proposed_plan", "scout_instruction", "client_message"]
      }
    }
  });

  return JSON.parse(response.text);
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-serif">
                System Prompt & Architecture • Google AI Studio
              </h2>
              <p className="text-xs text-slate-400">
                Gemini 3.7 Flash Configuration for Asset-Backed Equipment Procurement
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-3 bg-slate-950/80 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab("prompt")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "prompt"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universal Super App Prompt</span>
          </button>

          <button
            onClick={() => setActiveTab("philosophy")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "philosophy"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Zero-Fraud & Wholesale Rules</span>
          </button>

          <button
            onClick={() => setActiveTab("code")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "code"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Production SDK Code</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {activeTab === "prompt" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Google AI Studio Universal System Prompt (Zero-Fraud & Magic Price):
                </span>
                <button
                  onClick={() => handleCopy(UNIVERSAL_SUPER_APP_PROMPT, "prompt")}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  {copied === "prompt" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Universal Prompt</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 leading-relaxed whitespace-pre-wrap selection:bg-emerald-500 selection:text-black">
                {UNIVERSAL_SUPER_APP_PROMPT}
              </div>

              <div className="pt-3 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Asset-Backed Equipment Partner Prompt (Procurement Mode):
                </span>
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 font-mono text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {SYSTEM_PROMPT_TEXT}
                </div>
              </div>
            </div>
          )}

          {activeTab === "philosophy" && (
            <div className="space-y-5 text-xs leading-relaxed text-slate-300">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <h3 className="text-sm font-bold text-emerald-300 font-serif flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Why Asset-Backed Microfinance Works in Kampala:
                </h3>
                <p>
                  Traditional cash micro-loans suffer from high diversion rates (money spent on emergencies or non-productive consumption). By purchasing the physical tool (freezer, sewing machine, welder, solar mill), the business immediately generates increased cash flow from Day 1 to service the installments.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-amber-400 font-bold block text-sm">1. The "Fundi" Rule</span>
                  <p className="text-slate-400">
                    For electronics and power equipment, the City Scout verifies stable 220V voltage and breaker wiring so the machinery operates safely without blowout.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-teal-400 font-bold block text-sm">2. Middleman Markup</span>
                  <p className="text-slate-400">
                    Transparent trade markup (e.g. buying at wholesale for 1.2M UGX, selling on installment for 1.35M UGX) replaces confusing compounding interest rates.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-emerald-400 font-bold block text-sm">3. Polite Luganda Native</span>
                  <p className="text-slate-400">
                    Respectful cultural salutations (Nnyabo, Ssebo, Mwebale nnyo) build high trust and long-term customer relationships in suburban markets.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "code" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Node.js / Express Server Integration Example:
                </span>
                <button
                  onClick={() => handleCopy(CODE_INTEGRATION_EXAMPLE, "code")}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  {copied === "code" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy TypeScript Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-teal-300 leading-relaxed whitespace-pre-wrap overflow-x-auto">
                {CODE_INTEGRATION_EXAMPLE}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Active Model: <strong>gemini-3.7-flash</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
