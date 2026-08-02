import { PageHeading } from "@/components/page-heading";
import { TokenTable } from "@/components/token-table";

export default function ScannerPage() {
  return <div className="space-y-6"><PageHeading eyebrow="Discovery engine" title="Token scanner" description="Filter live markets by the signals that matter, then let Meme Score surface the strongest setups." action={<button className="rounded-xl bg-[#d8ff3e] px-4 py-3 text-sm font-semibold text-black">Run scan ↗</button>} />
    <section className="panel grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4 lg:p-5">{[["Min. liquidity","$250,000"],["Market cap","$1M — $100M"],["Min. holders","2,500"],["Meme Score","70+"]].map(([l,v]) => <label key={l}><span className="eyebrow">{l}</span><div className="pill mono mt-2 flex items-center justify-between px-3 py-3 text-xs"><span>{v}</span><span className="text-[#6e756e]">⌄</span></div></label>)}</section>
    <div className="flex gap-2 overflow-x-auto mobile-scroll">{["Momentum", "New pairs", "Smart money", "High liquidity", "Low risk"].map((x,i)=><button key={x} className={`pill shrink-0 px-3 py-2 text-xs ${i===0 ? "border-[#d8ff3e] text-[#d8ff3e]" : "text-[#888f88]"}`}>{x}</button>)}</div><TokenTable /></div>;
}
