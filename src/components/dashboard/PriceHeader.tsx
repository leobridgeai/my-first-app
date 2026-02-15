"use client";

import { PriceData } from "@/types/signals";

interface PriceHeaderProps {
  price: PriceData;
}

export default function PriceHeader({ price }: PriceHeaderProps) {
  const formatPrice = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const formatPercent = (n: number) => {
    const sign = n > 0 ? "+" : "";
    return `${sign}${n.toFixed(2)}%`;
  };

  const changeColor = (n: number) => (n >= 0 ? "#00d4aa" : "#ff4757");

  return (
    <div className="rounded-xl p-6" style={{ background: "#1a1a2e", border: "1px solid #2a2a40" }}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl font-bold">Bitcoin</span>
            <span className="text-sm px-2 py-0.5 rounded" style={{ background: "#2a2a40", color: "#9090a8" }}>
              BTC
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold tracking-tight">{formatPrice(price.current)}</span>
            <span
              className="text-lg font-semibold"
              style={{ color: changeColor(price.change24h) }}
            >
              {formatPercent(price.change24h)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <StatBox label="Haut 24h" value={formatPrice(price.high24h)} />
          <StatBox label="Bas 24h" value={formatPrice(price.low24h)} />
          <StatBox label="Volume 24h" value={`$${(price.volume24h / 1e9).toFixed(1)}B`} />
          <StatBox label="Cap. Marché" value={`$${(price.marketCap / 1e12).toFixed(2)}T`} />
        </div>
      </div>
      {/* Mini sparkline */}
      {price.sparkline7d.length > 0 && (
        <div className="mt-4">
          <MiniSparkline data={price.sparkline7d} />
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2 rounded-lg" style={{ background: "#12121a" }}>
      <div className="text-xs" style={{ color: "#9090a8" }}>
        {label}
      </div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function MiniSparkline({ data }: { data: number[] }) {
  // Sample to ~50 points for display
  const step = Math.max(1, Math.floor(data.length / 50));
  const sampled = data.filter((_, i) => i % step === 0);

  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const range = max - min || 1;

  const width = 600;
  const height = 40;

  const points = sampled
    .map((val, i) => {
      const x = (i / (sampled.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const lastVal = sampled[sampled.length - 1];
  const firstVal = sampled[0];
  const color = lastVal >= firstVal ? "#00d4aa" : "#ff4757";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-10">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} opacity="0.8" />
      <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
      <polyline
        fill="url(#sparkGrad)"
        stroke="none"
        points={`0,${height} ${points} ${width},${height}`}
      />
    </svg>
  );
}
