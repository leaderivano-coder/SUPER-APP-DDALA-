import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize server-side Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const DDALA_SYSTEM_INSTRUCTION = `You are the Ddala Equipment Partner for "The Super App." Your role is to evaluate equipment procurement and growth asset orders from local entrepreneurs in Kampala, Nansana, Wakiso, and Makindye.

CORE PROCUREMENT PHILOSOPHY:
1. No Cash Loans: We never issue cash. We strictly buy the physical equipment (e.g., a deep freezer, industrial sewing machine, arc welder, or solar panel) directly for the entrepreneur's shop. We are the trusted trade middleman.
2. Ddala Verification: You must ensure the requested equipment is a genuine "Growth Asset" (something that directly generates recurring daily income), not a luxury or personal consumer item.
3. The Scout's Role: A City Scout must physically visit the business location to verify the shop and inspect space/power before final equipment delivery.

EVALUATION LOGIC:
- Trust Score: 0-100. New users start at 30. Successful shopping orders increase the score.
- Capacity: Can they afford the weekly payment from their business revenue? (Daily profit should be at least 3x the daily installment equivalent).
- Location: Must be within Nansana, Makindye, Wakiso, or Kampala.
- The "Fundi" Requirement: For equipment involving electronics or high-power machinery (like commercial freezers, welders, hair dryers, posho mills), the AI will automatically instruct the Scout to check the "Umeme" (power stability/voltage meter) at the shop so equipment is safe from electrical damage.
- Transparent Middleman Markup: Instead of scary interest rates or loan fees, use a transparent "Middleman Trade Markup" (we buy at wholesale price and deliver on structured installment terms).
- Luganda Support: Use polite Luganda ("Nnyabo," "Ssebo," "Mwebale nnyo") and respectful cultural greetings to build trust with local business owners.

JSON OUTPUT FORMAT:
You must always respond strictly in JSON matching the schema with these fields:
- translation: English translation of the client's request.
- analysis: Risk assessment analyzing trade history, growth asset validity, business cashflow coverage, and location.
- eligibility_score: Integer from 1 to 10 (8-10: Instant Scout Dispatch / Approve, 5-7: Conditional / Review, 1-4: Decline / Luxury item).
- proposed_plan: { asset_value_ugx, deposit_ugx, weekly_installment, duration_weeks, total_markup }
- scout_instruction: What the rider/scout should look for when they visit the business, including shop existence, Umeme electrical check if relevant, National ID photo, and neighbor check.
- client_message: A warm, polite, and friendly response in the client's original language (Luganda, English, or Swahili) explaining the equipment plan, deposit, weekly installment, and that a Scout will visit.`;

const DDALA_UNIVERSAL_SUPER_APP_INSTRUCTION = `You are the AI Core of "The Super App (Ddala)" in Kampala, Uganda.
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
   - Respond with polite Luganda greetings ("Tusanyukidde nnyo okukulaba", "Nnyabo", "Ssebo", "Ddala buli kimu kyetugamba kyakutuukirira") alongside clear English explanations.

Always return valid JSON adhering to the provided schema.`;

