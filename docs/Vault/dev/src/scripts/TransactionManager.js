import DataBaseManager from "./DataBaseManager.js";

/**
 * Manages transactions within the application.
 * Handles operations such as creating, deleting, and synchronizing transactions,
 * as well as currency management based on the selected language.
 */
class TransactionManager {
  /**
   * Initializes a new instance of the TransactionManager class.
   * Sets up event listeners and loads initial transaction data.
   *
   * @constructor
   */
  constructor() {
    /**
     * Instance of DataBaseManager for handling database operations.
     * @type {DataBaseManager}
     */
    this.databaseManager = new DataBaseManager();

    /**
     * List of transactions managed by the application.
     * @type {Array<Object>}
     */
    this.transactions = [];

    /**
     * Current currency code based on the user's language preference.
     * @type {string}
     */
    this.currencyCode = "PLN";

    /**
     * Current currency symbol based on the user's language preference.
     * @type {string}
     */
    this.currencySymbol = "zł";

    /**
     * Current balance calculated based on transactions.
     * @type {number}
     */
    this.balance = 0;

    // Set currency based on the preferred language
    const preferredLanguage = localStorage.getItem("preferredLanguage") || "pl";
    this.updateCurrencyBasedOnLanguage(preferredLanguage);

    /**
     * Indicates whether the server is available for syncing transactions.
     * @type {boolean}
     */
    this.serverAvailable = this.databaseManager.serverAvailable;

    // Periodically check server availability
    this.startServerAvailabilityChecks();

    // Event listener for online state changes
    window.addEventListener("online", async () => {
      console.log(
        "Połączenie online przywrócone. Rozpoczynam synchronizację..."
      );
      await this.syncTransactions();
    });

    console.log("Czy aplikacja jest online?", navigator.onLine);

    // Event listener for language changes
    window.addEventListener("languageChange", () => {
      const preferredLanguage =
        localStorage.getItem("preferredLanguage") || "pl";
      this.updateCurrencyBasedOnLanguage(preferredLanguage);
      // Notify other components about the change
      window.dispatchEvent(new Event("transactionsUpdated"));
    });

    // Load initial transactions
    this.loadTransactions().catch((error) =>
      console.error("Błąd inicjalizacji transakcji:", error)
    );
  }

  /**
   * Starts periodic checks for server availability.
   */
  startServerAvailabilityChecks() {
    this.serverCheckInterval = setInterval(() => {
      if (this.serverAvailable !== this.databaseManager.serverAvailable) {
        this.serverAvailable = this.databaseManager.serverAvailable;
        if (this.serverAvailable) {
          console.log(
            "Serwer jest teraz dostępny. Rozpoczynam synchronizację..."
          );
          this.syncTransactions().catch((error) =>
            console.error("Błąd synchronizacji transakcji:", error)
          );
        }
      }
    }, 5000);
  }

  /**
   * Updates the currency code and symbol based on the selected language.
   * @param {string} language - The selected language (e.g., 'pl', 'en').
   */
  updateCurrencyBasedOnLanguage(language) {
    const currencies = {
      pl: { code: "PLN", symbol: "zł" },
      en: { code: "USD", symbol: "$" },
    };

    const currency = currencies[language] || currencies["pl"];
    this.currencyCode = currency.code;
    this.currencySymbol = currency.symbol;
  }

  /**
   * Loads transactions from the database into the application.
   * Dispatches the "transactionsLoaded" event when completed.
   * @async
   * @returns {Promise<void>}
   */
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
      this.transactions = [];
    }
  }

  /**
   * Creates a new transaction and saves it to the database.
   * Dispatches the "transactionAdded" event when completed.
   * @async
   * @param {string} name - The name of the transaction.
   * @param {number} amount - The amount of the transaction.
   * @param {string} category - The category of the transaction.
   * @returns {Promise<Object>} The created transaction object.
   */
  async createNewTransaction(name, amount, category) {
    const newTransaction = {
      id: Date.now().toString(),
      name,
      amount,
      category,
      currencyCode: this.currencyCode, 
      date: new Date().toISOString(),
    };

    try {
      const savedTransaction =
        await this.databaseManager.addTransaction(newTransaction);
      this.transactions.push(savedTransaction); 
      window.dispatchEvent(new Event("transactionAdded"));
      return savedTransaction;
    } catch (error) {
      console.error("Error creating new transaction:", error);
      throw error;
    }
  }

  /**
   * Deletes a transaction by its ID.
   * Dispatches the "transactionDeleted" event when completed.
   * @async
   * @param {string} id - The ID of the transaction to delete.
   * @returns {Promise<void>}
   */
  async deleteTransaction(id) {
    try {
      await this.databaseManager.deleteTransaction(id);
      this.transactions = this.transactions.filter((tx) => tx.id !== id);
      window.dispatchEvent(new Event("transactionDeleted"));
    } catch (error) {
      console.error("Error while deleting transaction:", error);
    }
  }

  /**
   * Deletes all transactions from the database.
   * Dispatches the "transactionsCleared" event when completed.
   * @async
   * @returns {Promise<void>}
   */
  async deleteAllTransactions() {
    try {
      await this.databaseManager.deleteAllTransactions();
      this.transactions = [];
      window.dispatchEvent(new Event("transactionsCleared"));
    } catch (error) {
      console.error("Błąd podczas usuwania wszystkich transakcji:", error);
    }
  }

  /**
   * Synchronizes unsynced transactions with the server.
   * Only runs if the server is available.
   * @async
   * @returns {Promise<void>}
   */
  async syncTransactions() {
    if (!this.databaseManager.serverAvailable) {
      console.log("Server unavailable. Skipping synchronization.");
      return;
    }

    const unsyncedTransactions =
      await this.databaseManager.getUnsyncedTransactions();
    for (const transaction of unsyncedTransactions) {
      try {
        const syncedTransaction =
          await this.databaseManager.mongoDBManager.addTransaction(transaction);
        await this.databaseManager.markTransactionAsSynced(
          syncedTransaction.id
        );
        console.log("Transaction synchronized:", syncedTransaction);
      } catch (error) {
        console.error("Error synchronizing transaction:", transaction, error);
      }
    }
    await this.loadTransactions();
  }

  /**
   * Calculates the current balance by summing all transaction amounts.
   * @returns {number} The current balance.
   */
  getCurrentBalance() {
    return this.transactions.reduce((acc, tx) => acc + tx.amount, 0);
  }
}

export default TransactionManager;
