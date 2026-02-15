import { Signal, PriceData } from "@/types/signals";
import { fetchPriceData } from "./price-fetcher";
import { fetchFearGreedSignal } from "./fear-greed";
import { computeTechnicalSignals } from "./technical";
import { computeOnchainSignals } from "./onchain";

/**
 * SIGNAL ENGINE
 *
 * Aggregates signals from all sources:
 * - Market data (price, volume) from CoinGecko
 * - Sentiment (Fear & Greed Index) from Alternative.me
 * - Technical indicators (RSI, Momentum, Volatility) computed locally
 * - On-chain proxy signals (market cap analysis, price trends)
 */
export async function collectAllSignals(): Promise<{
  price: PriceData;
  signals: Signal[];
}> {
  // Fetch external data in parallel
  const [price, fearGreed] = await Promise.all([
    fetchPriceData(),
    fetchFearGreedSignal(),
  ]);

  // Compute derived signals from price data
  const technicalSignals = computeTechnicalSignals(price);
  const onchainSignals = computeOnchainSignals(price);

  // Combine all signals
  const signals: Signal[] = [fearGreed, ...technicalSignals, ...onchainSignals];

  return { price, signals };
}
