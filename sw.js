const CACHE_NAME = "kat-muis-zak-v4";
const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./app-icon.svg",
  "./assets/kat-links.svg",
  "./assets/kat-rechts.svg",
  "./assets/muis-links.svg",
  "./assets/muis-rechts.svg",
  "./assets/oor.svg",
  "./assets/ronding.svg",
  "./assets/rug-links.svg",
  "./assets/rug-rechts.svg",
  "./assets/zak-links.svg",
  "./assets/zak-rechts.svg"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
