"use client";
import { useCallback, useEffect, useState } from "react";
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  useEffect(() => { if ("Notification" in window) setPermission(Notification.permission); }, []);
  const enable = useCallback(async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return "unsupported" as const;
    const result = await Notification.requestPermission(); setPermission(result);
    if (result === "granted") await navigator.serviceWorker.register("/sw.js");
    return result;
  }, []);
  return { permission, enable, supported: typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator };
}
