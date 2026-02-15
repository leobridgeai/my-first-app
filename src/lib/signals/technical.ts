import { Signal, PriceData } from "@/types/signals";

/**
 * Compute technical signals from price data.
 * Uses the 7-day sparkline from CoinGecko to derive indicators.
 */
export function computeTechnicalSignals(price: PriceData): Signal[] {
  const now = new Date().toISOString();
  const signals: Signal[] = [];

  // --- RSI (approximated from 7d sparkline) ---
  signals.push(computeRSI(price.sparkline7d, now));

  // --- Momentum (price change trends) ---
  signals.push(computeMomentum(price, now));

  // --- Volatility signal ---
  signals.push(computeVolatility(price.sparkline7d, now));

  // --- Volume signal ---
  signals.push(computeVolumeSignal(price, now));

  return signals;
}

function computeRSI(sparkline: number[], now: string): Signal {
  if (sparkline.length < 14) {
    return makeSignal("rsi", "RSI (14)", "technical", "Indisponible", "NEUTRAL", 0, now);
  }

  // Calculate RSI from the last portion of the sparkline
  const prices = sparkline.slice(-168); // last 7 days hourly
  const step = Math.max(1, Math.floor(prices.length / 14));
  const sampled = [];
  for (let i = 0; i < prices.length; i += step) {
    sampled.push(prices[i]);
  }

  let gains = 0;
  let losses = 0;
  const periods = Math.min(sampled.length - 1, 14);

  for (let i = sampled.length - periods; i < sampled.length; i++) {
    const change = sampled[i] - sampled[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / periods;
  const avgLoss = losses / periods;
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);
  const rounded = Math.round(rsi * 10) / 10;

  let verdict: Signal["verdict"] = "NEUTRAL";
  let details = "";
  if (rsi <= 30) {
    verdict = "STRONG_BUY";
    details = `RSI à ${rounded}: zone de survente. Signal d'achat fort.`;
  } else if (rsi <= 40) {
    verdict = "BUY";
    details = `RSI à ${rounded}: approche de la zone de survente.`;
  } else if (rsi >= 70) {
    verdict = "STRONG_SELL";
    details = `RSI à ${rounded}: zone de surachat. Signal de vente fort.`;
  } else if (rsi >= 60) {
    verdict = "SELL";
    details = `RSI à ${rounded}: approche de la zone de surachat.`;
  } else {
    details = `RSI à ${rounded}: zone neutre.`;
  }

  return {
    id: "rsi",
    name: "RSI (14)",
    category: "technical",
    description: "Relative Strength Index - mesure la vitesse et l'amplitude des mouvements de prix",
    value: rounded,
    displayValue: rounded.toString(),
    verdict,
    weight: 0.2,
    confidence: 70,
    source: "Calculé à partir des données CoinGecko",
    lastUpdated: now,
    details,
  };
}

function computeMomentum(price: PriceData, now: string): Signal {
  const { change24h, change7d, change30d } = price;

  // Weighted momentum score
  const score = change24h * 0.2 + change7d * 0.3 + change30d * 0.5;

  let verdict: Signal["verdict"] = "NEUTRAL";
  let details = "";

  if (score > 15) {
    verdict = "STRONG_BUY";
    details = "Momentum très haussier sur toutes les périodes.";
  } else if (score > 5) {
    verdict = "BUY";
    details = "Momentum haussier. Tendance positive.";
  } else if (score < -15) {
    verdict = "STRONG_SELL";
    details = "Momentum très baissier sur toutes les périodes.";
  } else if (score < -5) {
    verdict = "SELL";
    details = "Momentum baissier. Tendance négative.";
  } else {
    details = "Momentum neutre. Pas de tendance claire.";
  }

  return {
    id: "momentum",
    name: "Momentum",
    category: "technical",
    description: "Analyse de la tendance basée sur les variations 24h, 7j et 30j",
    value: Math.round(score * 100) / 100,
    displayValue: `${score > 0 ? "+" : ""}${score.toFixed(1)}%`,
    verdict,
    weight: 0.15,
    confidence: 75,
    source: "Calculé à partir des données CoinGecko",
    lastUpdated: now,
    details: `24h: ${change24h.toFixed(1)}% | 7j: ${change7d.toFixed(1)}% | 30j: ${change30d.toFixed(1)}%. ${details}`,
  };
}

function computeVolatility(sparkline: number[], now: string): Signal {
  if (sparkline.length < 10) {
    return makeSignal("volatility", "Volatilité", "technical", "Indisponible", "NEUTRAL", 0, now);
  }

  // Calculate coefficient of variation
  const mean = sparkline.reduce((a, b) => a + b, 0) / sparkline.length;
  const variance =
    sparkline.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sparkline.length;
  const stdDev = Math.sqrt(variance);
  const cv = (stdDev / mean) * 100;
  const rounded = Math.round(cv * 100) / 100;

  let verdict: Signal["verdict"] = "NEUTRAL";
  let details = "";

  if (cv > 8) {
    verdict = "SELL";
    details = "Volatilité très élevée. Risque accru, prudence recommandée.";
  } else if (cv > 5) {
    verdict = "NEUTRAL";
    details = "Volatilité modérée. Conditions normales de marché.";
  } else if (cv < 2) {
    verdict = "BUY";
    details = "Faible volatilité. Période de consolidation, possible mouvement à venir.";
  } else {
    details = "Volatilité normale.";
  }

  return {
    id: "volatility",
    name: "Volatilité (7j)",
    category: "technical",
    description: "Coefficient de variation du prix sur 7 jours",
    value: rounded,
    displayValue: `${rounded}%`,
    verdict,
    weight: 0.1,
    confidence: 65,
    source: "Calculé à partir des données CoinGecko",
    lastUpdated: now,
    details,
  };
}

function computeVolumeSignal(price: PriceData, now: string): Signal {
  // Volume relative to market cap as a proxy for activity
  const volumeToMcap = price.marketCap > 0 ? (price.volume24h / price.marketCap) * 100 : 0;
  const rounded = Math.round(volumeToMcap * 100) / 100;

  let verdict: Signal["verdict"] = "NEUTRAL";
  let details = "";

  if (volumeToMcap > 10) {
    verdict = "NEUTRAL"; // Very high volume can signal either direction
    details = "Volume exceptionnel. Forte activité, possible mouvement majeur en cours.";
  } else if (volumeToMcap > 5) {
    verdict = price.change24h > 0 ? "BUY" : "SELL";
    details =
      price.change24h > 0
        ? "Volume élevé avec hausse des prix. Confirmation de la tendance haussière."
        : "Volume élevé avec baisse des prix. Confirmation de la tendance baissière.";
  } else if (volumeToMcap < 2) {
    verdict = "NEUTRAL";
    details = "Faible volume. Manque de conviction du marché.";
  } else {
    details = "Volume normal.";
  }

  return {
    id: "volume",
    name: "Volume Relatif",
    category: "technical",
    description: "Ratio volume/capitalisation sur 24h",
    value: rounded,
    displayValue: `${rounded}%`,
    verdict,
    weight: 0.1,
    confidence: 60,
    source: "CoinGecko",
    lastUpdated: now,
    details,
  };
}

function makeSignal(
  id: string,
  name: string,
  category: Signal["category"],
  displayValue: string,
  verdict: Signal["verdict"],
  confidence: number,
  now: string
): Signal {
  return {
    id,
    name,
    category,
    description: "",
    value: 0,
    displayValue,
    verdict,
    weight: 0.1,
    confidence,
    source: "N/A",
    lastUpdated: now,
  };
}
