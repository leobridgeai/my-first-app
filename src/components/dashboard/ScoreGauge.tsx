"use client";

import { SignalVerdict } from "@/types/signals";

interface ScoreGaugeProps {
  score: number; // -100 to 100
  verdict: SignalVerdict;
  confidence: number;
}

const verdictLabels: Record<SignalVerdict, string> = {
  STRONG_BUY: "ACHAT FORT",
  BUY: "ACHAT",
  NEUTRAL: "NEUTRE",
  SELL: "VENTE",
  STRONG_SELL: "VENTE FORTE",
};

const verdictColors: Record<SignalVerdict, string> = {
  STRONG_BUY: "#00d4aa",
  BUY: "#4ade80",
  NEUTRAL: "#ffa502",
  SELL: "#fb923c",
  STRONG_SELL: "#ff4757",
};

export default function ScoreGauge({ score, verdict, confidence }: ScoreGaugeProps) {
  // Normalize score from [-100, 100] to [0, 1] for the gauge
  const normalized = (score + 100) / 200;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference * (1 - normalized * 0.75); // 75% of circle
  const color = verdictColors[verdict];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-[135deg]">
          {/* Background arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#2a2a40"
            strokeWidth="8"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
          />
          {/* Value arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="gauge-fill"
            style={{ filter: `drop-shadow(0 0 6px ${color}50)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color }}>
            {score > 0 ? "+" : ""}
            {score}
          </span>
          <span className="text-sm mt-1" style={{ color: "#9090a8" }}>
            / 100
          </span>
        </div>
      </div>
      <div
        className="mt-2 px-4 py-2 rounded-full text-sm font-bold tracking-wider"
        style={{
          backgroundColor: `${color}15`,
          color,
          border: `1px solid ${color}40`,
        }}
      >
        {verdictLabels[verdict]}
      </div>
      <span className="text-xs mt-2" style={{ color: "#9090a8" }}>
        Confiance: {confidence}%
      </span>
    </div>
  );
}
