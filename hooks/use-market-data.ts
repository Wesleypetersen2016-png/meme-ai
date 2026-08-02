"use client";

import { useCallback, useEffect, useState } from "react";
import type { Token } from "@/lib/data";
import { loadBroadMarket } from "@/lib/market-client";

export function useMarketData() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const results = await loadBroadMarket();
      setTokens(results);
      setStatus("ready");
      return results;
    } catch {
      setTokens([]);
      setStatus("error");
      return [];
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  return { tokens, status, refresh };
}
