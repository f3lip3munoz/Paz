const CACHE_NAME = "paz-felipe-v3";
const STATE_CACHE = "paz-felipe-state";
const APP_SHELL = [
  "./",
  "./index.html",
  "./carta.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME && k !== STATE_CACHE).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

const SHELL_EXTENSIONS = [".html", ".css", ".js", ".json"];

function isAppShellRequest(request, url) {
  if (request.mode === "navigate") return true;
  return SHELL_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (isAppShellRequest(event.request, url)) {
    // network-first: siempre intenta traer la version mas nueva del sitio,
    // y solo usa lo cacheado si no hay conexion
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match("./index.html"))
        )
    );
    return;
  }

  // cache-first para fotos, iconos, audio y fuentes: rara vez cambian
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

/* ---------- aviso de mes cumplido en segundo plano ---------- */
const START_DATE = "2026-04-25T14:00:00";

function monthsTogether(start, now) {
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const reachedAnniversaryPoint =
    now.getDate() > start.getDate() || (now.getDate() === start.getDate() && nowMinutes >= startMinutes);
  if (!reachedAnniversaryPoint) months--;
  return Math.max(0, months);
}

async function getLastNotifiedMonth() {
  const cache = await caches.open(STATE_CACHE);
  const res = await cache.match("last-notified-month");
  return res ? res.text() : null;
}

async function setLastNotifiedMonth(months) {
  const cache = await caches.open(STATE_CACHE);
  await cache.put("last-notified-month", new Response(String(months)));
}

async function checkMonthAnniversary() {
  const start = new Date(START_DATE);
  const now = new Date();
  if (now.getDate() !== start.getDate() || now.getHours() < 12) return;

  const months = monthsTogether(start, now);
  if (months <= 0) return;

  const last = await getLastNotifiedMonth();
  if (last === String(months)) return;

  await self.registration.showNotification(
    "👑 " + months + (months === 1 ? " mes juntos" : " meses juntos"),
    {
      body: "Otro mes más contigo, princesa. Entra a ver el contador 💛",
      icon: "icons/icon-192.png",
      badge: "icons/icon-192.png",
    }
  );
  await setLastNotifiedMonth(months);
}

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "month-anniversary-check") {
    event.waitUntil(checkMonthAnniversary());
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("./index.html");
    })
  );
});
