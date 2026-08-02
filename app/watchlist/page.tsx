"use client";

import { PageHeading } from "@/components/page-heading";
import { TokenTable } from "@/components/token-table";
import { useMarketData } from "@/hooks/use-market-data";

export default function WatchlistPage() {
  const market = useMarketData();
  return <div className="space-y-6"><PageHeading eyebrow="Focused radar" title="Watchlist" description="Only the tokens you have starred, using current market data." /><TokenTable data={market.tokens} watchlistOnly description="Live data for starred tokens" emptyMessage={market.status === "loading" ? "Loading current watchlist data…" : market.status === "error" ? "Live market data is unavailable." : "No live data is available for your starred tokens."} /></div>;
}
