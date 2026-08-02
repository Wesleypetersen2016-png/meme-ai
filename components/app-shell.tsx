"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { accentColors, usePreferences } from "@/hooks/use-preferences";

const nav = [
  { href: "/", label: "Dashboard", icon: "⌁" },
  { href: "/scanner", label: "Scanner", icon: "⌖" },
  { href: "/watchlist", label: "Watchlist", icon: "☆" },
  { href: "/portfolio", label: "Active buys", shortLabel: "Buys", icon: "◒" },
  { href: "/goals", label: "Goals", icon: "◎" },
  { href: "/settings", label: "Settings", icon: "⚙" },
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
    root.style.setProperty("--accent-soft", `${accentColors[preferences.accent]}20`);
    root.dataset.surface = preferences.surface;
    root.dataset.density = preferences.compactMode ? "compact" : "comfortable";
  }, [preferences]);

  const submitSearch = () => {
    const query = searchTerm.trim();
    if (!query) return;
    setSearchOpen(false);
    router.push(`/scanner?q=${encodeURIComponent(query)}`);
  };
  return (
    <div className="min-h-screen md:grid md:grid-cols-[224px_1fr]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 border-r border-[#252925] bg-[#0c0e0d] px-4 py-5 md:flex md:flex-col">
        <Link href="/" className="flex items-center gap-3 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent)] font-bold text-[#0a0c0b]">N</span>
          <div><div className="text-[17px] font-semibold tracking-tight">NexIQ</div><div className="eyebrow mt-1">Decision intelligence</div></div>
        </Link>
        <nav className="mt-12 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${active ? "bg-[var(--accent-soft)] text-white" : "text-[#7f877f] hover:bg-[#141714] hover:text-white"}`}><span className={`mono w-5 text-center text-lg ${active ? "acid" : ""}`}>{item.icon}</span>{item.label}{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />}</Link>;
          })}
        </nav>
      </aside>

      <div className="md:col-start-2">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#222622] bg-[#0a0c0b]/90 px-4 backdrop-blur-xl md:h-20 md:px-8">
          <Link href="/" className="flex items-center gap-2 md:hidden"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent)] font-bold text-black">N</span><span className="font-semibold">NexIQ</span></Link>
          <button onClick={() => setSearchOpen(!searchOpen)} className="pill hidden w-80 items-center gap-3 px-4 py-2.5 text-left text-xs text-[#757c75] md:flex"><span className="text-base">⌕</span> Search token, symbol, address…<kbd className="mono ml-auto text-[9px]">⌘ K</kbd></button>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} aria-label="Search" className="pill grid h-9 w-9 place-items-center md:hidden">⌕</button>
            <Link href="/settings" aria-label="Notification settings" className="pill grid h-9 w-9 place-items-center">♢</Link>
            <Link href="/settings" className="flex h-9 items-center gap-2 rounded-full border border-[#303530] bg-[#151815] pl-1 pr-3 text-xs"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#2b302b]">{preferences.displayName.slice(0, 2).toUpperCase()}</span><span className="hidden sm:inline">{preferences.displayName}</span></Link>
          </div>
          {searchOpen && <form onSubmit={event => { event.preventDefault(); submitSearch(); }} className="absolute left-4 right-4 top-[calc(100%+8px)] panel p-3 shadow-2xl md:left-8 md:right-auto md:w-[480px]"><label htmlFor="global-token-search" className="sr-only">Search token, symbol, or address</label><input id="global-token-search" autoFocus value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search token, symbol, address…" className="w-full rounded-xl border border-[#313631] bg-[#0c0f0d] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" /><div className="flex items-center justify-between px-2 pt-3"><p className="mono text-[10px] text-[#737a73]">TRY: PEPE · BONK · 7xKX…</p><button type="submit" disabled={!searchTerm.trim()} className="mono text-[10px] text-[var(--accent)] disabled:text-[#555b55]">SEARCH ↗</button></div></form>}
        </header>
        <main className="mx-auto max-w-[1440px] px-4 pb-28 pt-6 md:px-8 md:pb-10 md:pt-8">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex overflow-x-auto border-t border-[#282c28] bg-[#0c0e0d]/95 px-1 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">
        {nav.map((item) => { const active = pathname === item.href; return <Link key={item.href} href={item.href} className={`flex min-w-[64px] flex-1 flex-col items-center gap-1 text-[9px] ${active ? "text-[var(--accent)]" : "text-[#747b74]"}`}><span className="mono text-xl leading-5">{item.icon}</span>{item.shortLabel ?? item.label}</Link>; })}
      </nav>
    </div>
  );
}
