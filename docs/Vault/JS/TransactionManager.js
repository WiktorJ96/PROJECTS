// TransactionManager.js
import DatabaseManager from "./DataBaseManager.js";

class TransactionManager {
  constructor() {
    this.databaseManager = new DatabaseManager();
    this.transactions = [];
    this.currencyCode = "PLN";
    this.currencySymbol = "zł";

    this.loadTransactions();
    const preferredLanguage = localStorage.getItem("preferredLanguage") || "pl";
    this.updateCurrencyBasedOnLanguage(preferredLanguage);

    // Nasłuchiwanie zdarzenia online
    window.addEventListener("online", async () => {
      console.log(
        "Połączenie online przywrócone. Rozpoczynam synchronizację..."
      );
      await this.syncTransactions();
    });
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
      let transactions;
      console.log("Loading transactions...");

      if (navigator.onLine) {
        transactions = await this.databaseManager.getTransactions();
        console.log("Transactions loaded from database:", transactions);
      } else {
        transactions =
          await this.databaseManager.getTransactionsFromIndexedDB();
        console.log("Transactions loaded from IndexedDB:", transactions);
      }

      // Filtrujemy nowe transakcje, które jeszcze nie istnieją w liście
      const currentIds = this.transactions.map((tx) => tx.id);
      const newTransactions = transactions.filter(
        (tx) => !currentIds.includes(tx.id)
      );

      if (newTransactions.length > 0) {
        this.transactions.push(...newTransactions);
        console.log("New transactions added to local list:", newTransactions);
      }

      window.dispatchEvent(new Event("transactionsLoaded"));
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  }

  async createNewTransaction(name, amount, category) {
    const newTransaction = {
      name,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString().split("T")[0],
      currencyCode: this.currencyCode,
    };

    try {
      let addedTransaction;
      console.log("Creating new transaction:", newTransaction);

      if (navigator.onLine) {
        // Online: Zapis w bazie danych
        addedTransaction =
          await this.databaseManager.addTransaction(newTransaction);
        console.log("Transaction added to database:", addedTransaction);
      } else {
        // Offline: Zapis w IndexedDB
        addedTransaction = { ...newTransaction, id: Date.now() }; // Generujemy lokalne ID
        await this.databaseManager.addToIndexedDB(addedTransaction);
        console.log("Transaction saved in IndexedDB:", addedTransaction);
      }

      // Sprawdź, czy transakcja już istnieje w liście
      const exists = this.transactions.some(
        (tx) => tx.id === addedTransaction.id
      );
      if (!exists) {
        this.transactions.push(addedTransaction);
        console.log("Transaction added to local list:", addedTransaction);
      } else {
        console.log(
          "Transaction already exists in local list:",
          addedTransaction
        );
      }

      window.dispatchEvent(new Event("transactionAdded"));
      return addedTransaction;
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  }

  async deleteTransaction(id) {
    try {
      if (navigator.onLine) {
        // Online: Usuwanie z bazy danych
        await this.databaseManager.deleteTransaction(id);
      } else {
        // Offline: Usuwanie z IndexedDB
        await this.databaseManager.removeFromIndexedDB(id);
      }

      // Usunięcie transakcji z lokalnej listy
      this.transactions = this.transactions.filter((tx) => tx.id !== id);
      window.dispatchEvent(new Event("transactionDeleted"));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  }

  async deleteAllTransactions() {
    try {
      if (navigator.onLine) {
        // Online: Usuwanie z bazy danych
        await this.databaseManager.deleteAllTransactions();
      } else {
        // Offline: Usuwanie z IndexedDB
        await this.databaseManager.clearIndexedDB();
      }

      // Wyczyszczenie lokalnej listy
      this.transactions = [];
      window.dispatchEvent(new Event("transactionsCleared"));
    } catch (error) {
      console.error("Error deleting all transactions:", error);
    }
  }

  async syncTransactions() {
    if (!navigator.onLine) return; // Nie wykonuj synchronizacji, jeśli aplikacja jest offline

    try {
      const offlineTransactions =
        await this.databaseManager.getTransactionsFromIndexedDB();

      for (const transaction of offlineTransactions) {
        try {
          // Zapisz transakcję w bazie danych
          await this.databaseManager.addTransaction(transaction);
          console.log("Synchronized transaction:", transaction);
          await this.databaseManager.removeFromIndexedDB(transaction.id); // Usuń z IndexedDB po synchronizacji
        } catch (error) {
          console.error("Error synchronizing transaction:", transaction, error);
        }
      }

      // Odśwież listę transakcji po synchronizacji
      await this.loadTransactions();
    } catch (error) {
      console.error("Error during synchronization:", error);
    }
  }

  getCurrentBalance() {
    return this.transactions.reduce((acc, tx) => acc + tx.amount, 0);
  }
}

export default TransactionManager;