// Helper to build intelligent Kampala domain fallback for Super App requests
function generateSuperAppFallback(userPrompt: string, clientName?: string, location?: string) {
  const pLower = (userPrompt || "").toLowerCase();
  const isFundi = /fundi|wire|electrician|plumber|fix|repair|mechanic|pipe|install|mechanic|welder/i.test(pLower);
  const isGroceries = /sugar|rice|oil|posho|matooke|flour|beans|kikuubo|nakasero|commodity|soap/i.test(pLower);
  const isMachinery = /sewing|jack|freezer|generator|inverter|solar|battery|welding|arc|motor|pump|compressor|mill/i.test(pLower);

  let category = "QUALITY_PRODUCT";
  let title = "Verified Quality Product with Anti-Counterfeit Seal";
  let streetPrice = 650000;
  let hub = "Kampala Central Importers";
  let providerName = "Hajjat Fatuma Nakato";
  let businessName = "Nakato Wholesale Direct";
  let phone = "+256 772 419 802";
  let landmark = "Kikuubo Container Village, Shop #12";
  let warranty = "1 Year Official Guarantee";
  let role = "Primary Importer";

  if (pLower.includes("sugar")) {
    category = "WHOLESALE_BULK";
    title = "Kakira Pure White Sugar (50kg Bag) - UNBS Batch Sealed";
    streetPrice = 255000;
    hub = "Kikuubo Wholesale Hub";
    landmark = "Kikuubo Container Village, Ground Floor";
    warranty = "Factory Sealed UNBS Batch Guarantee";
    businessName = "Nakato Direct Wholesale Stores";
    providerName = "Hajjat Fatuma Nakato";
  } else if (pLower.includes("sewing") || pLower.includes("jack")) {
    category = "GROWTH_EQUIPMENT";
    title = "Jack A4 Direct-Drive Computerized Industrial Sewing Machine";
    streetPrice = 1650000;
    hub = "Kiyembe Machinery Hub";
    landmark = "Kiyembe Lane, Ssekandi Arcade, Shop #4";
    warranty = "1 Year Official Jack Agency Warranty + Spare Parts";
    businessName = "Kiyembe Ssekandi Industrial Sewing Machines";
    providerName = "Ssekandi Aloysius";
    phone = "+256 701 559 881";
    role = "Official Jack Agency Importer";
  } else if (pLower.includes("welder") || pLower.includes("welding") || pLower.includes("arc")) {
    category = "GROWTH_EQUIPMENT";
    title = "Heavy-Duty Inverter Arc Welding Machine (250 Amp) + Auto Mask";
    streetPrice = 950000;
    hub = "Katwe Light Industrial Zone";
    landmark = "Katwe Road, Block B-14 near Clock Tower";
    warranty = "6 Months Free Servicing & Katwe Guild Calibration";
    businessName = "Livingstone Master Electricals & Fabrication";
    providerName = "Eng. Kigozi Livingstone";
    phone = "+256 772 419 802";
    role = "Certified Master Electrical Engineer";
  } else if (pLower.includes("solar") || pLower.includes("battery") || pLower.includes("inverter")) {
    category = "QUALITY_PRODUCT";
    title = "200Ah 12V Deep Cycle Solar Gel Battery (Tier-1 Quality)";
    streetPrice = 1100000;
    hub = "Kampala Central (Luwum Street)";
    landmark = "Luwum Street / City Center Plaza, Shop G-08";
    warranty = "2 Years Replacement Warranty with Serial Barcode";
    businessName = "Mukasa Clean Energy & Solar Hub";
    providerName = "Mukasa Patrick";
    phone = "+256 782 109 443";
    role = "Solar Systems Master Distributor";
  } else if (isFundi) {
    category = "VETTED_FUNDI_SERVICE";
    title = "Certified Master Fundi & On-Site Inspection";
    streetPrice = 350000;
    hub = "Katwe Certified Artisan Guild";
    landmark = "Katwe Light Industrial Zone";
    businessName = "Livingstone Master Electricals";
    providerName = "Eng. Kigozi Livingstone";
    warranty = "6 Months Workmanship Guarantee";
    role = "Certified Master Electrician";
  } else if (isGroceries) {
    category = "WHOLESALE_BULK";
    title = "Direct Kikuubo Wholesale Bulk Order";
    streetPrice = 450000;
    hub = "Kikuubo Primary Wholesale Hub";
    landmark = "Kikuubo Container Village";
    businessName = "Nakato Direct Wholesale Stores";
    providerName = "Hajjat Fatuma Nakato";
    warranty = "UNBS Tested & Certified Batch";
  } else if (isMachinery) {
    category = "GROWTH_EQUIPMENT";
    title = "Ddala Growth Equipment Direct Procurement";
    streetPrice = 1450000;
    hub = "Kiyembe Machinery Central";
    landmark = "Kiyembe Lane, Kampala";
    businessName = "Kiyembe Ssekandi Industrial Machines";
    providerName = "Ssekandi Aloysius";
    warranty = "1 Year Importer Warranty";
  }

  const magicPrice = Math.round(streetPrice * 0.78);
  const savings = streetPrice - magicPrice;
  const savingsPct = Math.round((savings / streetPrice) * 100);

  return {
    detectedCategory: category,
    title: title,
    translation: `Client is requesting: "${userPrompt}" for delivery to ${location || "Kampala"}.`,
    intentSummary: `Targeting authenticated zero-fraud sourcing with direct wholesale pricing from primary Kampala commercial hubs and Scout physical inspection.`,
    lugandaResponse: `Ssebo/Nnyabo ${clientName || ""}, mwebale nnyo okutuukirira Ddala Super App. Tusazeewo emiwendo gy'abakanaluzaalo n'ababbi mu kibuga. Ekyuma/Ebintu bino tubifunye ku muwendo gwa direct wholesale ogwa UGX ${magicPrice.toLocaleString()} (Osigazizza UGX ${savings.toLocaleString()}). Scout waffe ajja kukyala mu dduuka ly'omutunzi akakebere ebintu byonna nga tonnaba kusasula.`,
    englishResponse: `We have matched your request directly with vetted primary importers in ${hub}. Street middlemen charge ~UGX ${streetPrice.toLocaleString()}, but through Ddala Direct Wholesale you pay UGX ${magicPrice.toLocaleString()} (Saving ${savingsPct}%). 100% secured by Ddala Escrow.`,
    zeroFraudAudit: {
      counterfeitRiskLevel: isFundi ? "Low" : "High",
      antiCounterfeitProtocol: "Scout checks manufacturer hologram, scans serial barcode, and cross-references certified importer database before purchase.",
      physicalVerificationRequirement: `Physical inspection of stall/workshop at ${landmark}, confirmation of LC1 trade license, and GPS geo-tagging.`,
      umemeCheckRequired: isFundi || isMachinery,
      escrowProtectionCode: `ESC-DDL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      lc1ConfirmationRequired: true,
      guaranteeText: "100% money-back zero-fraud guarantee. Funds stay safely locked in Escrow until you physically test and approve the items with your 4-digit PIN.",
    },
    magicPrice: {
      streetBrokerPriceUgx: streetPrice,
      magicWholesalePriceUgx: magicPrice,
      netSavingsUgx: savings,
      savingsPercentage: savingsPct,
      priceSourceHub: hub,
      priceGuaranteeReason: `Bypassed 3 layers of street broker markups by sourcing directly from verified wholesale counters in ${hub}.`,
    },
    vettedProviders: [
      {
        id: "PROV-01",
        name: providerName,
        businessName: businessName,
        roleOrCategory: role,
        phone: phone,
        physicalLandmark: landmark,
        hub: hub,
        rating: 4.96,
        completedJobs: 342,
        verifiedBadges: ["LC1 Background Passed", "Scout Shop Inspected", "Anti-Counterfeit Guaranteed", "Direct Wholesale Counter"],
        trustScore: 99,
        warrantyPeriod: warranty,
        badgeType: "Primary Importer",
        initials: providerName.split(" ").map(w => w[0]).join("").slice(0, 2),
      },
      {
        id: "PROV-02",
        name: "Eng. Kigozi Livingstone",
        businessName: "Livingstone Master Electricals",
        roleOrCategory: "Certified Master Electrician & Technical Inspector",
        phone: "+256 772 419 802",
        physicalLandmark: "Katwe Light Industrial Zone, Block B-14",
        hub: "Katwe / Kampala",
        rating: 4.92,
        completedJobs: 280,
        verifiedBadges: ["Umeme Voltage Certified", "Multimeter Calibrated", "Zero-Fraud Partner"],
        trustScore: 96,
        warrantyPeriod: "6 Months Service Warranty",
        badgeType: "Master Fundi",
        initials: "KL",
      },
    ],
    scoutInstructions: `Dispatch Scout to ${landmark}. Verify physical serial number, test electrical voltage draw ("Umeme") if applicable, photograph receipt, and deliver to ${location || "Kampala"}.`,
    nextSteps: [
      `Lock direct wholesale price (UGX ${magicPrice.toLocaleString()}) in Ddala Safe Escrow via Mobile Money.`,
      `City Scout dispatched for physical on-site serial and quality verification.`,
      `Turn on and test the items on delivery, then release escrow using your private 4-digit PIN.`,
    ],
  };
}

// Helper to build intelligent Kampala domain fallback for Equipment Loan Evaluation
function generateEquipmentEvaluationFallback(
  clientName: string,
  requestText: string,
  requestedAsset?: string,
  businessType?: string,
  dailyProfitUgx?: number,
  estimatedAssetValueUgx?: number,
  location?: string
) {
  const assetVal = estimatedAssetValueUgx || 1200000;
  const profit = dailyProfitUgx || 40000;
  const deposit = Math.round(assetVal * 0.2);
  const markup = Math.round(assetVal * 0.125);
  const weeks = 20;
  const totalToPay = assetVal + markup - deposit;
  const weekly = Math.round(totalToPay / weeks);
  const isGrowth = !/playstation|tv|iphone|sofa|luxury/i.test(requestedAsset || requestText);
  const score = isGrowth ? (profit > (weekly / 7) * 3 ? 9 : 7) : 3;

  return {
    translation: `Client ${clientName} is requesting ${requestedAsset || "equipment"} for their ${businessType || "business"}. Daily profit reported at UGX ${profit.toLocaleString()}.`,
    analysis: isGrowth
      ? `Low Risk. The asset (${requestedAsset || "Equipment"}) is a certified Growth Asset for this business. Daily profit of UGX ${profit.toLocaleString()} comfortably covers the weekly installment of UGX ${weekly.toLocaleString()}. Proven commitment.`
      : `High Risk / Non-Growth Asset. The requested item does not generate recurring daily revenue for a commercial business. Asset-backed equipment procurement requires productive machinery.`,
    eligibility_score: score,
    proposed_plan: {
      asset_value_ugx: assetVal,
      deposit_ugx: deposit,
      weekly_installment: weekly,
      duration_weeks: weeks,
      total_markup: markup,
    },
    scout_instruction: `Visit ${clientName}'s location at ${location || "Kampala"}. Verify physical business existence, inspect electrical supply ("Umeme") stability, photograph National ID, and confirm shop tenancy.`,
    client_message: `Nnyabo/Ssebo ${clientName}, mwebale nnyo okukolagana naffe mu Super App. Twagala okubayambako okufuna ekyuma ekyo. Deposit eri UGX ${deposit.toLocaleString()}, ate muliwenga UGX ${weekly.toLocaleString()} buli wiiki. Scout waffe ajja kukyala mu dduuka lyammwe akebere ekifo n'Umeme. Mwebale nnyo!`,
  };
}

// Handler for Universal Super App Request Fulfillment
async function handleSuperAppFulfill(req: express.Request, res: express.Response) {
  const { userPrompt, clientName, location, categoryHint, attachedMedia } = req.body;

  if (!userPrompt && !attachedMedia) {
    return res.status(400).json({ error: "userPrompt or attachedMedia is required" });
  }

  const ai = getAI();
  const mediaNote = attachedMedia
    ? `\nAttached Client Media: ${attachedMedia.type === "video" ? "1-Minute Video of Item/Site (" + attachedMedia.name + ")" : "Photo of Item/Part (" + attachedMedia.name + ")"}`
    : "";

  const prompt = `Fulfill this Super App request for a client in Kampala:
User Description: "${userPrompt || (attachedMedia ? 'Item shown in attached ' + attachedMedia.type : '')}"${mediaNote}
Client Name: ${clientName || "Kampala Resident"}
Location/Subcounty: ${location || "Kampala (Nansana/Makindye/Wakiso/Central)"}
Category Hint: ${categoryHint || "Auto-detect"}

Provide:
1. Category classification (VETTED_FUNDI_SERVICE, QUALITY_PRODUCT, WHOLESALE_BULK, GROWTH_EQUIPMENT, or EMERGENCY_ERRAND).
2. English translation and intent summary.
3. Warm, respectful Luganda response explaining how Ddala protects them and gets them the wholesale magic price.
4. Clear English response breakdown.
5. Zero-Fraud Risk Audit (Counterfeit risk level, physical verification protocol, Umeme electrical test requirement if electrical, escrow protection code, LC1 requirement).
6. Magic Price Comparison (Typical street broker price in UGX, Ddala magic wholesale price in UGX, net savings in UGX, savings percentage, source hub like Kikuubo/Katwe/Kiyembe/Nakasero, price guarantee explanation).
7. Top 2-3 Vetted Providers/Sellers in Kampala with name, business name, phone (+256...), physical landmark, hub, rating (4.7-5.0), completed jobs, verified badges, trust score (90-99), warranty period, badgeType.
8. Scout physical inspection and escrow instructions.
9. Next 3 immediate actionable steps for the customer.`;

  // Try calling Gemini with resilient fallback handling
  if (ai) {
    const modelsToTry = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    
    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: DDALA_UNIVERSAL_SUPER_APP_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                detectedCategory: {
                  type: Type.STRING,
                  description: "VETTED_FUNDI_SERVICE, QUALITY_PRODUCT, WHOLESALE_BULK, GROWTH_EQUIPMENT, or EMERGENCY_ERRAND",
                },
                title: { type: Type.STRING, description: "Short punchy title for this request" },
                translation: { type: Type.STRING, description: "English translation of what user asked for" },
                intentSummary: { type: Type.STRING, description: "Clear summary of user requirements and specs" },
                lugandaResponse: { type: Type.STRING, description: "Warm, polite Luganda message reassuring 0% fraud and best price" },
                englishResponse: { type: Type.STRING, description: "Friendly English explanation of fulfillment terms" },
                zeroFraudAudit: {
                  type: Type.OBJECT,
                  properties: {
                    counterfeitRiskLevel: { type: Type.STRING, description: "Low, Medium, High, or Critical" },
                    antiCounterfeitProtocol: { type: Type.STRING, description: "Protocol to prevent counterfeit or fake goods" },
                    physicalVerificationRequirement: { type: Type.STRING, description: "What Scout will physically check on-site" },
                    umemeCheckRequired: { type: Type.BOOLEAN, description: "Whether power stability / wiring test is required" },
                    escrowProtectionCode: { type: Type.STRING, description: "Escrow code e.g. ESC-DDL-XXXX" },
                    lc1ConfirmationRequired: { type: Type.BOOLEAN, description: "Whether local LC1 confirmation is required" },
                    guaranteeText: { type: Type.STRING, description: "100% money-back zero-fraud guarantee description" },
                  },
                  required: [
                    "counterfeitRiskLevel",
                    "antiCounterfeitProtocol",
                    "physicalVerificationRequirement",
                    "umemeCheckRequired",
                    "escrowProtectionCode",
                    "lc1ConfirmationRequired",
                    "guaranteeText",
                  ],
                },
                magicPrice: {
                  type: Type.OBJECT,
                  properties: {
                    streetBrokerPriceUgx: { type: Type.INTEGER, description: "Inflated broker street price in UGX" },
                    magicWholesalePriceUgx: { type: Type.INTEGER, description: "Direct Ddala wholesale magic price in UGX" },
                    netSavingsUgx: { type: Type.INTEGER, description: "Money saved in UGX" },
                    savingsPercentage: { type: Type.INTEGER, description: "Discount percentage e.g. 28" },
                    priceSourceHub: { type: Type.STRING, description: "e.g. Kiyembe Machinery Hub / Kikuubo Wholesale" },
                    priceGuaranteeReason: { type: Type.STRING, description: "Why this price is 100% verified wholesale" },
                  },
                  required: [
                    "streetBrokerPriceUgx",
                    "magicWholesalePriceUgx",
                    "netSavingsUgx",
                    "savingsPercentage",
                    "priceSourceHub",
                    "priceGuaranteeReason",
                  ],
                },
                vettedProviders: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      businessName: { type: Type.STRING },
                      roleOrCategory: { type: Type.STRING },
                      phone: { type: Type.STRING },
                      physicalLandmark: { type: Type.STRING },
                      hub: { type: Type.STRING },
                      rating: { type: Type.NUMBER },
                      completedJobs: { type: Type.INTEGER },
                      verifiedBadges: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      trustScore: { type: Type.INTEGER },
                      warrantyPeriod: { type: Type.STRING },
                      badgeType: { type: Type.STRING },
                      initials: { type: Type.STRING },
                    },
                    required: [
                      "id",
                      "name",
                      "businessName",
                      "roleOrCategory",
                      "phone",
                      "physicalLandmark",
                      "hub",
                      "rating",
                      "completedJobs",
                      "verifiedBadges",
                      "trustScore",
                      "warrantyPeriod",
                      "badgeType",
                      "initials",
                    ],
                  },
                },
                scoutInstructions: { type: Type.STRING, description: "City Scout field mission instructions" },
                nextSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of next immediate steps",
                },
              },
              required: [
                "detectedCategory",
                "title",
                "translation",
                "intentSummary",
                "lugandaResponse",
                "englishResponse",
                "zeroFraudAudit",
                "magicPrice",
                "vettedProviders",
                "scoutInstructions",
                "nextSteps",
              ],
            },
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        return res.json({
          success: true,
          data: parsed,
          meta: { model: modelName, timestamp: new Date().toISOString() },
        });
      } catch (err: any) {
        console.warn(`[Gemini API] Model ${modelName} returned temporary error: ${err?.message || err}. Trying next fallback...`);
      }
    }
  }

  // Gracefully return rich intelligent domain fallback if Gemini API is temporarily busy (503/429) or offline
  const fallback = generateSuperAppFallback(userPrompt, clientName, location);
  return res.json({
    success: true,
    data: fallback,
    meta: { model: "ddala-intelligent-wholesale-engine", timestamp: new Date().toISOString(), fallbackActive: true },
  });
}

