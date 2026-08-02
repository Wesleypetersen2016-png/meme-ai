"use client";
import { useLocalStorage } from "./use-local-storage";
export type PortfolioPosition = { symbol: string; amount: number; entryPrice: number; openedAt?: string; notes?: string };
export function usePortfolio() {
  const [positions, setPositions] = useLocalStorage<PortfolioPosition[]>("momentumiq:positions", []);
  const addPosition = (position: PortfolioPosition) => setPositions(current => [...current.filter(item => item.symbol !== position.symbol.toUpperCase()), { ...position, symbol: position.symbol.toUpperCase(), openedAt: position.openedAt ?? new Date().toISOString() }]);
  const removePosition = (symbol: string) => setPositions(current => current.filter(item => item.symbol !== symbol));
  return { positions, addPosition, removePosition };
}
