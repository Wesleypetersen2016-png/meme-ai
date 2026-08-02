"use client";

import { useLocalStorage } from "./use-local-storage";

export type AccentColor = "blue" | "sky" | "teal" | "sage" | "lime" | "gold" | "copper" | "rose" | "violet" | "plum";
export type SurfaceTheme = "carbon" | "midnight" | "graphite" | "espresso" | "forest";
export type CornerStyle = "tailored" | "soft" | "rounded";
export type TextScale = "compact" | "standard" | "large";

export type AppPreferences = {
  displayName: string;
  accent: AccentColor;
  surface: SurfaceTheme;
  corners: CornerStyle;
  textScale: TextScale;
  reduceMotion: boolean;
  compactMode: boolean;
};

export const defaultPreferences: AppPreferences = {
  displayName: "Investor",
  accent: "blue",
  surface: "carbon",
  corners: "tailored",
  textScale: "standard",
  reduceMotion: false,
  compactMode: false,
};

export const accentColors: Record<AccentColor, string> = {
  lime: "#a8b59b",
  blue: "#91a7ff",
  sky: "#87b9d4",
  teal: "#72b7ad",
  sage: "#9eaf96",
  violet: "#b4a2d8",
  rose: "#d39ba5",
  gold: "#c7ad7b",
  copper: "#c58f73",
  plum: "#b78eae",
};

export const accentLabels: Record<AccentColor, string> = {
  blue: "Periwinkle", sky: "Sky", teal: "Teal", sage: "Sage", lime: "Moss",
  gold: "Champagne", copper: "Copper", rose: "Rose", violet: "Violet", plum: "Plum",
};

export function usePreferences() {
  const [preferences, setPreferences] = useLocalStorage<AppPreferences>("nexiq:preferences:v2", defaultPreferences);
  const updatePreferences = (updates: Partial<AppPreferences>) => setPreferences(current => ({ ...defaultPreferences, ...current, ...updates }));
  return { preferences: { ...defaultPreferences, ...preferences }, updatePreferences };
}
