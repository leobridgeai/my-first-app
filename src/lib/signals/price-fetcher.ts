import { PriceData } from "@/types/signals";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export async function fetchPriceData(): Promise<PriceData> {
  try {
    const res = await fetch(
      `${COINGECKO_BASE}/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=true`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.status}`);
    }

    const data = await res.json();

    return {
      current: data.market_data.current_price.usd,
      change24h: data.market_data.price_change_percentage_24h,
      change7d: data.market_data.price_change_percentage_7d,
      change30d: data.market_data.price_change_percentage_30d,
      high24h: data.market_data.high_24h.usd,
      low24h: data.market_data.low_24h.usd,
      marketCap: data.market_data.market_cap.usd,
      volume24h: data.market_data.total_volume.usd,
      sparkline7d: data.market_data.sparkline_7d?.price ?? [],
    };
  } catch (error) {
    console.error("Failed to fetch price data:", error);
    return getFallbackPriceData();
  }
}

function getFallbackPriceData(): PriceData {
  return {
    current: 0,
    change24h: 0,
    change7d: 0,
    change30d: 0,
    high24h: 0,
    low24h: 0,
    marketCap: 0,
    volume24h: 0,
    sparkline7d: [],
  };
}
