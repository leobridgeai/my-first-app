"use client";

import { Alert, AlertSeverity } from "@/types/signals";

interface AlertsPanelProps {
  alerts: Alert[];
}

const severityConfig: Record<
  AlertSeverity,
  { icon: string; color: string; bg: string; border: string }
> = {
  critical: {
    icon: "!",
    color: "#ff4757",
    bg: "#ff475710",
    border: "#ff475730",
  },
  warning: {
    icon: "!",
    color: "#ffa502",
    bg: "#ffa50210",
    border: "#ffa50230",
  },
  info: {
    icon: "i",
    color: "#3742fa",
    bg: "#3742fa10",
    border: "#3742fa30",
  },
};

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{ background: "#1a1a2e", border: "1px solid #2a2a40" }}
      >
        <div className="text-2xl mb-2">-</div>
        <p style={{ color: "#9090a8" }}>Aucune alerte active</p>
        <p className="text-xs mt-1" style={{ color: "#606078" }}>
          Les alertes apparaissent lorsque des conditions de marché notables sont détectées.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertItem key={alert.id} alert={alert} />
      ))}
    </div>
  );
}

function AlertItem({ alert }: { alert: Alert }) {
  const config = severityConfig[alert.severity];

  return (
    <div
      className={`rounded-xl p-4 ${alert.severity === "critical" ? "pulse-glow" : ""}`}
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
          style={{
            background: `${config.color}20`,
            color: config.color,
            border: `1px solid ${config.color}40`,
          }}
        >
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm" style={{ color: config.color }}>
            {alert.title}
          </h4>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "#9090a8" }}>
            {alert.message}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{ background: "#2a2a40", color: "#606078" }}
            >
              {alert.type}
            </span>
            <span className="text-xs" style={{ color: "#606078" }}>
              {new Date(alert.timestamp).toLocaleTimeString("fr-FR")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
