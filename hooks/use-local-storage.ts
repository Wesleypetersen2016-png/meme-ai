"use client";
import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  useEffect(() => { try { const saved = localStorage.getItem(key); if (saved) setValue(JSON.parse(saved)); } catch {} }, [key]);
  const update = useCallback((next: T | ((current: T) => T)) => setValue(current => { const resolved = typeof next === "function" ? (next as (current: T) => T)(current) : next; try { localStorage.setItem(key, JSON.stringify(resolved)); } catch {} return resolved; }), [key]);
  return [value, update] as const;
}