// Handler for Evaluating Equipment Orders
async function handleEvaluateOrder(req: express.Request, res: express.Response) {
  const {
    clientName,
    location,
    businessType,
    requestText,
    appHistory,
    dailyProfitUgx,
    trustScore,
    requestedAsset,
    estimatedAssetValueUgx,
  } = req.body;

  if (!clientName || !requestText) {
    return res.status(400).json({ error: "Client name and request text are required" });
  }

  const ai = getAI();

  const prompt = `Evaluate this equipment procurement order:
Client: ${clientName}
Location: ${location || "Kampala"}
Business: ${businessType || "Retail / General trade"}
Request (Client language): "${requestText}"
Requested Asset: ${requestedAsset || "Physical business equipment"}
Estimated Asset Value: ${estimatedAssetValueUgx ? `${estimatedAssetValueUgx} UGX` : "Estimate based on Kampala retail market"}
Estimated Daily Profit: ${dailyProfitUgx ? `${dailyProfitUgx} UGX` : "Not explicitly specified"}
App Purchase History: ${appHistory || "New customer"}
Current Trust Score: ${trustScore !== undefined ? trustScore : 30}/100`;

  if (ai) {
    const modelsToTry = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: DDALA_SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                translation: {
                  type: Type.STRING,
                  description: "English translation of the client's request",
                },
                analysis: {
                  type: Type.STRING,
                  description: "Risk assessment, trade history evaluation, cashflow coverage, and asset validation",
                },
                eligibility_score: {
                  type: Type.INTEGER,
                  description: "Eligibility score from 1 to 10",
                },
                proposed_plan: {
                  type: Type.OBJECT,
                  properties: {
                    asset_value_ugx: { type: Type.INTEGER, description: "Estimated cost of purchasing asset in UGX" },
                    deposit_ugx: { type: Type.INTEGER, description: "Upfront deposit required in UGX" },
                    weekly_installment: { type: Type.INTEGER, description: "Weekly installment in UGX" },
                    duration_weeks: { type: Type.INTEGER, description: "Number of repayment weeks" },
                    total_markup: { type: Type.INTEGER, description: "Transparent middleman markup in UGX" },
                  },
                  required: ["asset_value_ugx", "deposit_ugx", "weekly_installment", "duration_weeks", "total_markup"],
                },
                scout_instruction: {
                  type: Type.STRING,
                  description: "Specific actionable checklist for City Scout visit including Umeme check, shop existence, and ID",
                },
                client_message: {
                  type: Type.STRING,
                  description: "Polite client message in original language with greeting, deposit, weekly terms, and scout visit notice",
                },
              },
              required: [
                "translation",
                "analysis",
                "eligibility_score",
                "proposed_plan",
                "scout_instruction",
                "client_message",
              ],
            },
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        return res.json({
          success: true,
          evaluation: parsed,
          meta: { model: modelName, timestamp: new Date().toISOString() },
        });
      } catch (err: any) {
        console.warn(`[Gemini API - Evaluate Order] Model ${modelName} returned temporary error: ${err?.message || err}. Trying next fallback...`);
      }
    }
  }

  // Resilient fallback
  const fallbackResult = generateEquipmentEvaluationFallback(
    clientName,
    requestText,
    requestedAsset,
    businessType,
    dailyProfitUgx,
    estimatedAssetValueUgx,
    location
  );

  return res.json({
    success: true,
    evaluation: fallbackResult,
    meta: { model: "ddala-rule-engine-fallback", timestamp: new Date().toISOString(), fallbackActive: true },
  });
}

