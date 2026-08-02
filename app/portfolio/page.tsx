"use client";

import { useMemo, useState } from "react";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { useGoals } from "@/hooks/use-goals";
import { useMarketData } from "@/hooks/use-market-data";
import { usePortfolio } from "@/hooks/use-portfolio";
import { formatUsd, parseCompactNumber } from "@/lib/dexscreener";
import { goalRecommendations } from "@/lib/recommendations";

export default function PortfolioPage() {
  const portfolio = usePortfolio();
  const { goals } = useGoals();
  const market = useMarketData();
  const [formOpen, setFormOpen] = useState(false);
  const [symbol, setSymbol] = useState("BONK");
  const [amount, setAmount] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const recommendations = useMemo(() => goalRecommendations(market.tokens, goals), [goals, market.tokens]);
  const rows = portfolio.positions.map(position => {
    const token = market.tokens.find(item => item.symbol === position.symbol);
    const currentPrice = token ? parseCompactNumber(token.price) : null;
    const cost = position.amount * position.entryPrice;
    const value = currentPrice === null ? null : position.amount * currentPrice;
    const pnl = value === null || !cost ? null : ((value - cost) / cost) * 100;
    const recommendation = recommendations.find(item => item.token.symbol === position.symbol);
    const exitTriggered = (pnl !== null && pnl <= -goals.maxLoss) || recommendation?.action === "Avoid";
    return { position, token, currentPrice, cost, value, pnl, recommendation, exitTriggered };
  });
  const pricedRows = rows.filter(row => row.value !== null);
  const totals = pricedRows.reduce((summary, row) => ({ cost: summary.cost + row.cost, value: summary.value + (row.value ?? 0) }), { cost: 0, value: 0 });
  const totalPnl = totals.cost ? ((totals.value - totals.cost) / totals.cost) * 100 : null;

  const addPosition = () => {
    if (!symbol.trim() || Number(amount) <= 0 || Number(entryPrice) <= 0) return;
    portfolio.addPosition({ symbol: symbol.trim(), amount: Number(amount), entryPrice: Number(entryPrice) });
    setAmount(""); setEntryPrice(""); setFormOpen(false);
  };

  return <div className="space-y-6">
    <PageHeading eyebrow="Position intelligence" title="Active buys" description="Track every open position against live market signals and the risk limits in your goals." action={<Button onClick={() => setFormOpen(value => !value)}>{formOpen ? "Close" : "＋ Add active buy"}</Button>} />
    {formOpen && <section className="panel grid gap-4 p-5 sm:grid-cols-4 sm:items-end"><label><span className="eyebrow">Token</span><input value={symbol} onChange={event => setSymbol(event.target.value.toUpperCase())} placeholder="BONK" className="field mt-2 w-full px-3 py-3" /></label><label><span className="eyebrow">Amount</span><input type="number" min="0" value={amount} onChange={event => setAmount(event.target.value)} placeholder="1000000" className="field mt-2 w-full px-3 py-3" /></label><label><span className="eyebrow">Entry price · USD</span><input type="number" min="0" step="any" value={entryPrice} onChange={event => setEntryPrice(event.target.value)} placeholder="0.00001" className="field mt-2 w-full px-3 py-3" /></label><Button onClick={addPosition} disabled={!symbol || Number(amount) <= 0 || Number(entryPrice) <= 0}>Save position</Button></section>}
    <section className="grid gap-3 sm:grid-cols-3"><div className="panel p-5"><div className="eyebrow">Active value</div><div className="mt-4 text-2xl font-semibold">{market.status === "loading" || (rows.length > 0 && !pricedRows.length) ? "—" : formatUsd(totals.value)}</div><div className="mono mt-3 text-[10px] text-[#777e77]">{rows.length} open position{rows.length === 1 ? "" : "s"}</div></div><div className="panel p-5"><div className="eyebrow">Unrealized P&amp;L</div><div className={`mt-4 text-2xl font-semibold ${totalPnl === null ? "text-white" : totalPnl >= 0 ? "text-[#78dc94]" : "text-[#ff7f77]"}`}>{totalPnl === null ? "—" : `${totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(1)}%`}</div><div className="mono mt-3 text-[10px] text-[#777e77]">Only currently priced positions</div></div><div className="panel p-5"><div className="eyebrow">Action needed</div><div className="mt-4 text-2xl font-semibold">{rows.filter(row => row.exitTriggered).length}</div><div className="mono mt-3 text-[10px] text-[#777e77]">Against your −{goals.maxLoss}% loss limit</div></div></section>
    <section className="panel overflow-hidden"><div className="border-b border-[#272b27] p-5"><div className="eyebrow">Open positions</div><h2 className="mt-2 text-lg font-semibold">Goal-aware position review</h2></div>{!rows.length ? <div className="px-5 py-14 text-center"><div className="text-sm">No active buys yet</div><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#777e77]">Add a position to see live P&amp;L, goal fit, and when your loss limit indicates that you should review an exit.</p></div> : <div className="divide-y divide-[#272b27]">{rows.map(row => <article key={row.position.symbol} className="grid gap-4 p-5 md:grid-cols-[1fr_repeat(4,auto)] md:items-center md:gap-8"><div><div className="flex items-center gap-2"><span className="font-medium">{row.position.symbol}</span><span className="mono text-[9px] text-[#737a73]">{row.token?.chain ?? "UNPRICED"}</span></div><div className="mono mt-2 text-[10px] text-[#737a73]">{row.position.amount.toLocaleString()} units · entry {formatUsd(row.position.entryPrice, true)}</div></div><div><div className="eyebrow">Value</div><div className="mono mt-2 text-xs">{row.value === null ? "—" : formatUsd(row.value)}</div></div><div><div className="eyebrow">P&amp;L</div><div className={`mono mt-2 text-xs ${row.pnl === null ? "text-white" : row.pnl >= 0 ? "text-[#78dc94]" : "text-[#ff7f77]"}`}>{row.pnl === null ? "—" : `${row.pnl >= 0 ? "+" : ""}${row.pnl.toFixed(1)}%`}</div></div><div><div className="eyebrow">Signal</div><div className={`mt-2 text-xs ${row.exitTriggered ? "text-[#ff7f77]" : "text-[var(--accent)]"}`}>{row.token ? row.exitTriggered ? "Review exit" : row.recommendation?.action ?? "Track" : "Price unavailable"}</div></div><button type="button" onClick={() => portfolio.removePosition(row.position.symbol)} className="text-left text-xs text-[#707770] hover:text-white md:text-center" aria-label={`Remove ${row.position.symbol} position`}>Remove</button></article>)}</div>}<div className="border-t border-[#272b27] px-5 py-3 text-[10px] leading-4 text-[#676e67]">Values appear only when live pricing is available. Signals are decision support, not trade execution or a guarantee of returns.</div></section>
  </div>;
}
