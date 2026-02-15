"use client";

import { DecisionResult } from "@/types/signals";

interface DecisionPanelProps {
  decision: DecisionResult;
}

export default function DecisionPanel({ decision }: DecisionPanelProps) {
  const { signalBreakdown, reasoning } = decision;
  const total = signalBreakdown.bullish + signalBreakdown.bearish + signalBreakdown.neutral;

  return (
    <div
      className="rounded-xl p-6"
      style={{ background: "#1a1a2e", border: "1px solid #2a2a40" }}
    >
      <h3 className="font-semibold mb-4">Analyse de la Décision</h3>

      {/* Signal breakdown bar */}
      {total > 0 && (
        <div className="mb-4">
          <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-2">
            {signalBreakdown.bullish > 0 && (
              <div
                className="rounded-l-full"
                style={{
                  width: `${(signalBreakdown.bullish / total) * 100}%`,
                  background: "#00d4aa",
                }}
              />
            )}
            {signalBreakdown.neutral > 0 && (
              <div
                style={{
                  width: `${(signalBreakdown.neutral / total) * 100}%`,
                  background: "#ffa502",
                }}
              />
            )}
            {signalBreakdown.bearish > 0 && (
              <div
                className="rounded-r-full"
                style={{
                  width: `${(signalBreakdown.bearish / total) * 100}%`,
                  background: "#ff4757",
                }}
              />
            )}
          </div>
          <div className="flex justify-between text-xs" style={{ color: "#9090a8" }}>
            <span style={{ color: "#00d4aa" }}>
              {signalBreakdown.bullish} haussier{signalBreakdown.bullish > 1 ? "s" : ""}
            </span>
            <span style={{ color: "#ffa502" }}>
              {signalBreakdown.neutral} neutre{signalBreakdown.neutral > 1 ? "s" : ""}
            </span>
            <span style={{ color: "#ff4757" }}>
              {signalBreakdown.bearish} baissier{signalBreakdown.bearish > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      {/* Reasoning list */}
      <div className="space-y-1.5">
        {reasoning.map((line, i) => {
          if (line === "---") {
            return (
              <hr key={i} className="my-2" style={{ borderColor: "#2a2a40" }} />
            );
          }
          // First few lines are the summary (bold)
          const isSummary = i < reasoning.indexOf("---");
          return (
            <p
              key={i}
              className={`text-xs leading-relaxed ${isSummary ? "font-medium" : ""}`}
              style={{ color: isSummary ? "#e8e8f0" : "#9090a8" }}
            >
              {line}
            </p>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div
        className="mt-4 p-3 rounded-lg text-xs"
        style={{ background: "#12121a", color: "#606078" }}
      >
        Ce tableau de bord est un outil d&apos;aide à la décision. Il ne constitue pas un
        conseil financier. Faites toujours vos propres recherches (DYOR) avant
        d&apos;investir.
      </div>
    </div>
  );
}