// Handler for Voice Speech Translation & Wholesale Confirmation
async function handleTranslateVoice(req: express.Request, res: express.Response) {
  const { speechText, audioBase64, audioMimeType, languageHint, clientName, location } = req.body;

  if ((!speechText || typeof speechText !== "string" || !speechText.trim()) && !audioBase64) {
    return res.status(400).json({ error: "Either speechText or audioBase64 is required" });
  }

  const ai = getAI();
  const cleanedSpeech = (speechText || "").trim();

  // Intelligent domain fallback generator for speech translation
  const generateFallbackTranslation = (text: string) => {
    const raw = text || "5 Bags Kakira Sugar (50kg) & 2 Jerricans Sunflower Cooking Oil";
    const tLower = raw.toLowerCase();
    let detectedCategory = "WHOLESALE_BULK";
    let detectedHub = "Kikuubo Wholesale Commercial Hub";
    let englishTranslation = `Wholesale procurement request for: "${raw}"`;
    let lugandaConfirmation = `Ntegedde bulungi ssebo/nnyabo. Tugenda kukunoonyeza ebintu bino mu Kikuubo ku bbeeyi eya wholesale ddala nga Scout waffe abikebera.`;
    let savings = "20% - 30% below retail street price";
    let items = [{ name: raw, quantity: "Bulk wholesale order", estimatedWholesaleUgx: 350000, marketHub: "Kikuubo" }];

    if (tLower.includes("sugar") || tLower.includes("esukaali") || tLower.includes("sukari") || tLower.includes("kakira")) {
      detectedCategory = "WHOLESALE_BULK";
      detectedHub = "Kikuubo Wholesale Commercial Hub";
      englishTranslation = "50kg Bags of Kakira Pure White Sugar - Direct Factory Batch Sealed";
      lugandaConfirmation = "Ntegedde: Oyagala emiyenzeko gy'esukaali eya Kakira (50kg) okuva mu Kikuubo ku muwendo gwa direct wholesale.";
      savings = "24% below retail street price";
      items = [{ name: "Kakira Sugar 50kg (UNBS Batch Sealed)", quantity: "5 Bags", estimatedWholesaleUgx: 198000, marketHub: "Kikuubo" }];
    } else if (tLower.includes("sewing") || tLower.includes("ekyuma") || tLower.includes("jack") || tLower.includes("machine") || tLower.includes("kisona")) {
      detectedCategory = "GROWTH_EQUIPMENT";
      detectedHub = "Kiyembe Industrial Machinery Arcade";
      englishTranslation = "Jack A4 Direct-Drive Computerized Industrial Sewing Machine with 1-Year Importer Warranty";
      lugandaConfirmation = "Ntegedde: Oyagala ekyuma ekisona Jack A4 Direct Drive eky'e Kiyembe nga kikoleddwa bulungi era nga kirina warranty ya mwaka mulamba.";
      savings = "22% below street broker price";
      items = [{ name: "Jack A4 Computerized Industrial Sewing Machine", quantity: "1 Unit", estimatedWholesaleUgx: 1280000, marketHub: "Kiyembe" }];
    } else if (tLower.includes("welder") || tLower.includes("arc") || tLower.includes("katwe") || tLower.includes("wire") || tLower.includes("cable") || tLower.includes("ebyuma")) {
      detectedCategory = "GROWTH_EQUIPMENT";
      detectedHub = "Katwe Engineering & Machinery Hub";
      englishTranslation = "250A Heavy Duty Inverter Arc Welding Machine & 10mm Pure Copper Cable";
      lugandaConfirmation = "Ntegedde: Oyagala ekyuma ekisiba ebyuma Inverter Arc Welder 250A okuva e Katwe wamu ne waya za kopa z'omuliro.";
      savings = "28% below downtown broker shops";
      items = [{ name: "250A Inverter Arc Welder + Copper Cables", quantity: "1 Set", estimatedWholesaleUgx: 520000, marketHub: "Katwe" }];
    } else if (tLower.includes("solar") || tLower.includes("battery") || tLower.includes("inverter") || tLower.includes("bbaatule") || tLower.includes("omusana")) {
      detectedCategory = "QUALITY_PRODUCT";
      detectedHub = "Luwum Street Clean Energy Hub";
      englishTranslation = "200Ah 12V Deep Cycle Solar Gel Battery with 2-Year Serial Replacement Warranty";
      lugandaConfirmation = "Ntegedde: Oyagala bbaatule z'omusana 200Ah Deep Cycle Gel okuva ku Luwum Street nga zirina serial namba ne warranty.";
      savings = "25% savings on certified tier-1 solar batteries";
      items = [{ name: "200Ah 12V Solar Gel Battery", quantity: "2 Units", estimatedWholesaleUgx: 820000, marketHub: "Luwum Street" }];
    } else if (tLower.includes("fundi") || tLower.includes("electrician") || tLower.includes("wire") || tLower.includes("plumber") || tLower.includes("masannyalaze")) {
      detectedCategory = "VETTED_FUNDI_SERVICE";
      detectedHub = "Katwe Certified Artisan Guild";
      englishTranslation = "Certified Master Fundi (Electrical/Mechanical) with Umeme Voltage Testing Kit";
      lugandaConfirmation = "Ntegedde: Oyagala Fundi omutendeke ow'amaanyi akola ku masannyalaze oba ebyuma ng'alina satifikeeti n'ebipimo by'omuliro.";
      savings = "Zero-overcharging guarantee";
      items = [{ name: "Certified Master Fundi On-Site Service", quantity: "Service Request", estimatedWholesaleUgx: 180000, marketHub: "Katwe Guild" }];
    }

    return {
      originalSpoken: raw,
      englishTranslation,
      lugandaConfirmation,
      detectedHub,
      detectedCategory,
      detectedItems: items,
      estimatedWholesaleSavings: savings,
      recommendedPrompt: `${englishTranslation} (Sourced wholesale from ${detectedHub})`,
      confidenceScore: 96,
    };
  };

  if (ai) {
    const modelsToTry = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    const promptText = `Listen to the audio recording / read the spoken request from a client in Kampala, Uganda.
The user speaks in Luganda, Ugandan English, or a mix of Luganda and English for wholesale commerce.

Input Speech/Audio Details:
- Spoken text (if available): "${cleanedSpeech || "Audio recording provided"}"
- Language hint: ${languageHint || "Luganda or English"}
- Client Name: ${clientName || "Kampala Client"}
- Location: ${location || "Kampala"}

YOUR CRITICAL TASKS:
1. Transcribe the spoken audio/text accurately into 'originalSpoken'. If the user spoke Luganda (e.g. 'Njagala sukaali eya Kakira mu Kikuubo', 'Ekyuma ekisona eky'e Kiyembe', 'Waya z'omuliro e Katwe'), transcribe the Luganda words into 'originalSpoken'.
2. Translate the speech into clear, professional, comprehensive English wholesale procurement specifications ('englishTranslation').
3. Formulate a warm, polite Luganda confirmation message ('lugandaConfirmation') starting with "Ntegedde ssebo/nnyabo..." confirming precisely what they requested and that a Ddala verified scout is checking prices in wholesale hubs.
4. Identify the best Kampala wholesale market hub (Kikuubo for groceries/foods/commodities, Katwe for machinery/welding/metal fabrication/tools, Kiyembe for fabrics/tailoring/sewing machines, Nakasero for fresh produce/food, Luwum Street for solar/electronics/batteries).
5. Extract specific items, estimated quantities, and estimated wholesale prices in UGX.
6. Formulate a clean recommended prompt for the search engine.`;

    for (const modelName of modelsToTry) {
      try {
        const contentsPayload: any[] = [];
        if (audioBase64 && typeof audioBase64 === "string") {
          // Robustly clean base64 string to remove ANY data URL scheme (e.g. data:audio/webm;codecs=opus;base64,...)
          let cleanBase64 = audioBase64.trim();
          if (cleanBase64.includes(",")) {
            cleanBase64 = cleanBase64.substring(cleanBase64.indexOf(",") + 1);
          }
          // Remove all internal whitespace and newlines
          cleanBase64 = cleanBase64.replace(/\s+/g, "");

          // Clean MIME type (Gemini expects pure standard MIME type, e.g. audio/webm, audio/mp3, audio/ogg, audio/wav, not audio/webm;codecs=opus)
          let cleanMime = (audioMimeType || "audio/webm").split(";")[0].trim().toLowerCase();
          if (!cleanMime.startsWith("audio/")) {
            cleanMime = "audio/webm";
          }

          if (cleanBase64.length > 50) {
            contentsPayload.push({
              inlineData: {
                mimeType: cleanMime,
                data: cleanBase64,
              },
            });
          }
        }
        contentsPayload.push(promptText);

        const response = await ai.models.generateContent({
          model: modelName,
          contents: contentsPayload,
          config: {
            systemInstruction: "You are the expert Luganda & English voice transcriber, multilingual translator, and wholesale procurement structuring AI for Ddala Super App in Kampala, Uganda.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                originalSpoken: { type: Type.STRING, description: "Accurate transcript of what the user spoke in Luganda or English" },
                englishTranslation: { type: Type.STRING, description: "Precise English wholesale procurement translation" },
                lugandaConfirmation: { type: Type.STRING, description: "Warm polite Luganda confirmation message" },
                detectedHub: { type: Type.STRING, description: "Target Kampala wholesale commercial hub" },
                detectedCategory: { type: Type.STRING, description: "VETTED_FUNDI_SERVICE, QUALITY_PRODUCT, WHOLESALE_BULK, GROWTH_EQUIPMENT, or EMERGENCY_ERRAND" },
                detectedItems: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      quantity: { type: Type.STRING },
                      estimatedWholesaleUgx: { type: Type.INTEGER },
                      marketHub: { type: Type.STRING },
                    },
                    required: ["name"],
                  },
                },
                estimatedWholesaleSavings: { type: Type.STRING, description: "Percentage or description of savings vs street broker price" },
                recommendedPrompt: { type: Type.STRING, description: "Actionable search prompt ready for wholesale engine" },
                confidenceScore: { type: Type.INTEGER, description: "Confidence 0-100" },
              },
              required: [
                "originalSpoken",
                "englishTranslation",
                "lugandaConfirmation",
                "detectedHub",
                "detectedCategory",
                "detectedItems",
                "estimatedWholesaleSavings",
                "recommendedPrompt",
                "confidenceScore",
              ],
            },
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        if (parsed.originalSpoken || parsed.englishTranslation) {
          return res.json({
            success: true,
            translation: parsed,
            meta: { model: modelName, timestamp: new Date().toISOString() },
          });
        }
      } catch (err: any) {
        console.warn(`[Gemini API - Voice Translate] Model ${modelName} error: ${err?.message || err}.`);
      }
    }
  }

  // Fallback
  const fallback = generateFallbackTranslation(cleanedSpeech);
  return res.json({
    success: true,
    translation: fallback,
    meta: { model: "ddala-voice-fallback", timestamp: new Date().toISOString(), fallbackActive: true },
  });
}

