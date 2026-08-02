"use client";
import { useLocalStorage } from "./use-local-storage";
export function useWatchlist() {
  const [symbols, setSymbols] = useLocalStorage<string[]>("meme-ai:watchlist", ["PEPE", "BONK", "MOG"]);
  const toggle = (symbol: string) => setSymbols(current => current.includes(symbol) ? current.filter(item => item !== symbol) : [...current, symbol]);
  return { symbols, toggle, isWatched: (symbol: string) => symbols.includes(symbol) };
}
