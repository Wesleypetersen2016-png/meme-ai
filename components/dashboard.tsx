"use client";

import Link from "next/link";
import { RecommendationPanel } from "./recommendation-panel";
import { useGoals } from "@/hooks/use-goals";
import { usePortfolio } from "@/hooks/use-portfolio";
import { usePreferences } from "@/hooks/use-preferences";
import { useWatchlist } from "@/hooks/use-watchlist";
import { goalRecommendations } from "@/lib/recommendations";
import { useMarketData } from "@/hooks/use-market-data";

export function Dashboard() {
  const { preferences } = usePreferences();
  const { goals } = useGoals();
  const portfolio = usePortfolio();
  const watchlist = useWatchlist();
  const market = useMarketData();
  const tokens = market.tokens;
  const recommendations = goalRecommendations(tokens, goals);
  const stats = [
    { label: "Live markets", value: market.status === "loading" ? "—" : String(tokens.length), change: market.status === "error" ? "Feed unavailable" : "Current data", detail: tokens.length ? `${new Set(tokens.map(token => token.chain)).size} chains` : "" },
    { label: "Goal-fit signals", value: market.status === "loading" ? "—" : String(recommendations.filter(item => item.action === "Consider").length), change: `Fit ≥ ${goals.alertScore}`, detail: goals.riskTolerance },
    { label: "Watchlist", value: String(watchlist.symbols.length), change: "Device saved", detail: "Your radar" },
    { label: "Active buys", value: String(portfolio.positions.length), change: `${goals.maxLoss}% loss limit`, detail: "Goal monitored" },
  ];
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><div className="eyebrow acid">Good to see you, {preferences.displayName}</div><h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] md:text-4xl">What should I consider?</h1><p className="mt-2 max-w-xl text-sm text-[#838a83]">Start with the ranked list below. Tap any candidate for the reason, risk, and modeled scenario.</p></div>
      <Link href="/scanner" className="flex w-fit items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[#0a0c0b] transition hover:brightness-110">Open live scanner <span>↗</span></Link>
    </div>

    <RecommendationPanel data={tokens} loading={market.status === "loading"} />

    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s, i) => <div key={s.label} className="panel metric-line p-4 md:p-5"><div className="eyebrow">{s.label}</div><div className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">{s.value}</div><div className="mt-3 flex items-center justify-between gap-2"><span className={`mono text-[10px] ${i === 3 ? "text-[#f0c45b]" : "text-[var(--accent)]"}`}>{s.change}</span><span className="hidden text-[10px] text-[#656c65] sm:inline">{s.detail}</span></div></div>)}
    </section>

  </div>;
}
