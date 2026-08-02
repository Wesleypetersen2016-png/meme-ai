"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { accentColors, usePreferences } from "@/hooks/use-preferences";

const nav = [
  { href: "/", label: "Today" },
  { href: "/portfolio", label: "My positions", shortLabel: "Positions" },
  { href: "/settings", label: "Profile" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { preferences } = usePreferences();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", accentColors[preferences.accent]);
    root.style.setProperty("--accent-soft", `${accentColors[preferences.accent]}14`);
    root.dataset.surface = preferences.surface;
    root.dataset.density = preferences.compactMode ? "compact" : "comfortable";
  }, [preferences]);

  const submitSearch = () => {
    const query = searchTerm.trim();
    if (!query) return;
    setSearchOpen(false);
    const looksLikeAddress = query.startsWith("0x") || query.length > 30;
    router.push(`${looksLikeAddress ? "/scanner" : "/"}?q=${encodeURIComponent(query)}`);
  };
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-[var(--line)] bg-[#0b0d10] px-5 py-6 md:flex md:flex-col">
        <Link href="/" className="flex items-center gap-3 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] border border-[#303440] bg-[#14171d] font-semibold text-[var(--accent)]">N</span>
          <div><div className="text-[17px] font-semibold tracking-[-.02em]">NexIQ</div><div className="mt-0.5 text-[10px] text-[#727783]">Market intelligence</div></div>
        </Link>
        <nav className="mt-12 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return <Link key={item.href} href={item.href} className={`flex items-center rounded-[10px] px-3 py-3 text-sm transition ${active ? "bg-[#171a20] text-white" : "text-[#858b96] hover:bg-[#13161b] hover:text-white"}`}>{item.label}{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />}</Link>;
          })}
        </nav>
      </aside>

      <div className="md:col-start-2">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--line)] bg-[#0b0d10]/92 px-4 backdrop-blur-xl md:h-20 md:px-8">
          <Link href="/" className="flex items-center gap-2 md:hidden"><span className="grid h-8 w-8 place-items-center rounded-lg border border-[#303440] bg-[#14171d] font-semibold text-[var(--accent)]">N</span><span className="font-semibold">NexIQ</span></Link>
          <button onClick={() => setSearchOpen(!searchOpen)} className="pill hidden w-80 items-center px-4 py-2.5 text-left text-xs text-[#808691] md:flex">Research an asset<kbd className="mono ml-auto text-[9px] text-[#5f6570]">⌘ K</kbd></button>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} aria-label="Search" className="pill h-9 px-3 text-xs md:hidden">Search</button>
            <Link href="/settings" className="pill hidden h-9 items-center px-3 text-xs text-[#9298a3] sm:flex">Alerts</Link>
            <Link href="/settings" className="flex h-9 items-center gap-2 rounded-[10px] border border-[var(--line)] bg-[#14171d] pl-1 pr-3 text-xs"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#20232b] text-[10px]">{preferences.displayName.slice(0, 2).toUpperCase()}</span><span className="hidden sm:inline">{preferences.displayName}</span></Link>
          </div>
          {searchOpen && <form onSubmit={event => { event.preventDefault(); submitSearch(); }} className="absolute left-4 right-4 top-[calc(100%+8px)] panel p-3 shadow-2xl md:left-8 md:right-auto md:w-[480px]"><label htmlFor="global-token-search" className="sr-only">Search token, symbol, or address</label><input id="global-token-search" autoFocus value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search token, symbol, address…" className="w-full rounded-xl border border-[#313631] bg-[#0c0f0d] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" /><div className="flex items-center justify-between px-2 pt-3"><p className="mono text-[10px] text-[#737a73]">BTC · ETH · SOL · TOKEN ADDRESS</p><button type="submit" disabled={!searchTerm.trim()} className="mono text-[10px] text-[var(--accent)] disabled:text-[#555b55]">RESEARCH ↗</button></div></form>}
        </header>
        <main className="mx-auto max-w-[1440px] px-4 pb-28 pt-6 md:px-8 md:pb-10 md:pt-8">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-[var(--line)] bg-[#0b0d10]/96 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden">
        {nav.map((item) => { const active = pathname === item.href; return <Link key={item.href} href={item.href} className={`relative flex flex-1 items-center justify-center py-2 text-xs ${active ? "text-white" : "text-[#747b86]"}`}>{active && <span className="absolute top-0 h-0.5 w-5 rounded-full bg-[var(--accent)]" />}{item.shortLabel ?? item.label}</Link>; })}
      </nav>
    </div>
  );
}
