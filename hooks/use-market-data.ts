"use client";

import { useCallback, useEffect, useState } from "react";
import type { Token } from "@/lib/data";
import { loadTrackedMarket } from "@/lib/market-client";

export function useMarketData() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const refresh = useCallback(async (force = true) => {
    setStatus("loading");
    try {
      const results = await loadTrackedMarket(force);
      setTokens(results);
      setStatus("ready");
      return results;
    } catch {
      setTokens([]);
      setStatus("error");
      return [];
    }
  }, []);

  useEffect(() => { void refresh(false); }, [refresh]);
  return { tokens, status, refresh };
}
