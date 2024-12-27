/**
 * Manages IndexedDB operations for transaction management.
 * Provides methods for CRUD operations and synchronization status tracking.
 */
class IndexedDBManager {
  /**
   * Initializes an instance of IndexedDBManager.
   * Sets up database parameters and initializes the database.
   *
   * @constructor
   */
  constructor() {
    /**
     * Name of the IndexedDB database.
     * @type {string}
     */
    this.dbName = "transactionsDB";

    /**
     * Version of the IndexedDB database.
     * @type {number}
     */
    this.dbVersion = 1;

    /**
     * Instance of the IndexedDB database.
     * @type {IDBDatabase|null}
     */
    this.db = null;

    this.initializeDB();
  }

  /**
   * Initializes the IndexedDB database and sets up object stores if needed.
   */
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
      console.log("IndexedDB initialized.");
    };

    request.onerror = (event) => {
      console.error("Error initializing IndexedDB:", event.target.error);
    };
  }

  /**
   * Retrieves the IndexedDB database instance, initializing it if necessary.
   *
   * @returns {Promise<IDBDatabase>} The database instance.
   */
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

  /**
   * Retrieves all transactions from the database.
   *
   * @returns {Promise<Array>} An array of transaction objects.
   */
  async getTransactions() {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("transactions", "readonly");
      const store = transaction.objectStore("transactions");
      const request = store.getAll();

      request.onsuccess = () => {
        const transactions = request.result.map((tx) => ({
          ...tx,
          id: tx.id.toString(),
        }));
        console.log("Fetched transactions from IndexedDB:", transactions);
        resolve(transactions);
      };

      request.onerror = (event) => {
        console.error(
          "Error fetching transactions from IndexedDB:",
          event.target.error
        );
        reject(event.target.error);
      };
    });
  }

  /**
   * Retrieves all unsynchronized transactions.
   *
   * @returns {Promise<Array>} An array of unsynchronized transaction objects.
   */
  async getUnsyncedTransactions() {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("transactions", "readonly");
      const store = transaction.objectStore("transactions");
      const request = store.getAll();

      request.onsuccess = (event) => {
        const transactions = event.target.result || [];
        const unsynced = transactions.filter((tx) => tx.isSynced === false);
        resolve(unsynced.map((tx) => ({ ...tx, id: tx.id.toString() })));
      };

      request.onerror = (event) => {
        console.error(
          "Error fetching unsynchronized transactions:",
          event.target.error
        );
        reject(event.target.error);
      };
    });
  }

  /**
   * Marks a transaction as synchronized in the database.
   *
   * @param {string} id - The ID of the transaction to mark as synced.
   * @returns {Promise<void>}
   */
  async markTransactionAsSynced(id) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("transactions", "readwrite");
      const store = transaction.objectStore("transactions");
      const idNumber = Number(id);
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

  /**
   * Adds a new transaction to the database.
   *
   * @param {Object} transaction - The transaction object to add.
   * @returns {Promise<Object>} The added transaction with its generated ID.
   */
  async addTransaction(transaction) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("transactions", "readwrite");
      const store = tx.objectStore("transactions");
      const newTransaction = {
        ...transaction,
        isSynced: Boolean(transaction.isSynced),
      };
      const request = store.add(newTransaction);
      request.onsuccess = (event) => {
        newTransaction.id = event.target.result.toString();
        resolve(newTransaction);
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  /**
   * Deletes a transaction by its ID.
   *
   * @param {string} id - The ID of the transaction to delete.
   * @returns {Promise<void>}
   */
  async deleteTransaction(id) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("transactions", "readwrite");
      const store = tx.objectStore("transactions");
      const idNumber = Number(id);
      const request = store.delete(idNumber);
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  /**
   * Deletes all transactions from the database.
   *
   * @returns {Promise<void>}
   */
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
