// IndexedDBManager.js
class IndexedDBManager {
  constructor() {
    this.dbName = "transactionsDB";
    this.dbVersion = 1;
    this.db = null;
    this.initializeDB();
  }

  initializeDB() {
    const request = indexedDB.open(this.dbName, this.dbVersion);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("transactions")) {
        db.createObjectStore("transactions", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event) => {
      this.db = event.target.result;
      console.log("IndexedDB initialized.");
    };

    request.onerror = (event) => {
      console.error("IndexedDB initialization error:", event.target.error);
    };
  }

  async getDB() {
    if (this.db) {
      return this.db;
    } else {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion);
        request.onsuccess = (event) => {
          this.db = event.target.result;
          resolve(this.db);
        };
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    }
  }

  async getTransactions() {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("transactions", "readonly");
      const store = transaction.objectStore("transactions");
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  async addTransaction(transaction) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("transactions", "readwrite");
      const store = tx.objectStore("transactions");
      const request = store.add(transaction);
      request.onsuccess = (event) => {
        transaction.id = event.target.result;
        resolve(transaction);
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  async deleteTransaction(id) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("transactions", "readwrite");
      const store = tx.objectStore("transactions");
      const request = store.delete(id);
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  async deleteAllTransactions() {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("transactions", "readwrite");
      const store = tx.objectStore("transactions");
      const request = store.clear();
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
}

export default IndexedDBManager;
