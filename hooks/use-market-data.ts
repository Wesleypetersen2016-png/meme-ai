"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Token } from "@/lib/data";
import { loadBroadMarket } from "@/lib/market-client";

export function useMarketData() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const hasData = useRef(false);

  const refresh = useCallback(async () => {
    if (!hasData.current) setStatus("loading");
    try {
      const feed = await loadBroadMarket();
      setTokens(feed.tokens);
      hasData.current = feed.tokens.length > 0;
      setUpdatedAt(feed.updatedAt);
      setProvider(feed.provider);
      setError(null);
      setStatus("ready");
      return feed.tokens;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Live market feed unavailable");
      setStatus("error");
      return [];
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 120_000);
    return () => window.clearInterval(timer);
  }, [refresh]);
  return { tokens, status, error, updatedAt, provider, refresh };
}
