// ============================================================
// Types for the Bitcoin Signal Dashboard
// ============================================================

// --- Signal Engine Types ---

export type SignalVerdict = "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL";

export type SignalCategory = "technical" | "sentiment" | "onchain" | "macro";

export interface Signal {
  id: string;
  name: string;
  category: SignalCategory;
  description: string;
  value: number | string;
  displayValue: string;
  verdict: SignalVerdict;
  weight: number; // 0-1, importance in composite score
  confidence: number; // 0-100
  source: string;
  lastUpdated: string;
  details?: string;
}

// --- Price Data ---

export interface PriceData {
  current: number;
  change24h: number;
  change7d: number;
  change30d: number;
  high24h: number;
  low24h: number;
  marketCap: number;
  volume24h: number;
  sparkline7d: number[];
}

// --- Fear & Greed ---

export interface FearGreedData {
  value: number;
  classification: string;
}

// --- Decision Layer Types ---

export interface DecisionResult {
  compositeScore: number; // -100 to +100
  verdict: SignalVerdict;
  confidence: number; // 0-100
  signalBreakdown: {
    bullish: number;
    bearish: number;
    neutral: number;
  };
  reasoning: string[];
}

// --- Alerts Layer Types ---

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertType = "price" | "signal_change" | "composite_threshold" | "divergence";

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  condition: string;
  threshold: number;
  severity: AlertSeverity;
}

// --- Dashboard Aggregate ---

export interface DashboardData {
  price: PriceData;
  signals: Signal[];
  decision: DecisionResult;
  alerts: Alert[];
  lastUpdated: string;
}
