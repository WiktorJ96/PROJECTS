const CACHE_NAME = 'thoughtspace-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './ThoughtSpace.html',
  './ThoughtSpace.css',
  './ThoughtSpace.js',
  '../translations/notatnik-pl.json',
  '../translations/notatnik-en.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return Promise.all(
          ASSETS_TO_CACHE.map(url => {
            return cache.add(url).catch(error => {
              console.error(`Nie udało się dodać ${url} do cache:`, error);
            });
          })
        );
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(error => {
          console.error('Błąd pobierania zasobu:', error);
        });
      })
  );
});