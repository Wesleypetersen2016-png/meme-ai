"use client";

import { useLocalStorage } from "./use-local-storage";

export type SyncedHolding = {
  id: string;
  chain: string;
  symbol: string;
  name: string;
  amount: number;
  value: number | null;
  price: number | null;
  address?: string;
  image?: string;
  native: boolean;
};

type FomoPortfolio = {
  evmAddress: string;
  solanaAddress: string;
  holdings: SyncedHolding[];
  updatedAt: string | null;
};

const defaults: FomoPortfolio = { evmAddress: "", solanaAddress: "", holdings: [], updatedAt: null };

export function useFomoPortfolio() {
  const [connection, setConnection] = useLocalStorage<FomoPortfolio>("nexiq:fomo-portfolio:v1", defaults);
  const updateConnection = (updates: Partial<FomoPortfolio>) => setConnection(current => ({ ...defaults, ...current, ...updates }));
  const disconnect = () => setConnection(defaults);
  return { connection: { ...defaults, ...connection }, updateConnection, disconnect };
}
