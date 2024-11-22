const CACHE_NAME = "budget-tracker-cache-v1.0.3";
const ASSETS_TO_CACHE = [
  "/",
  "./Vault.html",
  "./Vault.css",
  "./Main.js",
  "https://cdn.jsdelivr.net/npm/chart.js",
];

// Instalacja i cache'owanie plików
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
        console.error("Nie udało się dodać zasobów do cache:", error);
      });
    })
  );
  self.skipWaiting();
});

// Aktywacja i usuwanie starych cache
self.addEventListener("activate", (event) => {
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

// Obsługa fetch i caching
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("fontawesome")) {
    return;
  }
  const shouldAlwaysUpdate = (request) => {
    const url = new URL(request.url);
    return (
      url.pathname.endsWith(".css") ||
      url.pathname.endsWith(".js") ||
      url.pathname.endsWith(".html") ||
      url.pathname.endsWith(".json")
    );
  };

  if (shouldAlwaysUpdate(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
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
      return fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          console.error("Nie udało się pobrać zasobu:", event.request.url);
        });
    })
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-transactions") {
    event.waitUntil(syncTransactions());
  }
});

async function syncTransactions() {
  const unsyncedTransactions = await getUnsyncedTransactionsFromIndexedDB(); // Funkcja do pobierania transakcji
  for (const transaction of unsyncedTransactions) {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      if (response.ok) {
        await markTransactionAsSyncedInIndexedDB(transaction.id);
      }
    } catch (error) {
      console.error("Błąd synchronizacji:", error);
    }
  }
}
