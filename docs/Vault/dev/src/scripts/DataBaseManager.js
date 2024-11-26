import MongoDBManager from "./MongoDBManager.js";
import IndexedDBManager from "./IndexedDBManager.js";
/**
 * Manages database operations for the application.
 * Handles both MongoDB and IndexedDB for transactional data storage.
 * Provides fallback mechanisms in case of server unavailability.
 */
class DataBaseManager {
  /**
   * Initializes the database manager, setting up both MongoDB and IndexedDB managers.
   * Starts periodic server availability checks.
   *
   * @constructor
   */
  constructor() {
    /**
     * Instance of the MongoDBManager for server-based operations.
     * @type {MongoDBManager}
     */
    this.mongoDBManager = new MongoDBManager();

    /**
     * Instance of the IndexedDBManager for client-side operations.
     * @type {IndexedDBManager}
     */
    this.indexedDBManager = new IndexedDBManager();

    /**
     * Indicates whether the server is available.
     * @type {boolean}
     */
    this.serverAvailable = true;

    this.startServerAvailabilityChecks();
  }

  /**
   * Starts periodic checks for server availability.
   * The checks occur every 5 seconds.
   */
  startServerAvailabilityChecks() {
    this.checkServerAvailability();
    this.serverCheckInterval = setInterval(() => {
      this.checkServerAvailability();
    }, 5000);
  }

  /**
   * Checks if the server is available by sending a ping request.
   * Updates the `serverAvailable` flag based on the response.
   *
   * @returns {Promise<void>}
   */
  async checkServerAvailability() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch("/ping", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      this.serverAvailable = response.ok;
    } catch (error) {
      this.serverAvailable = false;
    }
  }

  /**
   * Retrieves all transactions, preferring MongoDB if the server is available.
   * Falls back to IndexedDB if the server is unavailable or an error occurs.
   *
   * @returns {Promise<Array>} An array of transaction objects.
   */
  async getTransactions() {
    if (this.serverAvailable) {
      try {
        return await this.mongoDBManager.getTransactions();
      } catch (error) {
        console.error(
          "Failed to get transactions from MongoDB, falling back to IndexedDB:",
          error
        );
        this.serverAvailable = false;
        return await this.indexedDBManager.getTransactions();
      }
    } else {
      return await this.indexedDBManager.getTransactions();
    }
  }

  /**
   * Adds a new transaction, preferring MongoDB if the server is available.
   * Falls back to IndexedDB if an error occurs or the server is unavailable.
   *
   * @param {Object} transaction - The transaction object to add.
   * @returns {Promise<Object>} The added transaction.
   */
  async addTransaction(transaction) {
    if (this.serverAvailable) {
      try {
        return await this.mongoDBManager.addTransaction(transaction);
      } catch (error) {
        console.error(
          "Error adding transaction to MongoDB, falling back to IndexedDB:",
          error
        );
        this.serverAvailable = false;
        return await this.indexedDBManager.addTransaction(transaction);
      }
    } else {
      return this.indexedDBManager.addTransaction(transaction);
    }
  }

  /**
   * Deletes a transaction by its ID, preferring MongoDB if the server is available.
   * Falls back to IndexedDB if an error occurs or the server is unavailable.
   *
   * @param {string} id - The ID of the transaction to delete.
   * @returns {Promise<void>}
   */
  async deleteTransaction(id) {
    if (this.serverAvailable) {
      try {
        return await this.mongoDBManager.deleteTransaction(id);
      } catch (error) {
        console.error(
          "Error deleting transaction from MongoDB, falling back to IndexedDB:",
          error
        );
        this.serverAvailable = false;
        return await this.indexedDBManager.deleteTransaction(id);
      }
    } else {
      return this.indexedDBManager.deleteTransaction(id);
    }
  }

  /**
   * Deletes all transactions, preferring MongoDB if the server is available.
   * Falls back to IndexedDB if an error occurs or the server is unavailable.
   *
   * @returns {Promise<void>}
   */
  async deleteAllTransactions() {
    if (this.serverAvailable) {
      try {
        return await this.mongoDBManager.deleteAllTransactions();
      } catch (error) {
        console.error(
          "Error deleting all transactions from MongoDB, falling back to IndexedDB:",
          error
        );
        this.serverAvailable = false;
        return await this.indexedDBManager.deleteAllTransactions();
      }
    } else {
      return this.indexedDBManager.deleteAllTransactions();
    }
  }

  /**
   * Retrieves all unsynchronized transactions from IndexedDB.
   *
   * @returns {Promise<Array>} An array of unsynchronized transaction objects.
   */
  async getUnsyncedTransactions() {
    return this.indexedDBManager.getUnsyncedTransactions();
  }

  /**
   * Marks a transaction as synchronized in IndexedDB.
   *
   * @param {string} id - The ID of the transaction to mark as synced.
   * @returns {Promise<void>}
   */
  async markTransactionAsSynced(id) {
    return this.indexedDBManager.markTransactionAsSynced(id);
  }

  /**
   * Synchronizes unsynchronized transactions from IndexedDB to MongoDB.
   * Attempts to add each transaction to MongoDB and marks it as synced if successful.
   *
   * @returns {Promise<void>}
   */
  async syncTransactions() {
    if (!this.serverAvailable) return;

    try {
      const unsyncedTransactions =
        await this.indexedDBManager.getUnsyncedTransactions();
      console.log("Unsynced transactions:", unsyncedTransactions);

      for (const transaction of unsyncedTransactions) {
        try {
          const syncedTransaction =
            await this.mongoDBManager.addTransaction(transaction);
          await this.indexedDBManager.markTransactionAsSynced(transaction.id);
          console.log("Transaction synchronized:", syncedTransaction);
        } catch (error) {
          console.error("Error synchronizing transaction:", transaction, error);
        }
      }
    } catch (error) {
      console.error("Error during synchronization:", error);
    }
  }
}

export default DataBaseManager;
