export default function Loading() {
  return <div className="space-y-6" aria-busy="true" aria-label="Loading NexIQ">
    <div className="h-28 animate-pulse rounded-2xl bg-white/[.025]" />
    <div className="panel overflow-hidden"><div className="h-28 animate-pulse border-b border-[var(--line)] bg-white/[.018]" />{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-24 animate-pulse border-b border-[var(--line)] bg-white/[.012] last:border-0" />)}</div>
  </div>;
}
