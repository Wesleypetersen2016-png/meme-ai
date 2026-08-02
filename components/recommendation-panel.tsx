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
    <div className="flex items-start justify-between gap-4 border-b border-[#272b27] p-5">
      <div><div className="eyebrow">Simple decision list</div><h2 className="mt-2 text-lg font-semibold">Buy candidates</h2><p className="mt-1 text-xs text-[#777e77]">Best live matches for your goals. Hover or tap one to see why.</p></div>
      <Link href="/goals" className="pill shrink-0 px-3 py-2 text-xs text-[var(--accent)]">Change goals</Link>
    </div>
    <div className="divide-y divide-[#272b27]">{recommendations.map(({ token, action, fitScore, allocation, reasons, projection }) => {
      const id = token.id ?? `${token.chain}:${token.symbol}`;
      const isOpen = openId === id;
      return <article key={id} className="recommendation-row group">
        <button type="button" aria-expanded={isOpen} onClick={() => setOpenId(current => current === id ? null : id)} className="grid w-full gap-4 p-5 text-left sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex min-w-0 items-start gap-3"><span style={{ background: token.color }} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl font-bold text-[#0a0c0b]">{token.symbol[0]}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-medium">{token.name}</h3><span className="mono text-[10px] text-[#777e77]">{token.symbol} · {token.chain}</span></div><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#858c85]"><span>{token.price}</span><span>{token.change === undefined ? "24h unavailable" : `${token.change >= 0 ? "+" : ""}${token.change.toFixed(1)}% · 24h`}</span><span>{token.liquidity} liquidity</span></div></div></div>
          <div className="flex items-center justify-between gap-4 sm:justify-end sm:text-right"><div><div className="mono text-lg font-semibold text-[var(--accent)]">{fitScore}</div><div className="eyebrow mt-1">Goal fit</div></div><div className={`rounded-full px-3 py-2 text-xs font-medium ${action === "Consider" ? "bg-[var(--accent-soft)] text-[var(--accent)]" : action === "Watch" ? "bg-[#332c18] text-[#efc65e]" : "bg-[#3b1d1d] text-[#ff8b83]"}`}>{action === "Consider" ? "Consider buy" : action === "Watch" ? "Wait" : "Avoid"}</div><span aria-hidden="true" className={`text-[#777e77] transition ${isOpen ? "rotate-180" : ""}`}>⌄</span></div>
        </button>
        <div className={`recommendation-details ${isOpen ? "is-open" : ""}`}>
          <div className="grid gap-5 px-5 pb-5 md:grid-cols-[1.15fr_.85fr]">
            <div className="rounded-2xl border border-[#292e29] bg-[#0c100e] p-4"><div className="eyebrow">Why this rank</div><ul className="mt-3 grid gap-2 text-xs leading-5 text-[#a4aaa4]">{reasons.map(reason => <li key={reason} className="flex gap-2"><span className="text-[var(--accent)]">•</span><span>{reason}</span></li>)}</ul>{action === "Consider" && <p className="mt-4 border-t border-[#292e29] pt-3 text-xs text-[#cbd0ca]">Your current limit suggests no more than <strong className="text-white">{allocation}%</strong> of your portfolio.</p>}</div>
            <div className="rounded-2xl border border-[var(--accent-soft)] bg-[var(--accent-soft)] p-4"><div className="flex items-center justify-between gap-3"><div className="eyebrow">Modeled {projection.timeframe} scenario</div><span className="mono text-[10px] text-[#8f978f]">{projection.confidence} confidence</span></div><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div><div className="mono text-sm text-[#ff8b83]">{signed(projection.bear)}</div><div className="eyebrow mt-2">Bear</div></div><div><div className="mono text-lg font-semibold text-white">{signed(projection.base)}</div><div className="eyebrow mt-2">Base</div></div><div><div className="mono text-sm text-[var(--accent)]">{signed(projection.bull)}</div><div className="eyebrow mt-2">Bull</div></div></div><p className="mt-4 text-[10px] leading-4 text-[#7f877f]">A momentum scenario calculated from current market inputs—not a guaranteed price forecast.</p>{token.pairUrl && <a href={token.pairUrl} target="_blank" rel="noreferrer" onClick={event => event.stopPropagation()} className="mt-3 inline-flex text-xs font-medium text-[var(--accent)]">View live market ↗</a>}</div>
          </div>
        </div>
      </article>;
    })}{!recommendations.length && <div className="px-5 py-10 text-center text-sm text-[#777e77]">{loading ? "Loading live recommendations…" : "No live candidates match your current goals."}</div>}</div>
    <div className="border-t border-[#272b27] px-5 py-3 text-[10px] leading-4 text-[#676e67]">Decision support only. Scenarios can be wrong; verify contract, liquidity, and your loss limit before acting.</div>
  </section>;
}
