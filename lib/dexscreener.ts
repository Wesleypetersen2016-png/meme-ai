import type { Token } from "@/lib/data";

type DexToken = { address?: string; name?: string; symbol?: string };

export type DexPair = {
  chainId?: string;
  pairAddress?: string;
  pairCreatedAt?: number;
  url?: string;
  baseToken?: DexToken;
  priceUsd?: string;
  priceChange?: { h24?: number };
  marketCap?: number;
  fdv?: number;
  liquidity?: { usd?: number };
  volume?: { m5?: number; h1?: number };
  txns?: { h1?: { buys?: number; sells?: number } };
};

export type DexSearchResponse = { pairs?: DexPair[]; error?: string };

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function parseCompactNumber(value: string) {
  if (!value || value === "—") return 0;
  const cleaned = value.replace(/[$,]/g, "").trim().toUpperCase();
  const match = cleaned.match(/^(-?\d+(?:\.\d+)?)\s*([KMBT])?$/);
  if (!match) return Number(cleaned) || 0;
  const multiplier = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 }[match[2] as "K" | "M" | "B" | "T"] ?? 1;
  return Number(match[1]) * multiplier;
}

export function formatUsd(value = 0, price = false) {
  if (!Number.isFinite(value)) return "—";
  if (price && value > 0 && value < 0.01) {
    return `$${value.toLocaleString("en-US", { maximumSignificantDigits: 4 })}`;
  }
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2).replace(/\.00$/, "")}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2).replace(/\.00$/, "")}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2).replace(/\.00$/, "")}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: price ? 6 : 0 })}`;
}

function formatOptionalUsd(value: number | undefined, price = false) {
  return value === undefined ? "—" : formatUsd(value, price);
}

function chainLabel(chainId = "") {
  if (chainId.toLowerCase() === "ethereum") return "ETH";
  if (chainId.toLowerCase() === "solana") return "SOL";
  return chainId.slice(0, 5).toUpperCase() || "OTHER";
}

function tokenColor(symbol = "?") {
  let hash = 0;
  for (const character of symbol) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return `hsl(${hash % 360} 55% 64%)`;
}

export function pairToToken(pair: DexPair): Token | null {
  const base = pair.baseToken;
  if (!base?.symbol) return null;
  const liquidity = pair.liquidity?.usd;
  const marketCap = pair.marketCap ?? pair.fdv;
  const volume5m = pair.volume?.m5;
  const volume1h = pair.volume?.h1;
  const buys = pair.txns?.h1?.buys;
  const sells = pair.txns?.h1?.sells;
  const hasTransactionData = buys !== undefined || sells !== undefined;
  const buySellRatio = hasTransactionData ? (sells ? (buys ?? 0) / sells : buys ? 2 : 0) : undefined;
  const liquidityStrength = clamp((Math.log10((liquidity ?? 0) + 1) - 3) * 24);
  const activityStrength = clamp((Math.log10((volume1h ?? 0) + 1) - 2) * 22);
  const momentumStrength = clamp(50 + (pair.priceChange?.h24 ?? 0) * 1.5);
  const buyStrength = buySellRatio === undefined ? 50 : clamp(50 + (buySellRatio - 1) * 35);
  const riskScore = clamp(82 - liquidityStrength * 0.58 - Math.min(20, Math.log10((marketCap ?? 0) + 1) * 2));
  const convictionScore = clamp(liquidityStrength * 0.35 + activityStrength * 0.25 + momentumStrength * 0.2 + buyStrength * 0.2);
  const risk = riskScore > 55 ? "High" : riskScore > 25 ? "Medium" : "Low";

  return {
    id: pair.pairAddress ?? base.address,
    address: base.address,
    pairUrl: pair.url,
    pairCreatedAt: pair.pairCreatedAt,
    name: base.name || base.symbol,
    symbol: base.symbol,
    color: tokenColor(base.symbol),
    price: pair.priceUsd === undefined ? "—" : formatUsd(Number(pair.priceUsd), true),
    change: pair.priceChange?.h24,
    marketCap: formatOptionalUsd(marketCap),
    liquidity: formatOptionalUsd(liquidity),
    volume5m: formatOptionalUsd(volume5m),
    volume1h: formatOptionalUsd(volume1h),
    buySellRatio: buySellRatio?.toFixed(2),
    convictionScore,
    riskScore,
    risk,
    chain: chainLabel(pair.chainId),
  };
}

export function searchResultsToTokens(pairs: DexPair[] = []) {
  const bestByToken = new Map<string, DexPair>();
  for (const pair of pairs) {
    const key = pair.baseToken?.address ?? `${pair.chainId}:${pair.baseToken?.symbol}`;
    if (!key) continue;
    const current = bestByToken.get(key);
    if (!current || (pair.liquidity?.usd ?? 0) > (current.liquidity?.usd ?? 0)) bestByToken.set(key, pair);
  }
  return [...bestByToken.values()].map(pairToToken).filter((token): token is Token => Boolean(token)).slice(0, 20);
}
