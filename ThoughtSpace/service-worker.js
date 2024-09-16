const CACHE_NAME = 'thoughtspace-cache-v4';
const ASSETS_TO_CACHE = [
  './',
  './ThoughtSpace.html',
  './JS/Main.js',
  './ThoughtSpace.css',
  '../translations/notatnik-pl.json',
  '../translations/notatnik-en.json',
  './assets/ikona_ThoughtSpace.png',
  './assets/ThoughtSpace_icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(error => {
        console.error('Nie udało się dodać zasobów do cache:', error);
      });
    })
  );
  self.skipWaiting(); 
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
  self.clients.claim(); 
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('fontawesome')) {
    return;
  }

  if (event.request.url.endsWith('.css')) {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        console.error('Nie udało się pobrać zasobu:', event.request.url);
      });
    })
  );
});
