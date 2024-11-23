// TransactionManager.js
import DataBaseManager from "./DataBaseManager.js";

class TransactionManager {
  constructor() {
    this.databaseManager = new DataBaseManager();
    this.transactions = [];
    this.currencyCode = "PLN";
    this.currencySymbol = "zł";

    const preferredLanguage = localStorage.getItem("preferredLanguage") || "pl";
    this.updateCurrencyBasedOnLanguage(preferredLanguage);

    // Nasłuchiwanie zmian w dostępności serwera
    this.serverAvailable = this.databaseManager.serverAvailable;
    setInterval(() => {
      if (this.serverAvailable !== this.databaseManager.serverAvailable) {
        this.serverAvailable = this.databaseManager.serverAvailable;
        if (this.serverAvailable) {
          console.log(
            "Serwer jest teraz dostępny. Rozpoczynam synchronizację..."
          );
          this.syncTransactions();
        }
      }
    }, 1000); // Sprawdzanie co 1 sekundę

    // Nasłuchiwanie zdarzenia online
    window.addEventListener("online", async () => {
      console.log(
        "Połączenie online przywrócone. Rozpoczynam synchronizację..."
      );
      await this.syncTransactions();
    });
    console.log("Czy aplikacja jest online?", navigator.onLine);

    // Nasłuchiwanie na zmianę języka
    window.addEventListener("languageChange", () => {
      const preferredLanguage =
        localStorage.getItem("preferredLanguage") || "pl";
      this.updateCurrencyBasedOnLanguage(preferredLanguage);
      // Opcjonalnie: odśwież widok transakcji
      window.dispatchEvent(new Event("transactionsUpdated"));
    });

    // Załaduj transakcje po skonfigurowaniu
    this.loadTransactions();
  }

  updateCurrencyBasedOnLanguage(language) {
    const currencies = {
      pl: { code: "PLN", symbol: "zł" },
      en: { code: "USD", symbol: "$" },
    };

    const currency = currencies[language] || currencies["pl"];
    this.currencyCode = currency.code;
    this.currencySymbol = currency.symbol;
  }

  async loadTransactions() {
    try {
      console.log("Rozpoczynam ładowanie transakcji...");
      const transactions = await this.databaseManager.getTransactions();
      console.log("Pobrane transakcje z IndexedDB:", transactions);
      this.transactions = transactions;
      console.log("Załadowane transakcje:", this.transactions);
      window.dispatchEvent(new Event("transactionsLoaded"));
    } catch (error) {
      console.error("Błąd podczas ładowania transakcji:", error);
    }
  }

  async createNewTransaction(name, amount, category) {
    const newTransaction = {
      name,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString().split("T")[0],
      currencyCode: this.currencyCode, // Dodajemy currencyCode
    };

    try {
      const addedTransaction =
        await this.databaseManager.addTransaction(newTransaction);
      this.transactions.push(addedTransaction);
      window.dispatchEvent(new Event("transactionAdded"));
      return addedTransaction;
    } catch (error) {
      console.error("Błąd podczas tworzenia transakcji:", error);
      throw error;
    }
  }

  async deleteTransaction(id) {
    try {
      await this.databaseManager.deleteTransaction(id);
      // IDs are strings, so comparison works correctly
      this.transactions = this.transactions.filter((tx) => tx.id !== id);
      window.dispatchEvent(new Event("transactionDeleted"));
    } catch (error) {
      console.error("Error while deleting transaction:", error);
    }
  }

  async deleteAllTransactions() {
    try {
      await this.databaseManager.deleteAllTransactions();
      this.transactions = [];
      window.dispatchEvent(new Event("transactionsCleared"));
    } catch (error) {
      console.error("Błąd podczas usuwania wszystkich transakcji:", error);
    }
  }

  async syncTransactions() {
    if (!this.serverAvailable) return;

    try {
      const unsyncedTransactions =
        await this.databaseManager.getUnsyncedTransactions();
      for (const transaction of unsyncedTransactions) {
        try {
          const syncedTransaction =
            await this.databaseManager.mongoDBManager.addTransaction(
              transaction
            );
          await this.databaseManager.markTransactionAsSynced(transaction.id);
          console.log("Zsynchronizowano transakcję:", syncedTransaction);
        } catch (error) {
          console.error("Błąd synchronizacji transakcji:", transaction, error);
        }
      }

      // Odśwież listę transakcji
      await this.loadTransactions();
    } catch (error) {
      console.error("Błąd podczas synchronizacji:", error);
    }
  }

  getCurrentBalance() {
    return this.transactions.reduce((acc, tx) => acc + tx.amount, 0);
  }
}

export default TransactionManager;
