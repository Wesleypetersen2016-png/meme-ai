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
  accent: "blue",
  surface: "carbon",
  compactMode: false,
};

export const accentColors: Record<AccentColor, string> = {
  lime: "#a8b59b",
  blue: "#91a7ff",
  violet: "#b4a2d8",
  rose: "#d39ba5",
  gold: "#c7ad7b",
};

export function usePreferences() {
  const [preferences, setPreferences] = useLocalStorage<AppPreferences>("nexiq:preferences:v2", defaultPreferences);
  const updatePreferences = (updates: Partial<AppPreferences>) => setPreferences(current => ({ ...defaultPreferences, ...current, ...updates }));
  return { preferences: { ...defaultPreferences, ...preferences }, updatePreferences };
}
