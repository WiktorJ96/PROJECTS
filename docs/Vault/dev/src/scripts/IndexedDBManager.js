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
        const store = db.createObjectStore("transactions", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("isSynced", "isSynced", { unique: false });
      }
    };

    request.onsuccess = (event) => {
      this.db = event.target.result;
      console.log("IndexedDB zainicjalizowane.");
    };

    request.onerror = (event) => {
      console.error("Błąd inicjalizacji IndexedDB:", event.target.error);
    };
  }

  async getDB() {
    if (this.db) {
      return this.db;
    }

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

  async getTransactions() {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("transactions", "readonly");
      const store = transaction.objectStore("transactions");
      const request = store.getAll();

      request.onsuccess = () => {
        // Convert IDs to strings
        const transactions = request.result.map((tx) => ({
          ...tx,
          id: tx.id.toString(),
        }));
        console.log("Pobrane transakcje z IndexedDB:", transactions);
        resolve(transactions);
      };

      request.onerror = (event) => {
        console.error(
          "Błąd pobierania transakcji z IndexedDB:",
          event.target.error
        );
        reject(event.target.error);
      };
    });
  }

  async getUnsyncedTransactions() {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("transactions", "readonly");
      const store = transaction.objectStore("transactions");
      const index = store.index("isSynced");
      const request = index.getAll(IDBKeyRange.only(false));
      request.onsuccess = () => {
        const transactions = request.result.map((tx) => ({
          ...tx,
          id: tx.id.toString(),
        }));
        resolve(transactions);
      };
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async markTransactionAsSynced(id) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("transactions", "readwrite");
      const store = transaction.objectStore("transactions");
      const idNumber = Number(id); // Convert ID to number
      const request = store.get(idNumber);
      request.onsuccess = (event) => {
        const record = event.target.result;
        if (record) {
          record.isSynced = true;
          const updateRequest = store.put(record);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = (error) => reject(error);
        } else {
          resolve();
        }
      };
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async addTransaction(transaction) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("transactions", "readwrite");
      const store = tx.objectStore("transactions");
      const newTransaction = {
        ...transaction,
        isSynced: transaction.isSynced || false,
      };
      const request = store.add(newTransaction);
      request.onsuccess = (event) => {
        // Convert the numeric ID to a string
        newTransaction.id = event.target.result.toString();
        resolve(newTransaction);
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
      const idNumber = Number(id); // Convert ID to number
      const request = store.delete(idNumber);
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
