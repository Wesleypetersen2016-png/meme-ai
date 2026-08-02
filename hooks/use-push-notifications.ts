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
  const notify = useCallback(async (title: string, body: string, url = "/scanner") => {
    if (!("serviceWorker" in navigator) || Notification.permission !== "granted") return false;
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, { body, icon: "/favicon.svg", badge: "/favicon.svg", data: url, tag: "momentumiq-signal" });
    return true;
  }, []);
  return { permission, enable, notify, supported: typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator };
}
