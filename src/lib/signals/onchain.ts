import { Signal, PriceData } from "@/types/signals";

/**
 * On-chain / macro signals derived from available market data.
 * Full on-chain data (e.g., MVRV, SOPR, exchange flows) requires paid APIs.
 * Here we derive proxy signals from CoinGecko market data.
 */
export function computeOnchainSignals(price: PriceData): Signal[] {
  const now = new Date().toISOString();
  return [
    computeMarketCapDominance(price, now),
    computePriceFromATH(price, now),
  ];
}

function computeMarketCapDominance(price: PriceData, now: string): Signal {
  // Market cap threshold analysis
  // Bitcoin at very high market cap levels historically faces resistance
  const mcapTrillions = price.marketCap / 1e12;

  let verdict: Signal["verdict"] = "NEUTRAL";
  let details = "";

  if (mcapTrillions < 0.5) {
    verdict = "STRONG_BUY";
    details = `Cap. de marché à ${mcapTrillions.toFixed(2)}T$. Niveaux historiquement bas, fort potentiel de hausse.`;
  } else if (mcapTrillions < 1) {
    verdict = "BUY";
    details = `Cap. de marché à ${mcapTrillions.toFixed(2)}T$. Encore du potentiel de croissance.`;
  } else if (mcapTrillions > 2.5) {
    verdict = "SELL";
    details = `Cap. de marché à ${mcapTrillions.toFixed(2)}T$. Niveaux élevés, prudence.`;
  } else {
    details = `Cap. de marché à ${mcapTrillions.toFixed(2)}T$.`;
  }

  return {
    id: "market-cap-level",
    name: "Niveau de Capitalisation",
    category: "onchain",
    description: "Analyse du niveau de capitalisation boursière de Bitcoin",
    value: mcapTrillions,
    displayValue: `${mcapTrillions.toFixed(2)}T $`,
    verdict,
    weight: 0.1,
    confidence: 55,
    source: "CoinGecko",
    lastUpdated: now,
    details,
  };
}

function computePriceFromATH(price: PriceData, now: string): Signal {
  // Use 30d change as a proxy for distance from recent highs
  // A big drop from recent highs can be a buying opportunity
  const change30d = price.change30d;

  let verdict: Signal["verdict"] = "NEUTRAL";
  let details = "";

  if (change30d < -30) {
    verdict = "STRONG_BUY";
    details = `Baisse de ${Math.abs(change30d).toFixed(1)}% sur 30j. Correction majeure, potentielle opportunité.`;
  } else if (change30d < -15) {
    verdict = "BUY";
    details = `Baisse de ${Math.abs(change30d).toFixed(1)}% sur 30j. Correction significative.`;
  } else if (change30d > 40) {
    verdict = "STRONG_SELL";
    details = `Hausse de ${change30d.toFixed(1)}% sur 30j. Possible surchauffe du marché.`;
  } else if (change30d > 20) {
    verdict = "SELL";
    details = `Hausse de ${change30d.toFixed(1)}% sur 30j. Rallye important, risque de correction.`;
  } else {
    details = `Variation de ${change30d > 0 ? "+" : ""}${change30d.toFixed(1)}% sur 30j. Mouvement modéré.`;
  }

  return {
    id: "price-trend-30d",
    name: "Tendance 30 Jours",
    category: "onchain",
    description: "Variation du prix sur 30 jours - indicateur de cycles",
    value: change30d,
    displayValue: `${change30d > 0 ? "+" : ""}${change30d.toFixed(1)}%`,
    verdict,
    weight: 0.1,
    confidence: 60,
    source: "CoinGecko",
    lastUpdated: now,
    details,
  };
}
