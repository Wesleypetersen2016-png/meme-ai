"use client";

import { useState } from "react";
import { useFomoPortfolio, type SyncedHolding } from "@/hooks/use-fomo-portfolio";
import { Button } from "@/components/ui/button";

export function FomoPortfolioSync() {
  const { connection, updateConnection, disconnect } = useFomoPortfolio();
  const [open, setOpen] = useState(false);
  const [evmAddress, setEvmAddress] = useState(connection.evmAddress);
  const [solanaAddress, setSolanaAddress] = useState(connection.solanaAddress);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");
  const syncedValue = connection.holdings.reduce((total, holding) => total + (holding.value ?? 0), 0);

  const sync = async () => {
    setStatus("loading"); setMessage("Reading public on-chain balances…");
    try {
      const response = await fetch("/api/portfolio/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ evmAddress, solanaAddress }) });
      const payload = await response.json() as { holdings?: SyncedHolding[]; updatedAt?: string; failedChains?: string[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Portfolio sync failed");
      updateConnection({ evmAddress: evmAddress.trim(), solanaAddress: solanaAddress.trim(), holdings: payload.holdings ?? [], updatedAt: payload.updatedAt ?? new Date().toISOString() });
      setStatus("success");
      setMessage(`${payload.holdings?.length ?? 0} live balance${payload.holdings?.length === 1 ? "" : "s"} synced${payload.failedChains?.length ? ` · ${payload.failedChains.join(", ")} unavailable` : ""}.`);
      setOpen(false);
    } catch (error) { setStatus("error"); setMessage(error instanceof Error ? error.message : "Portfolio sync failed"); }
  };

  return <section className="panel overflow-hidden">
    <div className="flex flex-wrap items-start justify-between gap-4 p-5 md:p-6"><div><div className="eyebrow">Read-only sync</div><h2 className="mt-2 text-lg font-semibold">Fomo portfolio</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-[#858b96]">Paste the public wallet addresses shown in Fomo to read balances across Base, BNB Chain, Monad, and Solana. NexIQ cannot move funds or place trades.</p></div><Button variant="outline" size="sm" onClick={() => setOpen(value => !value)}>{open ? "Close" : connection.updatedAt ? "Manage sync" : "Connect addresses"}</Button></div>
    {open && <div className="grid gap-4 border-t border-[var(--line)] p-5 md:grid-cols-2 md:p-6"><label><span className="eyebrow">EVM public address</span><input value={evmAddress} onChange={event => setEvmAddress(event.target.value)} spellCheck={false} autoComplete="off" placeholder="0x…" className="field mono mt-2 w-full px-3 py-3 text-xs" /></label><label><span className="eyebrow">Solana public address</span><input value={solanaAddress} onChange={event => setSolanaAddress(event.target.value)} spellCheck={false} autoComplete="off" placeholder="Public address" className="field mono mt-2 w-full px-3 py-3 text-xs" /></label><div className="md:col-span-2"><div className="rounded-xl border border-[#493f2f] bg-[#1d1913] p-3 text-xs leading-5 text-[#c8b98f]"><strong>Public addresses only.</strong> Never enter a seed phrase, private key, password, or one-time code.</div><div className="mt-4 flex flex-wrap gap-2"><Button onClick={() => void sync()} disabled={status === "loading" || (!evmAddress.trim() && !solanaAddress.trim())}>{status === "loading" ? "Syncing…" : "Sync live balances"}</Button>{connection.updatedAt && <Button variant="outline" onClick={() => { disconnect(); setEvmAddress(""); setSolanaAddress(""); setMessage(""); setStatus("idle"); }}>Disconnect</Button>}</div></div></div>}
    {(message || connection.updatedAt) && <div role="status" aria-live="polite" className={`border-t border-[var(--line)] px-5 py-3 text-[10px] ${status === "error" ? "text-[#c69ba2]" : "text-[#777e89]"}`}>{message || `Last synced ${new Date(connection.updatedAt!).toLocaleString()}`}</div>}
    {connection.holdings.length > 0 && <div className="border-t border-[var(--line)]"><div className="flex items-end justify-between gap-4 px-5 py-4 md:px-6"><div><div className="eyebrow">On-chain value</div><div className="mt-2 text-xl font-semibold">{syncedValue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })}</div></div><div className="text-right text-[10px] text-[#737985]">{connection.holdings.length} live balance{connection.holdings.length === 1 ? "" : "s"}<br />Cost basis unavailable on-chain</div></div><div className="divide-y divide-[var(--line)]">{[...connection.holdings].sort((a, b) => (b.value ?? 0) - (a.value ?? 0)).map(holding => <div key={holding.id} className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 md:px-6"><div className="min-w-0"><div className="flex items-center gap-2"><span className="font-medium">{holding.name}</span><span className="mono text-[9px] text-[#737985]">{holding.symbol}</span></div><div className="mono mt-1 text-[10px] text-[#737985]">{holding.amount.toLocaleString(undefined, { maximumSignificantDigits: 8 })} · {holding.chain}</div></div><div className="text-right"><div className="mono text-xs">{holding.value === null ? "Value unavailable" : holding.value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })}</div>{holding.price !== null && <div className="mt-1 text-[9px] text-[#737985]">{holding.price.toLocaleString("en-US", { style: "currency", currency: "USD", maximumSignificantDigits: 6 })} each</div>}</div></div>)}</div></div>}
  </section>;
}
