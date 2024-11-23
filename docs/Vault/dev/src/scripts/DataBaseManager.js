import MongoDBManager from "./MongoDBManager.js";
import IndexedDBManager from "./IndexedDBManager.js";

class DataBaseManager {
  constructor() {
    this.mongoDBManager = new MongoDBManager();
    this.indexedDBManager = new IndexedDBManager();
    this.serverAvailable = true; // Initially set to true
    this.startServerAvailabilityChecks();
  }

  startServerAvailabilityChecks() {
    // Pierwsze sprawdzenie
    this.checkServerAvailability();

    // Następne sprawdzenia co 5 sekund
    this.serverCheckInterval = setInterval(() => {
      this.checkServerAvailability();
    }, 5000); // co 5000 ms = 5 sekund
  }

  async checkServerAvailability() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 sekundy

      const response = await fetch("/ping", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      this.serverAvailable = response.ok;
    } catch (error) {
      this.serverAvailable = false;
    }
  }

  async getTransactions() {
    if (this.serverAvailable) {
      try {
        return await this.mongoDBManager.getTransactions();
      } catch (error) {
        console.error("Failed to get transactions from MongoDB, falling back to IndexedDB:", error);
        this.serverAvailable = false; // Update server availability
        return await this.indexedDBManager.getTransactions();
      }
    } else {
      return await this.indexedDBManager.getTransactions();
    }
  }

  async addTransaction(transaction) {
    if (this.serverAvailable) {
      try {
        return await this.mongoDBManager.addTransaction(transaction);
      } catch (error) {
        console.error(
          "Błąd dodawania transakcji do MongoDB, przełączam na IndexedDB:",
          error
        );
        this.serverAvailable = false; // Aktualizacja stanu serwera
        return await this.indexedDBManager.addTransaction(transaction);
      }
    } else {
      return this.indexedDBManager.addTransaction(transaction);
    }
  }

  async deleteTransaction(id) {
    if (this.serverAvailable) {
      try {
        return await this.mongoDBManager.deleteTransaction(id);
      } catch (error) {
        console.error(
          "Błąd usuwania transakcji z MongoDB, przełączam na IndexedDB:",
          error
        );
        this.serverAvailable = false;
        return await this.indexedDBManager.deleteTransaction(id);
      }
    } else {
      return this.indexedDBManager.deleteTransaction(id);
    }
  }

  async deleteAllTransactions() {
    if (this.serverAvailable) {
      try {
        return await this.mongoDBManager.deleteAllTransactions();
      } catch (error) {
        console.error(
          "Błąd usuwania wszystkich transakcji z MongoDB, przełączam na IndexedDB:",
          error
        );
        this.serverAvailable = false;
        return await this.indexedDBManager.deleteAllTransactions();
      }
    } else {
      return this.indexedDBManager.deleteAllTransactions();
    }
  }

  async getUnsyncedTransactions() {
    return this.indexedDBManager.getUnsyncedTransactions();
  }

  async markTransactionAsSynced(id) {
    return this.indexedDBManager.markTransactionAsSynced(id);
  }

  async syncTransactions() {
    if (!this.serverAvailable) return;

    try {
      const unsyncedTransactions =
        await this.indexedDBManager.getUnsyncedTransactions();
      console.log("Niesynchronizowane transakcje:", unsyncedTransactions);

      for (const transaction of unsyncedTransactions) {
        try {
          const syncedTransaction =
            await this.mongoDBManager.addTransaction(transaction);
          await this.indexedDBManager.markTransactionAsSynced(transaction.id);
          console.log("Zsynchronizowano transakcję:", syncedTransaction);
        } catch (error) {
          console.error("Błąd synchronizacji transakcji:", transaction, error);
        }
      }

    } catch (error) {
      console.error("Błąd podczas synchronizacji:", error);
    }
  }
}

export default DataBaseManager;
