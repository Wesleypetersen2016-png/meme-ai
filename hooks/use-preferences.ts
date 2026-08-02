"use client";

import { useLocalStorage } from "./use-local-storage";

export type AccentColor = "lime" | "blue" | "violet" | "rose" | "gold";
export type SurfaceTheme = "carbon" | "midnight" | "graphite";

export type AppPreferences = {
  displayName: string;
  accent: AccentColor;
  surface: SurfaceTheme;
  compactMode: boolean;
};

export const defaultPreferences: AppPreferences = {
  displayName: "Investor",
  accent: "lime",
  surface: "carbon",
  compactMode: false,
};

export const accentColors: Record<AccentColor, string> = {
  lime: "#c8ff3d",
  blue: "#62a8ff",
  violet: "#a78bfa",
  rose: "#fb7185",
  gold: "#f5c451",
};

export function usePreferences() {
  const [preferences, setPreferences] = useLocalStorage<AppPreferences>("momentumiq:preferences", defaultPreferences);
  const updatePreferences = (updates: Partial<AppPreferences>) => setPreferences(current => ({ ...defaultPreferences, ...current, ...updates }));
  return { preferences: { ...defaultPreferences, ...preferences }, updatePreferences };
}
