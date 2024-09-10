const CACHE_NAME = 'thoughtspace-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './ThoughtSpace.html',
  './ThoughtSpace.css',
  './ThoughtSpace.js',
  '../translations/notatnik-pl.json',
  '../translations/notatnik-en.json',
  './ikona_ThoughtSpace.png',
  './ThoughtSpace_icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
      .catch(() => {
        console.error('Nie udało się pobrać zasobu:', event.request.url);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});