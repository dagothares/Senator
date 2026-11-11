/* Metator VR — service worker : l'application s'ouvre même sans réseau.
   Les packs ne sont jamais mis en cache : ils sont choisis à chaque visite. */
const CACHE = 'metator-vr-v1';
const FILES = ['metator-vr.html', 'metator-vr.webmanifest', 'metator-vr-icon-192.png', 'metator-vr-icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
// réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('metator-vr.html'))));
});
