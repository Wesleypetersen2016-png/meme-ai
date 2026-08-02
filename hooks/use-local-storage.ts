"use client";
import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  useEffect(() => {
    try { const saved = localStorage.getItem(key); if (saved) setValue(JSON.parse(saved)); } catch {}
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key || !event.newValue) return;
      try { setValue(JSON.parse(event.newValue)); } catch {}
    };
    const handleLocalUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; value: T }>).detail;
      if (detail?.key === key) setValue(detail.value);
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("momentumiq:storage", handleLocalUpdate);
    return () => { window.removeEventListener("storage", handleStorage); window.removeEventListener("momentumiq:storage", handleLocalUpdate); };
  }, [key]);
  const update = useCallback((next: T | ((current: T) => T)) => setValue(current => {
    const resolved = typeof next === "function" ? (next as (current: T) => T)(current) : next;
    try {
      localStorage.setItem(key, JSON.stringify(resolved));
      queueMicrotask(() => window.dispatchEvent(new CustomEvent("momentumiq:storage", { detail: { key, value: resolved } })));
    } catch {}
    return resolved;
  }), [key]);
  return [value, update] as const;
}
