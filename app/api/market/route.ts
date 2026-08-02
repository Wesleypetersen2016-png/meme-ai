import { NextResponse } from "next/server";
import type { Token } from "@/lib/data";
import { formatUsd } from "@/lib/dexscreener";

export const revalidate = 120;
export const dynamic = "force-dynamic";

type CoinGeckoMarket = {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price?: number;
  market_cap?: number;
  market_cap_rank?: number;
  total_volume?: number;
  high_24h?: number;
  low_24h?: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h?: number;
  price_change_percentage_7d_in_currency?: number;
  last_updated?: string;
};

const stablecoins = new Set(["usdt", "usdc", "dai", "usds", "usde", "fdusd", "pyusd", "usdd", "tusd", "usdtb", "usyc", "susds", "usdf", "usdg", "usd1", "usdy", "rlusd", "buidl"]);
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

function colorFor(symbol: string) {
  let hash = 0;
  for (const character of symbol) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return `hsl(${hash % 360} 55% 64%)`;
}

function toToken(coin: CoinGeckoMarket): Token {
  const cap = coin.market_cap ?? 0;
  const volume = coin.total_volume ?? 0;
  const change1h = coin.price_change_percentage_1h_in_currency;
  const change24h = coin.price_change_percentage_24h;
  const change7d = coin.price_change_percentage_7d_in_currency;
  const capStrength = clamp((Math.log10(cap + 1) - 7) * 20);
  const turnoverStrength = clamp((volume / Math.max(cap, 1)) * 500);
  const shortMomentum = clamp(50 + (change24h ?? 0) * 3);
  const trendMomentum = clamp(50 + (change7d ?? 0) * 1.4);
  const riskScore = clamp(72 - capStrength * 0.55 + Math.abs(change24h ?? 0) * 1.2 + Math.abs(change7d ?? 0) * 0.35);
  const convictionScore = clamp(capStrength * 0.2 + turnoverStrength * 0.2 + shortMomentum * 0.25 + trendMomentum * 0.35);
  return {
    id: coin.id,
    image: coin.image,
    rank: coin.market_cap_rank,
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    color: colorFor(coin.symbol),
    price: coin.current_price === undefined ? "—" : formatUsd(coin.current_price, true),
    change: change24h,
    change1h,
    change7d,
    marketCap: coin.market_cap === undefined ? "—" : formatUsd(coin.market_cap),
    liquidity: "—",
    volume5m: "—",
    volume1h: "—",
    volume24h: coin.total_volume === undefined ? "—" : formatUsd(coin.total_volume),
    high24h: coin.high_24h === undefined ? "—" : formatUsd(coin.high_24h, true),
    low24h: coin.low_24h === undefined ? "—" : formatUsd(coin.low_24h, true),
    lastUpdated: coin.last_updated,
    convictionScore,
    riskScore,
    risk: riskScore > 55 ? "High" : riskScore > 30 ? "Medium" : "Low",
    chain: "MARKET",
  };
}

export async function GET() {
  const apiKey = process.env.COINGECKO_API_KEY;
  const params = new URLSearchParams({
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: "60",
    page: "1",
    sparkline: "false",
    price_change_percentage: "1h,7d",
  });
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?${params}`, {
      headers: apiKey ? { "x-cg-demo-api-key": apiKey } : undefined,
      next: { revalidate: 120 },
    });
    if (!response.ok) throw new Error(`CoinGecko returned ${response.status}`);
    const markets = await response.json() as CoinGeckoMarket[];
    const tokens = markets.filter(coin => !stablecoins.has(coin.symbol.toLowerCase())).slice(0, 40).map(toToken);
    return NextResponse.json({ tokens, provider: "CoinGecko", updatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } });
  } catch (error) {
    return NextResponse.json({ tokens: [], error: error instanceof Error ? error.message : "Market feed unavailable" }, { status: 502 });
  }
}
