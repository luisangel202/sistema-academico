import { useState, useEffect, useCallback } from "react";

/**
 * Hook para PWA: instalación + notificaciones push.
 *
 * Instalación:
 *  - isInstallable / isInstalled / promptInstall()
 *  - Detecta iOS (instrucciones manuales)
 *
 * Notificaciones:
 *  - notificationPermission: "default" | "granted" | "denied"
 *  - requestNotifications(): pide permiso
 *  - sendNotification(title, body): lanza notificación local
 *  - isPushSupported: si el navegador soporta push
 */
export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState("default");
  const [isPushSupported, setIsPushSupported] = useState(false);

  /* ── Detectar standalone / instalada ────────────────── */
  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);
    setIsInstalled(standalone);
  }, []);

  /* ── Estado de notificaciones ────────────────────────── */
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
    if ("PushManager" in window && "serviceWorker" in navigator) {
      setIsPushSupported(true);
    }
  }, []);

  /* ── beforeinstallprompt ────────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  /* ── appinstalled ───────────────────────────────────── */
  useEffect(() => {
    const handler = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  /* ── promptInstall ──────────────────────────────────── */
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
    return outcome === "accepted";
  }, [deferredPrompt]);

  /* ── Pedir permiso de notificaciones ────────────────── */
  const requestNotifications = useCallback(async () => {
    if (!("Notification" in window)) return "unsupported";
    const result = await Notification.requestPermission();
    setNotificationPermission(result);
    return result;
  }, []);

  /* ── Enviar notificación local ──────────────────────── */
  const sendNotification = useCallback(
    async (title, body, url = "/") => {
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        reg.showNotification(title, {
          body,
          icon: "/maskable-icon.svg",
          badge: "/favicon.svg",
          tag: "edurural-" + Date.now(),
          vibrate: [80, 40, 80],
          data: { url },
        });
      } else {
        new Notification(title, { body, icon: "/favicon.svg" });
      }
    },
    []
  );

  /* ── Detectar iOS ───────────────────────────────────── */
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    isIOS,
    promptInstall,
    notificationPermission,
    isPushSupported,
    requestNotifications,
    sendNotification,
  };
}
