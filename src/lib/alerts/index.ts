import { Signal, DecisionResult, Alert, PriceData } from "@/types/signals";

/**
 * EXECUTION / ALERTS LAYER
 *
 * Monitors signals and decision results to generate actionable alerts.
 * Checks for:
 * - Composite score crossing buy/sell thresholds
 * - Extreme signal values
 * - Signal divergences (conflicting signals)
 * - Price movements
 */
export function generateAlerts(
  signals: Signal[],
  decision: DecisionResult,
  price: PriceData
): Alert[] {
  const alerts: Alert[] = [];

  // Check composite score thresholds
  alerts.push(...checkCompositeThresholds(decision));

  // Check for extreme individual signals
  alerts.push(...checkExtremeSignals(signals));

  // Check for signal divergence
  alerts.push(...checkDivergence(signals, decision));

  // Check price movements
  alerts.push(...checkPriceAlerts(price));

  // Sort by severity (critical first)
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}

function checkCompositeThresholds(decision: DecisionResult): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  if (decision.compositeScore >= 50) {
    alerts.push({
      id: `composite-strong-buy-${Date.now()}`,
      type: "composite_threshold",
      severity: "critical",
      title: "Signal d'ACHAT FORT détecté",
      message: `Le score composite est à ${decision.compositeScore}/100. La majorité des indicateurs sont haussiers. C'est potentiellement un bon moment pour considérer un achat.`,
      timestamp: now,
      acknowledged: false,
    });
  } else if (decision.compositeScore >= 20) {
    alerts.push({
      id: `composite-buy-${Date.now()}`,
      type: "composite_threshold",
      severity: "warning",
      title: "Signal d'ACHAT modéré",
      message: `Le score composite est à ${decision.compositeScore}/100. Plusieurs indicateurs sont positifs.`,
      timestamp: now,
      acknowledged: false,
    });
  } else if (decision.compositeScore <= -50) {
    alerts.push({
      id: `composite-strong-sell-${Date.now()}`,
      type: "composite_threshold",
      severity: "critical",
      title: "Signal de VENTE FORT détecté",
      message: `Le score composite est à ${decision.compositeScore}/100. La majorité des indicateurs sont baissiers. Prudence maximale recommandée.`,
      timestamp: now,
      acknowledged: false,
    });
  } else if (decision.compositeScore <= -20) {
    alerts.push({
      id: `composite-sell-${Date.now()}`,
      type: "composite_threshold",
      severity: "warning",
      title: "Signal de VENTE modéré",
      message: `Le score composite est à ${decision.compositeScore}/100. Plusieurs indicateurs sont négatifs.`,
      timestamp: now,
      acknowledged: false,
    });
  }

  return alerts;
}

function checkExtremeSignals(signals: Signal[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  for (const signal of signals) {
    if (signal.verdict === "STRONG_BUY") {
      alerts.push({
        id: `extreme-buy-${signal.id}-${Date.now()}`,
        type: "signal_change",
        severity: "warning",
        title: `${signal.name}: Signal extrême haussier`,
        message: `${signal.name} à ${signal.displayValue}. ${signal.details || ""}`,
        timestamp: now,
        acknowledged: false,
      });
    } else if (signal.verdict === "STRONG_SELL") {
      alerts.push({
        id: `extreme-sell-${signal.id}-${Date.now()}`,
        type: "signal_change",
        severity: "warning",
        title: `${signal.name}: Signal extrême baissier`,
        message: `${signal.name} à ${signal.displayValue}. ${signal.details || ""}`,
        timestamp: now,
        acknowledged: false,
      });
    }
  }

  return alerts;
}

function checkDivergence(signals: Signal[], decision: DecisionResult): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  const { bullish, bearish } = decision.signalBreakdown;
  const total = bullish + bearish;

  // Divergence: both bullish and bearish signals are strong
  if (total >= 4 && bullish >= 2 && bearish >= 2) {
    const ratio = Math.min(bullish, bearish) / Math.max(bullish, bearish);
    if (ratio > 0.5) {
      alerts.push({
        id: `divergence-${Date.now()}`,
        type: "divergence",
        severity: "warning",
        title: "Divergence entre les signaux",
        message: `Les signaux sont contradictoires: ${bullish} haussiers vs ${bearish} baissiers. Le marché est indécis. Attendre une confirmation avant d'agir.`,
        timestamp: now,
        acknowledged: false,
      });
    }
  }

  return alerts;
}

function checkPriceAlerts(price: PriceData): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  // Large 24h price movement
  if (Math.abs(price.change24h) > 8) {
    const direction = price.change24h > 0 ? "hausse" : "baisse";
    alerts.push({
      id: `price-move-${Date.now()}`,
      type: "price",
      severity: "critical",
      title: `Mouvement de prix important (${direction})`,
      message: `Bitcoin a ${direction === "hausse" ? "augmenté" : "baissé"} de ${Math.abs(price.change24h).toFixed(1)}% en 24h. Prix actuel: $${price.current.toLocaleString()}.`,
      timestamp: now,
      acknowledged: false,
    });
  } else if (Math.abs(price.change24h) > 5) {
    const direction = price.change24h > 0 ? "hausse" : "baisse";
    alerts.push({
      id: `price-move-${Date.now()}`,
      type: "price",
      severity: "info",
      title: `Mouvement de prix notable (${direction})`,
      message: `Variation de ${price.change24h > 0 ? "+" : ""}${price.change24h.toFixed(1)}% en 24h. Prix: $${price.current.toLocaleString()}.`,
      timestamp: now,
      acknowledged: false,
    });
  }

  return alerts;
}
