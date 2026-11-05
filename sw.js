// Guarda la app en el teléfono para que abra sin señal.
// Si cambiás fuentes o íconos, subí el número de VERSION. Para tablas nuevas alcanza con reemplazar index.html.
const VERSION = "1";
const CACHE = "mi-recibo-" + VERSION;
const ARCHIVOS = [
 "./",
 "index.html",
 "manifest.webmanifest",
 "icon-192.png",
 "icon-512.png",
 "icon-maskable-512.png",
 "apple-touch-icon.png",
 "barlow-condensed-600.woff2",
 "barlow-condensed-700.woff2",
 "barlow-400.woff2",
 "barlow-500.woff2",
 "barlow-600.woff2",
 "ibm-plex-mono-400.woff2",
 "ibm-plex-mono-500.woff2"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  if (r.mode === "navigate") {
    // Busca la versión nueva, pero con poca señal abre la guardada a los 2,5 segundos.
    const red = fetch(r).then(res => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put("./", copia)); }
      return res;
    });
    const espera = new Promise(ok => setTimeout(ok, 2500)).then(() => caches.match("./"));
    e.respondWith(Promise.race([red.catch(() => caches.match("./")), espera]).then(res => res || red));
    return;
  }
  e.respondWith(caches.match(r).then(res => res || fetch(r)));
});
