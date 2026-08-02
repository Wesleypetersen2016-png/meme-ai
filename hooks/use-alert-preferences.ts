"use client";

import { useLocalStorage } from "./use-local-storage";

export type AlertPreferences = {
  buySignals: boolean;
};

const defaults: AlertPreferences = { buySignals: true };

export function useAlertPreferences() {
  const [alerts, setAlerts] = useLocalStorage<AlertPreferences>("momentumiq:alerts", defaults);
  const toggleAlert = (key: keyof AlertPreferences) => setAlerts(current => ({ ...defaults, ...current, [key]: !current[key] }));
  return { alerts: { ...defaults, ...alerts }, toggleAlert };
}
