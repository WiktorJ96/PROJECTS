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
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});