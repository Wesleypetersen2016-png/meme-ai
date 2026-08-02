"use client";

import { PageHeading } from "@/components/page-heading";
import { RecommendationPanel } from "@/components/recommendation-panel";
import { useGoals, type GoalProfile } from "@/hooks/use-goals";
import { useMarketData } from "@/hooks/use-market-data";

const objectiveCopy: Record<GoalProfile["objective"], string> = {
  growth: "Prioritize upside and positive momentum.",
  preservation: "Favor stronger liquidity and lower modeled risk.",
  learning: "Keep allocations small while exploring varied setups.",
};

export default function GoalsPage() {
  const { goals, updateGoals } = useGoals();
  const market = useMarketData();
  const toggleChain = (chain: string) => updateGoals({ chains: goals.chains.includes(chain) ? goals.chains.filter(item => item !== chain) : [...goals.chains, chain] });

  return <div className="space-y-6">
    <PageHeading eyebrow="Personal strategy" title="Goals" description="Define what success and acceptable risk mean to you. NexIQ uses this profile to rank signals and size ideas." />
    <section className="grid gap-4 xl:grid-cols-[.85fr_1.15fr]">
      <div className="panel p-5 md:p-7">
        <div className="eyebrow">Strategy profile</div><h2 className="mt-2 text-xl font-semibold">Your decision framework</h2>
        <div className="mt-7 space-y-6">
          <fieldset><legend className="eyebrow">Primary objective</legend><div className="mt-3 grid gap-2 sm:grid-cols-3">{(["growth", "preservation", "learning"] as GoalProfile["objective"][]).map(value => <button type="button" key={value} aria-pressed={goals.objective === value} onClick={() => updateGoals({ objective: value })} className={`rounded-2xl border p-3 text-left text-xs capitalize ${goals.objective === value ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white" : "border-[#303530] text-[#7f877f]"}`}>{value}</button>)}</div><p className="mt-3 text-xs text-[#737a73]">{objectiveCopy[goals.objective]}</p></fieldset>
          <div className="grid gap-4 sm:grid-cols-2"><label><span className="eyebrow">Time horizon</span><select value={goals.horizon} onChange={event => updateGoals({ horizon: event.target.value as GoalProfile["horizon"] })} className="field mt-2 w-full px-3 py-3 text-sm"><option value="intraday">Intraday</option><option value="swing">Swing · days/weeks</option><option value="long-term">Long term</option></select></label><label><span className="eyebrow">Risk tolerance</span><select value={goals.riskTolerance} onChange={event => updateGoals({ riskTolerance: event.target.value as GoalProfile["riskTolerance"] })} className="field mt-2 w-full px-3 py-3 text-sm"><option value="conservative">Conservative</option><option value="balanced">Balanced</option><option value="aggressive">Aggressive</option></select></label></div>
          <div className="grid gap-4 sm:grid-cols-2"><label><span className="eyebrow">Target return</span><div className="field mt-2 flex items-center"><input type="number" min={1} max={500} value={goals.targetReturn} onChange={event => updateGoals({ targetReturn: Number(event.target.value) })} className="w-full bg-transparent px-3 py-3 outline-none" /><span className="pr-3 text-[#777e77]">%</span></div></label><label><span className="eyebrow">Maximum loss</span><div className="field mt-2 flex items-center"><input type="number" min={1} max={100} value={goals.maxLoss} onChange={event => updateGoals({ maxLoss: Number(event.target.value) })} className="w-full bg-transparent px-3 py-3 outline-none" /><span className="pr-3 text-[#777e77]">%</span></div></label><label><span className="eyebrow">Maximum position</span><div className="field mt-2 flex items-center"><input type="number" min={1} max={100} value={goals.maxPosition} onChange={event => updateGoals({ maxPosition: Number(event.target.value) })} className="w-full bg-transparent px-3 py-3 outline-none" /><span className="pr-3 text-[#777e77]">%</span></div></label><label><span className="eyebrow">Buy alert threshold</span><div className="field mt-2 flex items-center"><input type="number" min={1} max={100} value={goals.alertScore} onChange={event => updateGoals({ alertScore: Number(event.target.value) })} className="w-full bg-transparent px-3 py-3 outline-none" /><span className="pr-3 text-[#777e77]">fit</span></div></label></div>
          <fieldset><legend className="eyebrow">Preferred chains</legend><div className="mt-3 flex gap-2">{["ETH", "SOL"].map(chain => <button type="button" key={chain} aria-pressed={goals.chains.includes(chain)} onClick={() => toggleChain(chain)} className={`pill px-4 py-2 text-xs ${goals.chains.includes(chain) ? "border-[var(--accent)] text-[var(--accent)]" : "text-[#777e77]"}`}>{chain}</button>)}</div></fieldset>
        </div>
      </div>
      <div className="space-y-4"><div className="panel grid gap-3 p-5 sm:grid-cols-3"><div><div className="eyebrow">Target</div><div className="mt-3 text-2xl font-semibold">+{goals.targetReturn}%</div></div><div><div className="eyebrow">Loss limit</div><div className="mt-3 text-2xl font-semibold">−{goals.maxLoss}%</div></div><div><div className="eyebrow">Max allocation</div><div className="mt-3 text-2xl font-semibold">{goals.maxPosition}%</div></div></div><RecommendationPanel data={market.tokens} loading={market.status === "loading"} limit={5} /></div>
    </section>
  </div>;
}
