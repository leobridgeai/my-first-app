"use client";

import { Signal, SignalVerdict } from "@/types/signals";

interface SignalCardProps {
  signal: Signal;
}

const verdictConfig: Record<
  SignalVerdict,
  { label: string; color: string; bg: string }
> = {
  STRONG_BUY: { label: "ACHAT FORT", color: "#00d4aa", bg: "#00d4aa15" },
  BUY: { label: "ACHAT", color: "#4ade80", bg: "#4ade8015" },
  NEUTRAL: { label: "NEUTRE", color: "#ffa502", bg: "#ffa50215" },
  SELL: { label: "VENTE", color: "#fb923c", bg: "#fb923c15" },
  STRONG_SELL: { label: "VENTE FORTE", color: "#ff4757", bg: "#ff475715" },
};

const categoryIcons: Record<string, string> = {
  technical: "T",
  sentiment: "S",
  onchain: "O",
  macro: "M",
};

const categoryLabels: Record<string, string> = {
  technical: "Technique",
  sentiment: "Sentiment",
  onchain: "On-Chain",
  macro: "Macro",
};

export default function SignalCard({ signal }: SignalCardProps) {
  const config = verdictConfig[signal.verdict];

  return (
    <div
      className="rounded-xl p-4 transition-colors"
      style={{
        background: "#1a1a2e",
        border: `1px solid #2a2a40`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: "#2a2a40", color: "#9090a8" }}
          >
            {categoryIcons[signal.category] || "?"}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{signal.name}</h3>
            <span className="text-xs" style={{ color: "#9090a8" }}>
              {categoryLabels[signal.category] || signal.category}
            </span>
          </div>
        </div>
        <span
          className="text-xs font-bold px-2 py-1 rounded-full"
          style={{
            color: config.color,
            background: config.bg,
            border: `1px solid ${config.color}30`,
          }}
        >
          {config.label}
        </span>
      </div>

      <div className="mb-3">
        <span className="text-2xl font-bold" style={{ color: config.color }}>
          {signal.displayValue}
        </span>
      </div>

      {signal.details && (
        <p className="text-xs leading-relaxed mb-3" style={{ color: "#9090a8" }}>
          {signal.details}
        </p>
      )}

      <div className="flex items-center justify-between text-xs" style={{ color: "#606078" }}>
        <span>Confiance: {signal.confidence}%</span>
        <span>Poids: {Math.round(signal.weight * 100)}%</span>
      </div>

      {/* Confidence bar */}
      <div className="mt-2 w-full h-1 rounded-full" style={{ background: "#2a2a40" }}>
        <div
          className="h-1 rounded-full transition-all"
          style={{
            width: `${signal.confidence}%`,
            background: config.color,
            opacity: 0.6,
          }}
        />
      </div>
    </div>
  );
}
