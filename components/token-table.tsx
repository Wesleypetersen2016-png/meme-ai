"use client";

import { useMemo, useState } from "react";
import type { Token } from "@/lib/data";
import { useWatchlist } from "@/hooks/use-watchlist";
import { Button } from "@/components/ui/button";

const riskStyle = { Low: "bg-[#173224] text-[#77e39c]", Medium: "bg-[#332c18] text-[#efc65e]", High: "bg-[#3b1d1d] text-[#ff7f77]" };

export function TokenTable({ compact = false, watchlistOnly = false, data, title = "Market intelligence", description = "Live market data ranked by liquidity, momentum, and modeled risk", emptyMessage = "No live tokens found." }: { compact?: boolean; watchlistOnly?: boolean; data: Token[]; title?: string; description?: string; emptyMessage?: string }) {
  const [query, setQuery] = useState("");
  const [chain, setChain] = useState("All chains");
  const watchlist = useWatchlist();
  const chains = useMemo(() => [...new Set(data.map(token => token.chain))].sort(), [data]);
  const rows = useMemo(() => data.filter(t => (!watchlistOnly || watchlist.symbols.includes(t.symbol)) && (chain === "All chains" || t.chain === chain) && `${t.name} ${t.symbol} ${t.address ?? ""}`.toLowerCase().includes(query.toLowerCase())), [query, chain, data, watchlistOnly, watchlist.symbols]);
  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[#272b27] p-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <div><h2 className="text-base font-semibold">{title}</h2><p className="mt-1 text-xs text-[#777e77]">{description}</p></div>
        <div className="flex gap-2">
          <div className="pill flex min-w-0 flex-1 items-center px-3 sm:w-48"><span className="text-[#6d746d]">⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter tokens" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-xs outline-none" /></div>
          <select aria-label="Filter by chain" value={chain} onChange={e => setChain(e.target.value)} className="pill px-3 text-xs outline-none"><option>All chains</option>{chains.map(option => <option key={option}>{option}</option>)}</select>
        </div>
      </div>
      <div className="overflow-x-auto mobile-scroll">
        <table className="w-full min-w-[1180px] text-left">
          <thead><tr className="eyebrow border-b border-[#272b27]">{["Token", "Chain", "Market cap / FDV", "Liquidity", "Volume 5m / 1h", "Buy / Sell", "Social IQ", "Modeled risk", "Modeled IQ", ""].map(h => <th key={h || "action"} className="px-4 py-3.5 font-medium first:pl-5">{h}</th>)}</tr></thead>
          <tbody>
            {rows.slice(0, compact ? 4 : undefined).map((t) => <tr key={t.id ?? `${t.chain}:${t.symbol}`} className="group border-b border-[#202420] last:border-0 hover:bg-[#151915]">
              <td className="px-4 py-4 pl-5"><div className="flex items-center gap-3"><span style={{ background: t.color }} className="grid h-9 w-9 place-items-center rounded-full font-bold text-[#0c0e0d]">{t.symbol[0]}</span><div><div className="text-sm font-medium">{t.name}</div><div className="mono mt-1 text-[10px] text-[#747b74]">{t.symbol} · {t.price}</div></div></div></td>
              <td className="px-4 py-4"><span className="mono rounded-md border border-[#303530] px-2 py-1 text-[10px]">{t.chain}</span></td>
              {[t.marketCap, t.liquidity].map((v, j) => <td key={j} className="mono px-4 py-4 text-xs text-[#c5c9c4]">{v}</td>)}
              <td className="mono px-4 py-4 text-xs text-[#c5c9c4]"><div>{t.volume5m}</div><div className="mt-1 text-[10px] text-[#777e77]">{t.volume1h}</div></td>
              <td className="px-4 py-4">{t.buySellRatio === undefined ? <><div className="mono text-xs">—</div><div className="mono mt-1 text-[10px] text-[#777e77]">Unavailable</div></> : <><div className="mono text-xs">{t.buySellRatio}x</div><div className={`mono mt-1 text-[10px] ${Number(t.buySellRatio) >= 1 ? "text-[#79db8f]" : "text-[#ff766e]"}`}>{Number(t.buySellRatio) >= 1 ? "Buy pressure" : "Sell pressure"}</div></>}</td>
              <td className="px-4 py-4"><div className="mono text-xs">{t.socialScore ?? "—"}</div><div className="mono mt-1 text-[9px] text-[#777e77]">{t.socialSources ? `${t.socialMentions ?? 0} posts · ${t.socialSources}/3` : "Not connected"}</div></td>
              <td className="px-4 py-4"><div className="flex items-center gap-2"><span className="mono w-6 text-xs">{t.riskScore}</span><div className="h-1.5 w-12 overflow-hidden rounded-full bg-[#292e29]"><div className={`h-full rounded-full ${t.riskScore > 55 ? "bg-[#ff766e]" : t.riskScore > 25 ? "bg-[#efc65e]" : "bg-[#76df95]"}`} style={{ width: `${t.riskScore}%` }} /></div></div><span className={`mono rounded-full px-2 py-1 text-[9px] ${riskStyle[t.risk]}`}>{t.risk}</span></td>
              <td className="px-4 py-4"><div className="flex items-center gap-2"><span className={`mono text-sm font-semibold ${t.convictionScore >= 85 ? "acid" : "text-white"}`}>{t.convictionScore}</span><div className="h-1.5 w-12 overflow-hidden rounded-full bg-[#292e29]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${t.convictionScore}%` }} /></div></div></td>
              <td className="px-4 py-4"><Button variant="ghost" size="icon" aria-label={`${watchlist.isWatched(t.symbol) ? "Remove" : "Add"} ${t.symbol} ${watchlist.isWatched(t.symbol) ? "from" : "to"} watchlist`} onClick={() => watchlist.toggle(t.symbol)} className={watchlist.isWatched(t.symbol) ? "text-[var(--accent)]" : "text-[#697069]"}>{watchlist.isWatched(t.symbol) ? "★" : "☆"}</Button></td>
            </tr>)}
            {!rows.length && <tr><td colSpan={10} className="px-5 py-10 text-center text-sm text-[#777e77]">{emptyMessage}</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
