"use client";
import { useLocalStorage } from "./use-local-storage";
export type PortfolioPosition = { symbol: string; amount: number; entryPrice: number };
export function usePortfolio() {
  const [positions, setPositions] = useLocalStorage<PortfolioPosition[]>("meme-ai:portfolio", []);
  const addPosition = (position: PortfolioPosition) => setPositions(current => [...current.filter(item => item.symbol !== position.symbol), position]);
  const removePosition = (symbol: string) => setPositions(current => current.filter(item => item.symbol !== symbol));
  return { positions, addPosition, removePosition };
}
