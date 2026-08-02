"use client";

import Link from "next/link";
import { useState } from "react";
import { useGoals } from "@/hooks/use-goals";
import type { Token } from "@/lib/data";
import { goalRecommendations } from "@/lib/recommendations";

const signed = (value: number) => `${value > 0 ? "+" : ""}${value}%`;

export function RecommendationPanel({ data, limit = 5, loading = false }: { data: Token[]; limit?: number; loading?: boolean }) {
  const { goals } = useGoals();
  const [openId, setOpenId] = useState<string | null>(null);
  const recommendations = goalRecommendations(data, goals).slice(0, limit);

  return <section className="panel overflow-hidden">
    <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] p-5 md:p-6">
      <div><div className="eyebrow">Market outlook</div><h2 className="mt-2 text-lg font-semibold tracking-[-.015em]">Today’s decisions</h2><p className="mt-1 text-xs text-[#818793]">Ranked against your strategy. Select an asset to review the evidence.</p></div>
      <Link href="/settings" className="shrink-0 text-xs text-[#9ba1ac] transition hover:text-white">Edit strategy</Link>
    </div>
    <div className="divide-y divide-[var(--line)]">{recommendations.map(({ token, action, fitScore, allocation, reasons, cautions, breakdown, projection }) => {
      const id = token.id ?? `${token.chain}:${token.symbol}`;
      const isOpen = openId === id;
      return <article key={id} className="recommendation-row group">
        <button type="button" aria-expanded={isOpen} onClick={() => setOpenId(current => current === id ? null : id)} className="grid w-full gap-4 p-5 text-left sm:grid-cols-[1fr_auto] sm:items-center md:px-6">
          <div className="flex min-w-0 items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] border border-[#30343e] bg-[#171a20] text-xs font-semibold text-[#d7dae0]">{token.symbol.slice(0, 2)}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-medium tracking-[-.01em]">{token.name}</h3><span className="mono text-[10px] text-[#737985]">{token.symbol}{token.rank ? ` · #${token.rank}` : ` · ${token.chain}`}</span></div><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#858b96]"><span>{token.price}</span><span className={token.change !== undefined && token.change >= 0 ? "text-[#9bc4a8]" : "text-[#c69ba2]"}>{token.change === undefined ? "24h unavailable" : `${token.change >= 0 ? "+" : ""}${token.change.toFixed(1)}% · 24h`}</span><span>{token.volume24h ? `${token.volume24h} volume` : `${token.liquidity} liquidity`}</span></div></div></div>
          <div className="flex items-center justify-between gap-4 sm:justify-end sm:text-right"><div><div className="mono text-base font-semibold text-[#e6e8ec]">{fitScore}</div><div className="mt-1 text-[10px] text-[#6f7580]">Fit score</div></div><div className={`rounded-lg border px-3 py-2 text-xs font-medium ${action === "Consider" ? "border-[#334a43] bg-[#15231f] text-[#9bc4a8]" : action === "Watch" ? "border-[#494131] bg-[#211e18] text-[#c9b584]" : "border-[#493437] bg-[#211719] text-[#c69ba2]"}`}>{action === "Consider" ? "Consider buy" : action === "Watch" ? "Wait" : "Avoid"}</div><span aria-hidden="true" className={`text-[#666d78] transition ${isOpen ? "rotate-180" : ""}`}>⌄</span></div>
        </button>
        <div className={`recommendation-details ${isOpen ? "is-open" : ""}`}>
          <div className="grid gap-5 px-5 pb-5 md:grid-cols-[1.15fr_.85fr]">
            <div className="rounded-xl border border-[var(--line)] bg-[#0e1014] p-4"><div className="eyebrow">Why this rank</div><div className="mt-3 grid grid-cols-4 gap-2">{Object.entries(breakdown).map(([label, value]) => <div key={label} className="rounded-lg border border-[var(--line)] p-2 text-center"><div className="mono text-xs text-white">{value}</div><div className="mt-1 truncate text-[9px] capitalize text-[#6f7580]">{label === "goalFit" ? "Goal fit" : label}</div></div>)}</div><ul className="mt-4 grid gap-2 text-xs leading-5 text-[#a2a7b0]">{reasons.slice(0, 5).map(reason => <li key={reason} className="flex gap-2"><span className="text-[#656c77]">—</span><span>{reason}</span></li>)}</ul>{cautions.length > 0 && <div className="mt-4 border-t border-[var(--line)] pt-3"><div className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#c9b584]">Before acting</div>{cautions.map(caution => <p key={caution} className="mt-2 text-xs leading-5 text-[#a8a18f]">{caution}</p>)}</div>}{action === "Consider" && <p className="mt-4 border-t border-[var(--line)] pt-3 text-xs text-[#cbd0d6]">Your current limit suggests no more than <strong className="text-white">{allocation}%</strong> of your portfolio.</p>}</div>
            <div className="rounded-xl border border-[var(--line)] bg-[#0e1014] p-4"><div className="flex items-center justify-between gap-3"><div className="eyebrow">Modeled {projection.timeframe} range</div><span className="text-[10px] text-[#777e89]">{projection.confidence} data coverage</span></div><div className="mt-5 grid grid-cols-3 gap-2 text-center"><div><div className="mono text-sm text-[#c69ba2]">{signed(projection.bear)}</div><div className="mt-2 text-[10px] text-[#6f7580]">Bear</div></div><div><div className="mono text-lg font-semibold text-white">{signed(projection.base)}</div><div className="mt-2 text-[10px] text-[#6f7580]">Trend</div></div><div><div className="mono text-sm text-[#9bc4a8]">{signed(projection.bull)}</div><div className="mt-2 text-[10px] text-[#6f7580]">Bull</div></div></div><p className="mt-4 text-[10px] leading-4 text-[#747b86]">A rules-based range from observed momentum and risk—not a price prediction or promise.</p>{token.pairUrl && <a href={token.pairUrl} target="_blank" rel="noreferrer" onClick={event => event.stopPropagation()} className="mt-3 inline-flex text-xs font-medium text-[var(--accent)]">View live market</a>}</div>
          </div>
        </div>
      </article>;
    })}{!recommendations.length && <div className="px-5 py-10 text-center text-sm text-[#777e77]">{loading ? "Loading live recommendations…" : "No live candidates match your current goals."}</div>}</div>
    <div className="border-t border-[#272b27] px-5 py-3 text-[10px] leading-4 text-[#676e67]">Decision support only. Scenarios can be wrong; verify contract, liquidity, and your loss limit before acting.</div>
  </section>;
}
