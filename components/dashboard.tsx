"use client";

import Link from "next/link";
import { RecommendationPanel } from "./recommendation-panel";
import { useGoals } from "@/hooks/use-goals";
import { usePortfolio } from "@/hooks/use-portfolio";
import { usePreferences } from "@/hooks/use-preferences";
import { goalRecommendations } from "@/lib/recommendations";
import { useMarketData } from "@/hooks/use-market-data";

export function Dashboard({ query = "" }: { query?: string }) {
  const { preferences } = usePreferences();
  const { goals } = useGoals();
  const portfolio = usePortfolio();
  const market = useMarketData();
  const tokens = market.tokens;
  const visibleTokens = query ? tokens.filter(token => `${token.name} ${token.symbol}`.toLowerCase().includes(query.toLowerCase())) : tokens;
  const recommendations = goalRecommendations(visibleTokens, goals);
  const stats = [
    { label: "Market analyzed", value: market.status === "loading" ? "—" : String(tokens.length), change: market.status === "error" ? "Feed unavailable" : "Live top assets", detail: "Excludes stablecoins" },
    { label: "Buy now", value: market.status === "loading" ? "—" : String(recommendations.filter(item => item.action === "Consider").length), change: `Fit ≥ ${goals.alertScore}`, detail: goals.riskTolerance },
    { label: "My positions", value: String(portfolio.positions.length), change: `${goals.maxLoss}% loss limit`, detail: "Monitored" },
  ];
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><div className="eyebrow">{query ? "Market research" : `Market brief for ${preferences.displayName}`}</div><h1 className="mt-3 text-3xl font-medium tracking-[-.04em] md:text-4xl">{query ? `Results for “${query}”` : "Buy, wait, or sell."}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#858b96]">{query ? "Live matches from the broad-market universe, ranked against your strategy." : "NexIQ ranks the broader crypto market against your goals. Open any signal to see the evidence and risk."}</p></div>
      <Link href={query ? "/" : "/portfolio"} className="flex w-fit items-center rounded-[10px] bg-[var(--accent)] px-4 py-3 text-sm font-medium text-[#0b0d12] transition hover:brightness-105">{query ? "Back to today" : "Review positions"}</Link>
    </div>

    <RecommendationPanel data={visibleTokens} loading={market.status === "loading"} />

    <section className="grid gap-3 sm:grid-cols-3">
      {stats.map((s) => <div key={s.label} className="panel metric-line p-4 md:p-5"><div className="eyebrow">{s.label}</div><div className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">{s.value}</div><div className="mt-3 flex items-center justify-between gap-2"><span className="mono text-[10px] text-[var(--accent)]">{s.change}</span><span className="hidden text-[10px] text-[#656c65] sm:inline">{s.detail}</span></div></div>)}
    </section>

  </div>;
}
