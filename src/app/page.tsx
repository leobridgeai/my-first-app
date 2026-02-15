"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardData } from "@/types/signals";
import PriceHeader from "@/components/dashboard/PriceHeader";
import ScoreGauge from "@/components/dashboard/ScoreGauge";
import DecisionPanel from "@/components/dashboard/DecisionPanel";
import SignalCard from "@/components/signals/SignalCard";
import AlertsPanel from "@/components/alerts/AlertsPanel";

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/signals");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: DashboardData = await res.json();
      setData(json);
    } catch (err) {
      setError("Erreur de chargement des données. Vérifiez votre connexion.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error && !data) {
    return <ErrorScreen message={error} onRetry={fetchData} />;
  }

  if (!data) return null;

  const technicalSignals = data.signals.filter((s) => s.category === "technical");
  const sentimentSignals = data.signals.filter((s) => s.category === "sentiment");
  const onchainSignals = data.signals.filter((s) => s.category === "onchain");

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{ background: "#0a0a0fdd", borderBottom: "1px solid #2a2a40" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: "#3742fa", color: "#fff" }}
            >
              B
            </div>
            <h1 className="text-lg font-bold">Bitcoin Signal Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{
                background: autoRefresh ? "#00d4aa15" : "#2a2a40",
                color: autoRefresh ? "#00d4aa" : "#9090a8",
                border: `1px solid ${autoRefresh ? "#00d4aa30" : "#2a2a40"}`,
              }}
            >
              Auto-refresh: {autoRefresh ? "ON" : "OFF"}
            </button>
            <button
              onClick={fetchData}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: "#2a2a40", color: "#9090a8" }}
            >
              Rafraichir
            </button>
            <span className="text-xs" style={{ color: "#606078" }}>
              Mis à jour: {new Date(data.lastUpdated).toLocaleTimeString("fr-FR")}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Error banner */}
        {error && (
          <div
            className="rounded-xl p-3 text-sm"
            style={{ background: "#ff475715", border: "1px solid #ff475730", color: "#ff4757" }}
          >
            {error}
          </div>
        )}

        {/* Price Header */}
        <PriceHeader price={data.price} />

        {/* Main Grid: Score + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Gauge - Center piece */}
          <div
            className="lg:col-span-1 rounded-xl p-6 flex flex-col items-center justify-center"
            style={{ background: "#1a1a2e", border: "1px solid #2a2a40" }}
          >
            <h2 className="text-sm font-semibold mb-4" style={{ color: "#9090a8" }}>
              SCORE COMPOSITE
            </h2>
            <ScoreGauge
              score={data.decision.compositeScore}
              verdict={data.decision.verdict}
              confidence={data.decision.confidence}
            />
          </div>

          {/* Decision Panel */}
          <div className="lg:col-span-1">
            <DecisionPanel decision={data.decision} />
          </div>

          {/* Alerts Panel */}
          <div className="lg:col-span-1">
            <h2 className="text-sm font-semibold mb-3" style={{ color: "#9090a8" }}>
              ALERTES ({data.alerts.length})
            </h2>
            <AlertsPanel alerts={data.alerts} />
          </div>
        </div>

        {/* Signals Grid by Category */}
        <SignalSection title="Indicateurs Techniques" signals={technicalSignals} />
        <SignalSection title="Sentiment du Marché" signals={sentimentSignals} />
        <SignalSection title="Indicateurs On-Chain / Macro" signals={onchainSignals} />

        {/* Architecture legend */}
        <footer
          className="rounded-xl p-6 text-xs"
          style={{ background: "#1a1a2e", border: "1px solid #2a2a40", color: "#606078" }}
        >
          <h3 className="font-semibold mb-2" style={{ color: "#9090a8" }}>
            Architecture du Système
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="font-semibold" style={{ color: "#3742fa" }}>
                Signal Engine
              </span>{" "}
              — Collecte les données de CoinGecko (prix, volume, sparkline) et Alternative.me
              (Fear &amp; Greed). Calcule RSI, Momentum, Volatilité à partir des données brutes.
            </div>
            <div>
              <span className="font-semibold" style={{ color: "#ffa502" }}>
                Decision Layer
              </span>{" "}
              — Pondère chaque signal selon son importance et sa confiance. Produit un score
              composite de -100 à +100 et un verdict final.
            </div>
            <div>
              <span className="font-semibold" style={{ color: "#ff4757" }}>
                Alerts Layer
              </span>{" "}
              — Surveille les seuils critiques, les divergences entre signaux et les mouvements
              de prix importants. Génère des alertes classées par sévérité.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function SignalSection({
  title,
  signals,
}: {
  title: string;
  signals: DashboardData["signals"];
}) {
  if (signals.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-semibold mb-3" style={{ color: "#9090a8" }}>
        {title.toUpperCase()}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {signals.map((signal) => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#0a0a0f" }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl mb-4 pulse-glow"
        style={{ background: "#3742fa", color: "#fff" }}
      >
        B
      </div>
      <p className="text-sm" style={{ color: "#9090a8" }}>
        Chargement des signaux Bitcoin...
      </p>
    </div>
  );
}

function ErrorScreen({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#0a0a0f" }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl mb-4"
        style={{ background: "#ff4757", color: "#fff" }}
      >
        !
      </div>
      <p className="text-sm mb-4" style={{ color: "#ff4757" }}>
        {message}
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-lg text-sm"
        style={{ background: "#2a2a40", color: "#e8e8f0" }}
      >
        Réessayer
      </button>
    </div>
  );
}
