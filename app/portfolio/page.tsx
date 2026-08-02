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
  const [symbol, setSymbol] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const recommendations = useMemo(() => goalRecommendations(market.tokens, goals), [goals, market.tokens]);
  const selectedToken = market.tokens.find(item => item.symbol === symbol);
  const rows = portfolio.positions.map(position => {
    const token = market.tokens.find(item => item.symbol === position.symbol);
    const currentPrice = token ? parseCompactNumber(token.price) : null;
    const cost = position.amount * position.entryPrice;
    const value = currentPrice === null ? null : position.amount * currentPrice;
    const pnl = value === null || !cost ? null : ((value - cost) / cost) * 100;
    const recommendation = recommendations.find(item => item.token.symbol === position.symbol);
    const stopLoss = pnl !== null && pnl <= -goals.maxLoss;
    const takeProfit = pnl !== null && pnl >= goals.targetReturn && (token?.change ?? 0) < 0;
    const weakening = recommendation?.action === "Avoid" && ((token?.change ?? 0) < -3 || (token?.change7d ?? 0) < -8);
    const signal = stopLoss ? "Sell · loss limit" : takeProfit ? "Take profit" : weakening ? "Consider selling" : token ? "Hold" : "Price unavailable";
    const signalReason = stopLoss ? `Loss exceeded your −${goals.maxLoss}% limit` : takeProfit ? `Return reached your +${goals.targetReturn}% target while momentum weakened` : weakening ? "Short- and medium-term momentum no longer fits your plan" : token ? "No exit rule is currently triggered" : "This asset is outside the current top-market feed";
    const exitTriggered = stopLoss || takeProfit || weakening;
    return { position, token, currentPrice, cost, value, pnl, recommendation, exitTriggered, signal, signalReason };
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
    <PageHeading eyebrow="Your money" title="My positions" description="See what to hold, what needs attention, and when your own sell rules are triggered." action={<Button onClick={() => setFormOpen(value => !value)}>{formOpen ? "Close" : "＋ Add position"}</Button>} />
    {formOpen && <section className="panel grid gap-4 p-5 sm:grid-cols-4 sm:items-end"><label><span className="eyebrow">Asset</span><select value={symbol} onChange={event => setSymbol(event.target.value)} className="field mt-2 w-full px-3 py-3">{market.tokens.map(token => <option key={token.id ?? token.symbol} value={token.symbol}>{token.name} · {token.symbol}</option>)}</select></label><label><span className="eyebrow">Amount owned</span><input type="number" min="0" value={amount} onChange={event => setAmount(event.target.value)} placeholder="0.25" className="field mt-2 w-full px-3 py-3" /></label><label><span className="eyebrow">Average buy price · USD</span><div className="field mt-2 flex items-center"><input type="number" min="0" step="any" value={entryPrice} onChange={event => setEntryPrice(event.target.value)} placeholder="Enter your price" className="min-w-0 flex-1 bg-transparent px-3 py-3 outline-none" />{selectedToken && selectedToken.price !== "—" && <button type="button" onClick={() => setEntryPrice(String(parseCompactNumber(selectedToken.price)))} className="mr-2 whitespace-nowrap text-[10px] text-[var(--accent)]">USE CURRENT</button>}</div></label><Button onClick={addPosition} disabled={!symbol || Number(amount) <= 0 || Number(entryPrice) <= 0}>Save position</Button></section>}
    <section className="grid gap-3 sm:grid-cols-3"><div className="panel p-5"><div className="eyebrow">Current value</div><div className="mt-4 text-2xl font-semibold">{market.status === "loading" || (rows.length > 0 && !pricedRows.length) ? "—" : formatUsd(totals.value)}</div><div className="mono mt-3 text-[10px] text-[#777e77]">{rows.length} open position{rows.length === 1 ? "" : "s"}</div></div><div className="panel p-5"><div className="eyebrow">Total return</div><div className={`mt-4 text-2xl font-semibold ${totalPnl === null ? "text-white" : totalPnl >= 0 ? "text-[#78dc94]" : "text-[#ff7f77]"}`}>{totalPnl === null ? "—" : `${totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(1)}%`}</div><div className="mono mt-3 text-[10px] text-[#777e77]">Based on live priced positions</div></div><div className="panel p-5"><div className="eyebrow">Sell review</div><div className="mt-4 text-2xl font-semibold">{rows.filter(row => row.exitTriggered).length}</div><div className="mono mt-3 text-[10px] text-[#777e77]">Your rules, checked live</div></div></section>
    <section className="panel overflow-hidden"><div className="border-b border-[#272b27] p-5"><div className="eyebrow">Decision list</div><h2 className="mt-2 text-lg font-semibold">What should I sell or hold?</h2></div>{!rows.length ? <div className="px-5 py-14 text-center"><div className="text-sm">Add your first position</div><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#777e77]">Enter what you own and your average buy price. NexIQ will monitor live price, return, momentum, and your sell limits.</p><Button className="mt-5" onClick={() => setFormOpen(true)}>＋ Add position</Button></div> : <div className="divide-y divide-[#272b27]">{rows.map(row => <article key={row.position.symbol} className="grid gap-4 p-5 md:grid-cols-[1fr_repeat(3,auto)] md:items-center md:gap-8"><div><div className="flex items-center gap-2"><span className="font-medium">{row.token?.name ?? row.position.symbol}</span><span className="mono text-[9px] text-[#737a73]">{row.position.symbol}</span></div><div className="mono mt-2 text-[10px] text-[#737a73]">{row.position.amount.toLocaleString()} units · bought at {formatUsd(row.position.entryPrice, true)}</div></div><div><div className="eyebrow">Return</div><div className={`mono mt-2 text-xs ${row.pnl === null ? "text-white" : row.pnl >= 0 ? "text-[#78dc94]" : "text-[#ff7f77]"}`}>{row.pnl === null ? "—" : `${row.pnl >= 0 ? "+" : ""}${row.pnl.toFixed(1)}%`}</div></div><div className="max-w-[260px]"><div className={`text-sm font-semibold ${row.exitTriggered ? "text-[#ff7f77]" : "text-[var(--accent)]"}`}>{row.signal}</div><div className="mt-1 text-[10px] leading-4 text-[#777e77]">{row.signalReason}</div></div><button type="button" onClick={() => portfolio.removePosition(row.position.symbol)} className="text-left text-xs text-[#707770] hover:text-white md:text-center" aria-label={`Remove ${row.position.symbol} position`}>Remove</button></article>)}</div>}<div className="border-t border-[#272b27] px-5 py-3 text-[10px] leading-4 text-[#676e67]">Sell labels are generated from your saved limits and live market data. NexIQ does not execute trades.</div></section>
  </div>;
}
