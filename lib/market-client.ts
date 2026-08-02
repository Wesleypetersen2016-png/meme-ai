import type { Token } from "@/lib/data";
import { trackedMarkets } from "@/lib/data";
import { parseCompactNumber, searchResultsToTokens, type DexSearchResponse } from "@/lib/dexscreener";
import { applySocialSignal, type SocialSignal } from "@/lib/social";

export async function searchDex(query: string) {
  const response = await fetch(`/api/dexscreener?q=${encodeURIComponent(query)}`, { cache: "no-store" });
  const payload = await response.json() as DexSearchResponse;
  if (!response.ok) throw new Error(payload.error || "Token lookup failed");
  return payload.pairs ?? [];
}

export async function searchSocial(query: string) {
  const response = await fetch(`/api/social?q=${encodeURIComponent(query)}`, { cache: "no-store" });
  if (!response.ok) return null;
  return response.json() as Promise<SocialSignal>;
}

export async function enrichSocial(tokens: Token[], limit = 8) {
  return Promise.all(tokens.map(async (token, index) => {
    if (index >= limit) return token;
    const signal = await searchSocial(token.symbol).catch(() => null);
    return signal ? applySocialSignal(token, signal) : token;
  }));
}

async function fetchTrackedToken(symbol: string, chain: string, address: string) {
  const [pairs, social] = await Promise.all([searchDex(address), searchSocial(symbol).catch(() => null)]);
  const candidates = searchResultsToTokens(pairs)
    .filter(token => token.address?.toLowerCase() === address.toLowerCase() && token.chain === chain)
    .sort((a, b) => parseCompactNumber(b.liquidity) - parseCompactNumber(a.liquidity));
  const token = candidates[0];
  return token && social ? applySocialSignal(token, social) : token;
}

let cachedMarket: Token[] | null = null;
let pendingMarket: Promise<Token[]> | null = null;

export async function loadTrackedMarket(force = false) {
  if (!force && cachedMarket) return cachedMarket;
  if (!force && pendingMarket) return pendingMarket;
  pendingMarket = Promise.all(trackedMarkets.map(({ symbol, chain, address }) => fetchTrackedToken(symbol, chain, address).catch(() => null)))
    .then(results => results.filter((token): token is Token => Boolean(token)))
    .then(results => { cachedMarket = results; return results; })
    .finally(() => { pendingMarket = null; });
  return pendingMarket;
}
