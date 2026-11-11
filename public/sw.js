/* ── EduRural Service Worker ──────────────────────────────
   - Navigation → network first, offline fallback a index.html
   - Assets     → stale-while-revalidate
   - Push       → notificaciones push (preparado para backend)
   - Notif click → abre/enfoca la app
   ──────────────────────────────────────────────────────── */

const CACHE = "edurural-v1";

const PRECACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg",
  "/maskable-icon.svg",
  "/icons.svg",
  "/notification.mp3",
];

/* ── Install ──────────────────────────────────────────── */
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

/* ── Activate: limpia caches viejos ───────────────────── */
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ── Fetch ───────────────────────────────────────────── */
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  /* Navigation → network first, offline fallback */
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match("/index.html")));
    return;
  }

  /* Assets → stale-while-revalidate */
  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

/* ── Push notifications ───────────────────────────────── */
self.addEventListener("push", (e) => {
  let data = {};
  try {
    data = e.data ? e.data.json() : {};
  } catch {
    data = { body: e.data ? e.data.text() : "" };
  }

  const title = data.title || "EduRural";
  const options = {
    body: data.body || "Tienes una nueva notificación",
    icon: "/maskable-icon.svg",
    badge: "/favicon.svg",
    tag: data.tag || "edurural-notification",
    renotify: true,
    vibrate: [80, 40, 80],
    data: {
      url: data.url || "/",
    },
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

/* ── Notification click → abre o enfoca la app ────────── */
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const targetUrl = e.notification.data?.url || "/";

  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      /* Si ya hay una ventana abierta, enfocarla y navegar */
      for (const client of list) {
        if (client.url.includes(self.location.origin)) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      /* Si no, abrir nueva */
      return clients.openWindow(targetUrl);
    })
  );
});
