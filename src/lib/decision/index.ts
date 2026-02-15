import { Signal, SignalVerdict, DecisionResult } from "@/types/signals";

/**
 * DECISION LAYER
 *
 * Takes all collected signals and produces a single composite decision.
 * Uses weighted scoring to aggregate different signal types.
 *
 * Score range: -100 (strong sell) to +100 (strong buy)
 * Each signal contributes proportionally to its weight and confidence.
 */
export function computeDecision(signals: Signal[]): DecisionResult {
  const validSignals = signals.filter((s) => s.confidence > 0);

  if (validSignals.length === 0) {
    return {
      compositeScore: 0,
      verdict: "NEUTRAL",
      confidence: 0,
      signalBreakdown: { bullish: 0, bearish: 0, neutral: 0 },
      reasoning: ["Aucun signal disponible."],
    };
  }

  // Convert each signal verdict to a numeric score (-100 to +100)
  let weightedScoreSum = 0;
  let totalWeight = 0;
  let totalConfidence = 0;

  let bullish = 0;
  let bearish = 0;
  let neutral = 0;

  const reasoning: string[] = [];

  for (const signal of validSignals) {
    const numericScore = verdictToScore(signal.verdict);
    const effectiveWeight = signal.weight * (signal.confidence / 100);

    weightedScoreSum += numericScore * effectiveWeight;
    totalWeight += effectiveWeight;
    totalConfidence += signal.confidence;

    if (numericScore > 10) bullish++;
    else if (numericScore < -10) bearish++;
    else neutral++;

    // Build reasoning
    const direction =
      numericScore > 10 ? "haussier" : numericScore < -10 ? "baissier" : "neutre";
    reasoning.push(`${signal.name}: ${signal.displayValue} → signal ${direction}`);
  }

  const compositeScore =
    totalWeight > 0 ? Math.round(weightedScoreSum / totalWeight) : 0;
  const avgConfidence = Math.round(totalConfidence / validSignals.length);
  const verdict = scoreToVerdict(compositeScore);

  // Add summary reasoning
  const summaryLines = buildSummaryReasoning(compositeScore, verdict, bullish, bearish, neutral);

  return {
    compositeScore,
    verdict,
    confidence: avgConfidence,
    signalBreakdown: { bullish, bearish, neutral },
    reasoning: [...summaryLines, "---", ...reasoning],
  };
}

function verdictToScore(verdict: SignalVerdict): number {
  switch (verdict) {
    case "STRONG_BUY":
      return 80;
    case "BUY":
      return 40;
    case "NEUTRAL":
      return 0;
    case "SELL":
      return -40;
    case "STRONG_SELL":
      return -80;
  }
}

function scoreToVerdict(score: number): SignalVerdict {
  if (score >= 50) return "STRONG_BUY";
  if (score >= 20) return "BUY";
  if (score <= -50) return "STRONG_SELL";
  if (score <= -20) return "SELL";
  return "NEUTRAL";
}

function buildSummaryReasoning(
  score: number,
  verdict: SignalVerdict,
  bullish: number,
  bearish: number,
  neutral: number
): string[] {
  const lines: string[] = [];

  const verdictLabels: Record<SignalVerdict, string> = {
    STRONG_BUY: "ACHAT FORT",
    BUY: "ACHAT",
    NEUTRAL: "NEUTRE",
    SELL: "VENTE",
    STRONG_SELL: "VENTE FORTE",
  };

  lines.push(`Verdict: ${verdictLabels[verdict]} (score: ${score}/100)`);
  lines.push(
    `Répartition: ${bullish} haussier(s), ${bearish} baissier(s), ${neutral} neutre(s)`
  );

  if (verdict === "STRONG_BUY" || verdict === "BUY") {
    lines.push(
      "La majorité des signaux indiquent une opportunité d'achat. Cependant, faites toujours vos propres recherches (DYOR)."
    );
  } else if (verdict === "STRONG_SELL" || verdict === "SELL") {
    lines.push(
      "Les signaux suggèrent de la prudence. Ce n'est peut-être pas le meilleur moment pour acheter."
    );
  } else {
    lines.push(
      "Les signaux sont mitigés. Pas de direction claire. Patience recommandée."
    );
  }

  return lines;
}
