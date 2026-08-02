"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeading } from "@/components/page-heading";
import { TokenTable } from "@/components/token-table";
import type { Token } from "@/lib/data";
import { parseCompactNumber, searchResultsToTokens } from "@/lib/dexscreener";
import { useAlertPreferences } from "@/hooks/use-alert-preferences";
import { useGoals } from "@/hooks/use-goals";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { goalRecommendations } from "@/lib/recommendations";
import { enrichSocial, loadTrackedMarket, searchDex } from "@/lib/market-client";

type Preset = "Momentum" | "New pairs" | "Buy pressure" | "High liquidity" | "Low risk";

const presets: Preset[] = ["Momentum", "New pairs", "Buy pressure", "High liquidity", "Low risk"];

export function Scanner({ initialQuery = "" }: { initialQuery?: string }) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [source, setSource] = useState<"market" | "lookup">("market");
  const [preset, setPreset] = useState<Preset>("Momentum");
  const [minLiquidity, setMinLiquidity] = useState(0);
  const [marketCap, setMarketCap] = useState("all");
  const [minScore, setMinScore] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Loading live market data…");
  const { goals } = useGoals();
  const { alerts } = useAlertPreferences();
  const { permission: notificationPermission, notify } = usePushNotifications();

  const runScan = useCallback(async (query = initialQuery) => {
    setStatus("loading");
    setMessage(query ? `Looking up ${query}…` : "Refreshing market data from DexScreener…");
    try {
      if (query) {
        const results = await enrichSocial(searchResultsToTokens(await searchDex(query)));
        setTokens(results);
        setSource("lookup");
        const socialSources = Math.max(0, ...results.map(token => token.socialSources ?? 0));
        setMessage(results.length ? `Found ${results.length} matching token${results.length === 1 ? "" : "s"}${socialSources ? ` · ${socialSources} social sources factored` : " · social sources need credentials"}.` : `No DexScreener pairs found for “${query}”.`);
      } else {
        const refreshed = await loadTrackedMarket(true);
        setTokens(refreshed);
        setSource("market");
        const signal = goalRecommendations(refreshed, goals).find(item => item.action === "Consider");
        if (signal && alerts.buySignals && notificationPermission === "granted") {
          await notify(`NexIQ · ${signal.token.symbol} setup`, `${signal.fitScore} goal fit · Consider up to ${signal.allocation}% based on your current limits.`, `/scanner?q=${encodeURIComponent(signal.token.symbol)}`);
        }
        const socialSources = Math.max(0, ...refreshed.map(token => token.socialSources ?? 0));
        setMessage(refreshed.length ? `Scan complete · ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}${socialSources ? ` · ${socialSources} social sources factored` : " · social sources need credentials"}` : "No live market results were returned.");
      }
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "The scan could not be completed.");
    }
  }, [alerts.buySignals, goals, initialQuery, notificationPermission, notify]);

  useEffect(() => {
    if (initialQuery) {
      setMinLiquidity(0);
      setMarketCap("all");
      setMinScore(0);
      setPreset("Momentum");
      void runScan(initialQuery);
    }
    else {
      setTokens([]);
      setSource("market");
      setMinLiquidity(0);
      setMarketCap("all");
      setMinScore(0);
      setPreset("Momentum");
      void runScan("");
    }
  }, [initialQuery, runScan]);

  const filteredTokens = useMemo(() => {
    const [minMarketCap, maxMarketCap] = marketCap === "under-100m" ? [0, 100e6]
      : marketCap === "100m-1b" ? [100e6, 1e9]
      : marketCap === "over-1b" ? [1e9, Number.POSITIVE_INFINITY]
      : [0, Number.POSITIVE_INFINITY];
    const rows = tokens.filter(token => {
      const liquidity = parseCompactNumber(token.liquidity);
      const cap = parseCompactNumber(token.marketCap);
      return liquidity >= minLiquidity && cap >= minMarketCap && cap <= maxMarketCap && token.convictionScore >= minScore;
    });
    const sorted = [...rows];
    if (preset === "Momentum") sorted.sort((a, b) => (b.change ?? Number.NEGATIVE_INFINITY) - (a.change ?? Number.NEGATIVE_INFINITY));
    if (preset === "New pairs") sorted.sort((a, b) => (b.pairCreatedAt ?? 0) - (a.pairCreatedAt ?? 0));
    if (preset === "Buy pressure") sorted.sort((a, b) => Number(b.buySellRatio ?? -1) - Number(a.buySellRatio ?? -1));
    if (preset === "High liquidity") sorted.sort((a, b) => parseCompactNumber(b.liquidity) - parseCompactNumber(a.liquidity));
    if (preset === "Low risk") sorted.sort((a, b) => a.riskScore - b.riskScore);
    return sorted;
  }, [marketCap, minLiquidity, minScore, preset, tokens]);

  return <div className="space-y-6">
    <PageHeading eyebrow="Discovery engine" title={initialQuery ? "Token lookup" : "Token scanner"} description={initialQuery ? `DexScreener results for “${initialQuery}”. Adjust the filters below to narrow the matches.` : "Filter live markets by the signals that matter, then let NexIQ surface the strongest goal-fit setups."} action={<button type="button" onClick={() => void runScan()} disabled={status === "loading"} className="rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-black disabled:cursor-wait disabled:opacity-60">{status === "loading" ? "Scanning…" : "Run scan ↗"}</button>} />

    <section className="panel grid gap-4 p-4 sm:grid-cols-3 lg:p-5">
      <label><span className="eyebrow">Min. liquidity</span><select aria-label="Minimum liquidity" value={minLiquidity} onChange={event => setMinLiquidity(Number(event.target.value))} className="pill mono mt-2 w-full px-3 py-3 text-xs outline-none"><option value={0}>Any liquidity</option><option value={250000}>$250,000</option><option value={1000000}>$1 million</option><option value={5000000}>$5 million</option></select></label>
      <label><span className="eyebrow">Market cap</span><select aria-label="Market cap range" value={marketCap} onChange={event => setMarketCap(event.target.value)} className="pill mono mt-2 w-full px-3 py-3 text-xs outline-none"><option value="all">All market caps</option><option value="under-100m">Under $100M</option><option value="100m-1b">$100M — $1B</option><option value="over-1b">$1B+</option></select></label>
      <label><span className="eyebrow">IQ Score</span><select aria-label="Minimum IQ Score" value={minScore} onChange={event => setMinScore(Number(event.target.value))} className="pill mono mt-2 w-full px-3 py-3 text-xs outline-none"><option value={0}>Any score</option><option value={50}>50+</option><option value={70}>70+</option><option value={85}>85+</option></select></label>
    </section>

    <div className="flex gap-2 overflow-x-auto mobile-scroll" aria-label="Scanner ranking preset">{presets.map(option => <button type="button" key={option} aria-pressed={preset === option} onClick={() => setPreset(option)} className={`pill shrink-0 px-3 py-2 text-xs ${preset === option ? "border-[var(--accent)] text-[var(--accent)]" : "text-[#888f88]"}`}>{option}</button>)}</div>

    <div role="status" aria-live="polite" className={`mono text-[10px] ${status === "error" ? "text-[#ff7f77]" : "text-[#777e77]"}`}>{message}</div>
    <TokenTable data={filteredTokens} title={source === "lookup" ? "Lookup results" : "Market intelligence"} description={`${filteredTokens.length} token${filteredTokens.length === 1 ? "" : "s"} · ranked by ${preset.toLowerCase()}`} emptyMessage="No tokens match these filters. Try lowering one of the thresholds." />
  </div>;
}
