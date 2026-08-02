import Link from "next/link";
import { TokenTable } from "./token-table";

const stats = [
  { label: "Tokens scanned", value: "24,891", change: "+12.6%", detail: "Across 8 chains" },
  { label: "High-score signals", value: "187", change: "+34 today", detail: "Score ≥ 80" },
  { label: "Smart money inflow", value: "$8.42M", change: "+18.2%", detail: "Last 24 hours" },
  { label: "Alerts triggered", value: "16", change: "3 unread", detail: "From 12 watchlists" },
];

export function Dashboard() {
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><div className="eyebrow acid">Live market radar</div><h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] md:text-4xl">Find the signal.<br className="sm:hidden" /> Skip the noise.</h1><p className="mt-2 max-w-xl text-sm text-[#838a83]">AI-ranked meme token intelligence across liquidity, holders, momentum, and on-chain risk.</p></div>
      <Link href="/scanner" className="flex w-fit items-center gap-2 rounded-xl bg-[#d8ff3e] px-4 py-3 text-sm font-semibold text-[#0a0c0b] transition hover:bg-[#e5ff80]">Launch scanner <span>↗</span></Link>
    </div>

    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s, i) => <div key={s.label} className="panel metric-line p-4 md:p-5"><div className="eyebrow">{s.label}</div><div className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">{s.value}</div><div className="mt-3 flex items-center justify-between gap-2"><span className={`mono text-[10px] ${i === 3 ? "text-[#f0c45b]" : "text-[#a5d95e]"}`}>{s.change}</span><span className="hidden text-[10px] text-[#656c65] sm:inline">{s.detail}</span></div></div>)}
    </section>

    <section className="grid gap-4 lg:grid-cols-[1.5fr_.7fr]">
      <div className="panel relative min-h-[310px] overflow-hidden p-5 md:p-6">
        <div className="absolute inset-0 grid-dots opacity-25" />
        <div className="relative flex items-start justify-between"><div><div className="eyebrow">Market pulse</div><h2 className="mt-2 text-lg font-semibold">Meme sector momentum</h2></div><span className="pill mono px-3 py-1.5 text-[10px] text-[#a5ab9f]">24H ▾</span></div>
        <div className="relative mt-8 flex h-44 items-end gap-1.5 border-b border-l border-[#303430] px-2 pb-0">
          {[26,34,31,39,44,38,49,58,52,64,61,71,65,77,75,86,79,92,88,96,91,98,95,100,97,106,111,105,118,126,122,134,130,142].map((h,i) => <div key={i} className="flex-1 rounded-t-sm bg-[#d8ff3e]" style={{height: `${Math.min(h,100)}%`, opacity: .16 + i/48}} />)}
          <div className="absolute right-3 top-2 rounded-lg bg-[#d8ff3e] px-2 py-1 mono text-[10px] font-semibold text-black">+28.4%</div>
        </div>
        <div className="relative mt-3 flex justify-between mono text-[9px] text-[#606760]"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>NOW</span></div>
      </div>
      <div className="panel p-5 md:p-6">
        <div className="flex items-center justify-between"><div><div className="eyebrow">AI radar</div><h2 className="mt-2 text-lg font-semibold">Signal quality</h2></div><span className="h-2 w-2 rounded-full bg-[#d8ff3e] shadow-[0_0_16px_#d8ff3e]" /></div>
        <div className="mx-auto mt-6 grid h-36 w-36 place-items-center rounded-full" style={{background:"conic-gradient(#d8ff3e 0 84%, #252a25 84% 100%)"}}><div className="grid h-[118px] w-[118px] place-items-center rounded-full bg-[#111412] text-center"><div><div className="mono text-3xl font-semibold">84</div><div className="eyebrow mt-1">Bullish</div></div></div></div>
        <div className="mt-6 space-y-3">{[["Social velocity","92"],["Liquidity health","81"],["Holder growth","77"]].map(([l,v]) => <div key={l} className="flex items-center justify-between text-xs"><span className="text-[#828982]">{l}</span><span className="mono">{v}</span></div>)}</div>
      </div>
    </section>
    <TokenTable compact />
  </div>;
}
