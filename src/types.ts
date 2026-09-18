export type UserRole = "client" | "vendor" | "scout" | "host";

export interface WholesaleInventoryItem {
  id: string;
  name: string;
  hub: string;
  category: string;
  wholesalePriceUgx: number;
  streetRetailPriceUgx: number;
  minOrderQty: number;
  stockQty: number;
  warranty: string;
  unbsBatchVerified: boolean;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface ProposedPlan {
  asset_value_ugx: number;
  deposit_ugx: number;
  weekly_installment: number;
  duration_weeks: number;
  total_markup: number;
}

export interface LoanEvaluationResult {
  translation: string;
  analysis: string;
  eligibility_score: number;
  proposed_plan: ProposedPlan;
  scout_instruction: string;
  client_message: string;
}

export type ApplicationStatus =
  | "pending_evaluation"
  | "approved_for_dispatch" // Score >= 8
  | "under_review"          // Score 5-7
  | "declined"              // Score < 5 or Luxury item
  | "scout_dispatched"
  | "scout_verified"
  | "asset_procured"
  | "active_repayment";

export interface LoanApplication {
  id: string;
  clientName: string;
  phone: string;
  location: string;
  hub: "Nansana" | "Makindye" | "Wakiso" | "Kampala";
  businessType: string;
  requestText: string;
  appHistory: string;
  trustScore: number;
  dailyProfitUgx: number;
  requestedAsset: string;
  assetCategory: "Refrigeration" | "Tailoring & Textiles" | "Metalwork & Fabrication" | "Salon & Beauty" | "Agri-Processing" | "Energy & Solar" | "Other";
  estimatedAssetValueUgx: number;
  createdAt: string;
  status: ApplicationStatus;
  evaluation?: LoanEvaluationResult;
  scoutMission?: ScoutMission;
  repayments?: RepaymentItem[];
}

export interface ScoutMission {
  id: string;
  applicationId: string;
  scoutName: string;
  scoutPhone: string;
  assignedHub: string;
  dispatchedAt: string;
  status: "dispatched" | "en_route" | "arrived" | "verified_passed" | "verified_failed";
  checklist: {
    shopExists: boolean;
    umemeStable: boolean;
    nationalIdCaptured: boolean;
    premisesPhotoCaptured: boolean;
    neighborConfirmed: boolean;
    remarks: string;
  };
  fundiElectricianNeeded: boolean;
  gpsCoordinates?: { lat: number; lng: number };
}

export interface RepaymentItem {
  id: string;
  weekNumber: number;
  dueDate: string;
  amountUgx: number;
  status: "paid" | "upcoming" | "overdue";
  paidAt?: string;
  provider?: "MTN Mobile Money" | "Airtel Money";
  transactionId?: string;
}

export interface PresetScenario {
  id: string;
  title: string;
  clientName: string;
  location: string;
  hub: "Nansana" | "Makindye" | "Wakiso" | "Kampala";
  businessType: string;
  requestedAsset: string;
  assetCategory: "Refrigeration" | "Tailoring & Textiles" | "Metalwork & Fabrication" | "Salon & Beauty" | "Agri-Processing" | "Energy & Solar" | "Other";
  estimatedAssetValueUgx: number;
  dailyProfitUgx: number;
  trustScore: number;
  appHistory: string;
  requestText: string;
  description: string;
  expectedOutcome: string;
  isFlagshipScenario?: boolean;
}

// ----------------------------------------------------
// THE SUPER APP (DDALA) ZERO-FRAUD & MAGIC PRICE SCHEMAS
// ----------------------------------------------------

export type SuperAppCategory =
  | "VETTED_FUNDI_SERVICE"
  | "QUALITY_PRODUCT"
  | "WHOLESALE_BULK"
  | "GROWTH_EQUIPMENT"
  | "EMERGENCY_ERRAND";

export interface ZeroFraudAudit {
  counterfeitRiskLevel: "Low" | "Medium" | "High" | "Critical";
  antiCounterfeitProtocol: string;
  physicalVerificationRequirement: string;
  umemeCheckRequired: boolean;
  escrowProtectionCode: string;
  lc1ConfirmationRequired: boolean;
  guaranteeText: string;
}

export interface MagicPriceComparison {
  streetBrokerPriceUgx: number;
  magicWholesalePriceUgx: number;
  netSavingsUgx: number;
  savingsPercentage: number;
  priceSourceHub: string;
  priceGuaranteeReason: string;
}

export interface VettedProvider {
  id: string;
  name: string;
  businessName: string;
  roleOrCategory: string;
  phone: string;
  physicalLandmark: string;
  hub: string;
  rating: number;
  completedJobs: number;
  verifiedBadges: string[];
  trustScore: number;
  warrantyPeriod: string;
  badgeType?: "Master Fundi" | "Wholesale Primary" | "Certified Technician" | "Direct Importer";
  initials: string;
}

export interface SuperAppFulfillmentResult {
  detectedCategory: SuperAppCategory;
  title: string;
  translation: string;
  intentSummary: string;
  lugandaResponse: string;
  englishResponse: string;
  zeroFraudAudit: ZeroFraudAudit;
  magicPrice: MagicPriceComparison;
  vettedProviders: VettedProvider[];
  scoutInstructions: string;
  nextSteps: string[];
}

export type EscrowOrderStatus =
  | "escrow_locked"
  | "scout_dispatched"
  | "quality_inspected"
  | "in_transit"
  | "delivered_and_tested"
  | "funds_released"
  | "dispute_refunded";

export interface EscrowOrder {
  id: string;
  requestText: string;
  category: SuperAppCategory;
  itemTitle: string;
  clientName: string;
  clientPhone: string;
  location: string;
  matchedProvider: VettedProvider;
  magicPriceUgx: number;
  streetPriceUgx: number;
  savingsUgx: number;
  status: EscrowOrderStatus;
  escrowRef: string;
  scoutName: string;
  scoutPhone: string;
  umemeChecked: boolean;
  antiCounterfeitPassed: boolean;
  createdAt: string;
  paymentMethod: "MTN Mobile Money" | "Airtel Money" | "Ddala Wallet Escrow";
  logs: { timestamp: string; note: string; actor: string }[];
}

export interface AttachedMedia {
  type: "image" | "video";
  file?: File;
  dataUrl: string;
  name: string;
  sizeMb: number;
  durationSec?: number;
}

export interface UniversalPromptPreset {
  id: string;
  badge: string;
  category: SuperAppCategory;
  title: string;
  lugandaPrompt: string;
  englishExplanation: string;
  location: string;
  expectedHub: string;
  iconName: string;
}

export interface VoiceTranslationItem {
  name: string;
  quantity?: string;
  estimatedWholesaleUgx?: number;
  marketHub?: string;
}

export interface VoiceTranslationResult {
  originalSpoken: string;
  englishTranslation: string;
  lugandaConfirmation: string;
  detectedHub: string;
  detectedCategory: SuperAppCategory;
  detectedItems: VoiceTranslationItem[];
  estimatedWholesaleSavings: string;
  recommendedPrompt: string;
  confidenceScore: number;
}

