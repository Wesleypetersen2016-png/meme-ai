"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/", label: "Dashboard", icon: "⌁" },
  { href: "/scanner", label: "Scanner", icon: "⌖" },
  { href: "/watchlist", label: "Watchlist", icon: "☆" },
  { href: "/portfolio", label: "Portfolio", icon: "◒" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <div className="min-h-screen md:grid md:grid-cols-[224px_1fr]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 border-r border-[#252925] bg-[#0c0e0d] px-4 py-5 md:flex md:flex-col">
        <Link href="/" className="flex items-center gap-3 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d8ff3e] font-bold text-[#0a0c0b]">M</span>
          <div><div className="text-[17px] font-semibold tracking-tight">Meme AI</div><div className="eyebrow mt-1">Intelligence OS</div></div>
        </Link>
        <nav className="mt-12 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${active ? "bg-[#1b1f1a] text-white" : "text-[#7f877f] hover:bg-[#141714] hover:text-white"}`}><span className={`mono w-5 text-center text-lg ${active ? "acid" : ""}`}>{item.icon}</span>{item.label}{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#d8ff3e]" />}</Link>;
          })}
        </nav>
        <div className="panel grid-dots mt-auto p-4">
          <div className="eyebrow">Data status</div>
          <div className="mt-3 flex items-center gap-2 text-sm"><span className="h-2 w-2 rounded-full bg-[#d8ff3e] shadow-[0_0_12px_#d8ff3e]" />All systems live</div>
          <div className="mono mt-2 text-[10px] text-[#707770]">DEX · BIRDEYE · RPC</div>
        </div>
      </aside>

      <div className="md:col-start-2">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#222622] bg-[#0a0c0b]/90 px-4 backdrop-blur-xl md:h-20 md:px-8">
          <Link href="/" className="flex items-center gap-2 md:hidden"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#d8ff3e] font-bold text-black">M</span><span className="font-semibold">Meme AI</span></Link>
          <button onClick={() => setSearchOpen(!searchOpen)} className="pill hidden w-80 items-center gap-3 px-4 py-2.5 text-left text-xs text-[#757c75] md:flex"><span className="text-base">⌕</span> Search token, symbol, address…<kbd className="mono ml-auto text-[9px]">⌘ K</kbd></button>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} aria-label="Search" className="pill grid h-9 w-9 place-items-center md:hidden">⌕</button>
            <button aria-label="Notifications" className="pill relative grid h-9 w-9 place-items-center">♢<span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#d8ff3e]" /></button>
            <button className="flex h-9 items-center gap-2 rounded-full border border-[#303530] bg-[#151815] pl-1 pr-3 text-xs"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#2b302b]">WP</span><span className="hidden sm:inline">0x8F…21c</span></button>
          </div>
          {searchOpen && <div className="absolute left-4 right-4 top-[calc(100%+8px)] panel p-3 shadow-2xl md:left-8 md:right-auto md:w-[480px]"><input autoFocus placeholder="Search token, symbol, address…" className="w-full rounded-xl border border-[#313631] bg-[#0c0f0d] px-4 py-3 text-sm outline-none focus:border-[#d8ff3e]" /><p className="mono px-2 pt-3 text-[10px] text-[#737a73]">TRY: PEPE · BONK · 7xKX…</p></div>}
        </header>
        <main className="mx-auto max-w-[1440px] px-4 pb-28 pt-6 md:px-8 md:pb-10 md:pt-8">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-[#282c28] bg-[#0c0e0d]/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">
        {nav.map((item) => { const active = pathname === item.href; return <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 text-[10px] ${active ? "text-[#d8ff3e]" : "text-[#747b74]"}`}><span className="mono text-xl leading-5">{item.icon}</span>{item.label}</Link>; })}
      </nav>
    </div>
  );
}
