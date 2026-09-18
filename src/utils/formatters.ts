export function formatUGX(amount: number): string {
  if (isNaN(amount)) return "UGX 0";
  return `UGX ${Math.round(amount).toLocaleString()}`;
}

export function formatUGXShort(amount: number): string {
  if (isNaN(amount)) return "UGX 0";
  if (amount >= 1_000_000) {
    return `UGX ${(amount / 1_000_000).toFixed(2).replace(/\.00$/, "")}M`;
  }
  if (amount >= 1_000) {
    return `UGX ${(amount / 1_000).toFixed(0)}k`;
  }
  return `UGX ${amount}`;
}

export function getScoreColor(score: number): {
  badge: string;
  bg: string;
  border: string;
  text: string;
  label: string;
  recommendation: string;
} {
  if (score >= 8) {
    return {
      badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      bg: "bg-emerald-950/40",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      label: "Approved for Instant Dispatch",
      recommendation: "High confidence. Immediate Scout dispatch recommended.",
    };
  } else if (score >= 5) {
    return {
      badge: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      bg: "bg-amber-950/40",
      border: "border-amber-500/30",
      text: "text-amber-400",
      label: "Conditional / Under Review",
      recommendation: "Requires higher deposit or deeper physical verification.",
    };
  } else {
    return {
      badge: "bg-rose-500/20 text-rose-400 border-rose-500/40",
      bg: "bg-rose-950/40",
      border: "border-rose-500/30",
      text: "text-rose-400",
      label: "High Risk / Declined",
      recommendation: "Non-growth luxury asset, insufficient cashflow, or fraudulent pattern.",
    };
  }
}

export function getHubColor(hub: string): string {
  switch (hub) {
    case "Nansana":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "Makindye":
      return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    case "Wakiso":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    case "Kampala":
    default:
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  }
}
