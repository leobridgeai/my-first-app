import { Signal } from "@/types/signals";

const FEAR_GREED_API = "https://api.alternative.me/fng/?limit=1";

interface FearGreedResponse {
  data: Array<{
    value: string;
    value_classification: string;
    timestamp: string;
  }>;
}

export async function fetchFearGreedSignal(): Promise<Signal> {
  const now = new Date().toISOString();

  try {
    const res = await fetch(FEAR_GREED_API, { next: { revalidate: 300 } });

    if (!res.ok) {
      throw new Error(`Fear & Greed API error: ${res.status}`);
    }

    const json: FearGreedResponse = await res.json();
    const entry = json.data[0];
    const value = parseInt(entry.value, 10);
    const classification = entry.value_classification;

    return {
      id: "fear-greed-index",
      name: "Fear & Greed Index",
      category: "sentiment",
      description: "Mesure le sentiment du marché crypto de 0 (peur extrême) à 100 (avidité extrême)",
      value,
      displayValue: `${value} - ${classification}`,
      verdict: getFearGreedVerdict(value),
      weight: 0.15,
      confidence: 80,
      source: "Alternative.me",
      lastUpdated: now,
      details: getDetailsForFearGreed(value, classification),
    };
  } catch (error) {
    console.error("Failed to fetch Fear & Greed:", error);
    return {
      id: "fear-greed-index",
      name: "Fear & Greed Index",
      category: "sentiment",
      description: "Mesure le sentiment du marché crypto",
      value: -1,
      displayValue: "Indisponible",
      verdict: "NEUTRAL",
      weight: 0.15,
      confidence: 0,
      source: "Alternative.me",
      lastUpdated: now,
    };
  }
}

function getFearGreedVerdict(value: number) {
  // Contrarian logic: extreme fear = buy opportunity, extreme greed = sell signal
  if (value <= 20) return "STRONG_BUY" as const;
  if (value <= 35) return "BUY" as const;
  if (value <= 65) return "NEUTRAL" as const;
  if (value <= 80) return "SELL" as const;
  return "STRONG_SELL" as const;
}

function getDetailsForFearGreed(value: number, classification: string): string {
  if (value <= 20)
    return `Peur extrême (${classification}). Historiquement, c'est souvent un bon moment pour acheter.`;
  if (value <= 35)
    return `Peur (${classification}). Le marché est pessimiste, potentielle opportunité d'achat.`;
  if (value <= 65)
    return `Zone neutre (${classification}). Pas de signal fort dans un sens ou l'autre.`;
  if (value <= 80)
    return `Avidité (${classification}). Le marché est optimiste, prudence recommandée.`;
  return `Avidité extrême (${classification}). Historiquement, c'est souvent un signal de vente.`;
}
