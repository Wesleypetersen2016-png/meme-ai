"use client";

import { useLocalStorage } from "./use-local-storage";
import { useMemo } from "react";

export type GoalProfile = {
  objective: "growth" | "preservation" | "learning";
  horizon: "intraday" | "swing" | "long-term";
  riskTolerance: "conservative" | "balanced" | "aggressive";
  targetReturn: number;
  maxPosition: number;
  maxLoss: number;
  alertScore: number;
  chains: string[];
};

export const defaultGoals: GoalProfile = {
  objective: "growth",
  horizon: "swing",
  riskTolerance: "balanced",
  targetReturn: 20,
  maxPosition: 10,
  maxLoss: 8,
  alertScore: 65,
  chains: ["MARKET", "ETH", "SOL"],
};

export function useGoals() {
  const [storedGoals, setGoals] = useLocalStorage<GoalProfile>("nexiq:goals:v2", defaultGoals);
  const goals = useMemo(() => ({ ...defaultGoals, ...storedGoals }), [storedGoals]);
  const updateGoals = (updates: Partial<GoalProfile>) => setGoals(current => ({ ...defaultGoals, ...current, ...updates }));
  return { goals, updateGoals };
}
