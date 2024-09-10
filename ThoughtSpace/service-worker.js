const CACHE_NAME = 'thoughtspace-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './ThoughtSpace.html',
  './ThoughtSpace.css',
  './ThoughtSpace.js',
  '../translations/notatnik-pl.json',
  '../translations/notatnik-en.json',
  './assets/ikona_ThoughtSpace.png',
  './assets/ThoughtSpace_icon.svg',
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
  if (event.request.url.includes('fontawesome')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        }).catch(() => {
          console.error('Nie udało się pobrać zasobu:', event.request.url);
        });
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