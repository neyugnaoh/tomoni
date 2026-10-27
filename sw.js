/* Service worker — app shell + data + media caching.
 * - media:  cache-first (immutable, keyed by id)
 * - data/*: network-first (so GitHub Pages updates propagate), cache fallback offline
 * - shell:  stale-while-revalidate (fast load, updates next visit)
 * Bump VERSION when you change cached shell files.
 */
const VERSION = "jl-v7";
const SHELL = [
  "./", "./index.html", "./styles.css", "./app.js", "./reading.js",
  "./data/vocab.js", "./data/bundled.js", "./manifest.json", "./icon.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;

  // Media: cache-first (files never change — keyed by id).
  if (url.pathname.includes("/media/")) {
    e.respondWith(caches.open(VERSION).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => { c.put(req, res.clone()); return res; }))));
    return;
  }

  // Data (vocab/bundled): network-first so content updates show up, cache fallback offline.
  if (sameOrigin && url.pathname.includes("/data/")) {
    e.respondWith(
      fetch(req).then((res) => { if (res && res.ok) caches.open(VERSION).then((c) => c.put(req, res.clone())); return res; })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Shell + everything else: stale-while-revalidate.
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req).then((res) => {
        if (res && res.ok && sameOrigin) caches.open(VERSION).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
