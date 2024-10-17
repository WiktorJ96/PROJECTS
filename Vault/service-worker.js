const CACHE_NAME = "budget-tracker-cache-v1.0.3";
const ASSETS_TO_CACHE = [
  "/",
  "./Vault.html",
  "./Vault.css",
  "./JS/Main.js",
  "./JS/ChartManager.js",
  "./JS/TransactionManager.js",
  "./JS/UIManager.js",
  "./JS/PWAManager.js",
  "../translations/Vault-pl.json",
  "../translations/Vault-en.json",
  "./assets/vault_icon_manifest.svg",
  "./assets/Vault_icon.png",
  "https://cdn.jsdelivr.net/npm/chart.js",
];

const API_BASE_URL = self.location.origin; // Używamy originu, zakładając, że API jest pod tym samym adresem

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

// Rejestracja synchronizacji w tle
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-transactions") {
    event.waitUntil(syncTransactions());
  }
});

// Funkcja otwierająca IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("transactionsDB", 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("transactions")) {
        const store = db.createObjectStore("transactions", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("synced", "synced", { unique: false }); // Tworzymy indeks na polu "synced"
      }
    };
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Funkcja pobierająca niesynchronizowane transakcje
function getUnsyncedTransactions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("transactions", "readonly");
    const store = transaction.objectStore("transactions");
    const index = store.index("synced");
    const request = index.getAll(IDBKeyRange.only(false));

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Funkcja oznaczająca transakcję jako zsynchronizowaną
function markTransactionAsSynced(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("transactions", "readwrite");
    const store = transaction.objectStore("transactions");
    const getRequest = store.get(id);

    getRequest.onsuccess = (event) => {
      const data = event.target.result;
      data.synced = true;
      const putRequest = store.put(data);

      putRequest.onsuccess = () => {
        resolve();
      };
      putRequest.onerror = (event) => {
        reject(event.target.error);
      };
    };
    getRequest.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Funkcja synchronizująca transakcje z MongoDB
async function syncTransactions() {
  try {
    const db = await openIndexedDB();
    const transactions = await getUnsyncedTransactions(db);

    for (const transaction of transactions) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transaction),
        });

        if (response.ok) {
          console.log("Transakcja zsynchronizowana z MongoDB:", transaction);
          await markTransactionAsSynced(db, transaction.id);
        } else {
          console.error(
            "Błąd przy synchronizacji transakcji:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Błąd przy synchronizacji transakcji:", error);
      }
    }
  } catch (error) {
    console.error("Błąd podczas synchronizacji w tle:", error);
  }
}