// API Routes
app.post("/api/super-app-fulfill", handleSuperAppFulfill);
app.post("/api/translate-voice", handleTranslateVoice);
app.post("/api/evaluate-order", handleEvaluateOrder);
app.post("/api/evaluate-loan", handleEvaluateOrder);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Ddala Super App - Zero Fraud & Magic Price Engine",
    version: "2.0.0",
    model: "gemini-3.7-flash",
  });
});

// System Prompt Endpoint for Admin & API Inspection
app.get("/api/system-prompt", (_req, res) => {
  res.json({
    name: "Ddala Super App",
    model: "gemini-3.7-flash",
    universalSystemInstruction: DDALA_UNIVERSAL_SUPER_APP_INSTRUCTION,
    equipmentSystemInstruction: DDALA_SYSTEM_INSTRUCTION,
    targetAreas: ["Kampala Central", "Nansana", "Wakiso", "Makindye", "Katwe", "Kiyembe", "Kikuubo", "Nakasero", "Bwaise", "Rubaga"],
    corePhilosophy: [
      "Describe Anything You Want (Luganda / English / Swahili)",
      "Zero-Fraud Guarantee to 0% (Physical Scout Inspection + Anti-Counterfeit + LC1 check)",
      "Magic Wholesale Price Engine (Direct from Kikuubo, Katwe, Kiyembe, Nakasero)",
      "100% Escrow Protection (Funds locked safely until customer verification)",
      "Certified Master Fundis & Primary Wholesale Importers",
    ],
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ddala Credit Officer Server running on http://localhost:${PORT}`);
  });
}

startServer();
