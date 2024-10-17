// TransactionManager.js
import DatabaseManager from "./DataBaseManager.js";

class TransactionManager {
  constructor() {
    this.databaseManager = new DatabaseManager();
    this.transactions = [];
    this.currencyCode = "USD";
    this.currencySymbol = "$";

    this.loadTransactions();
  }

  async loadTransactions() {
    try {
      this.transactions = await this.databaseManager.getTransactions();
      console.log("Transactions loaded:", this.transactions);
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
      const addedTransaction =
        await this.databaseManager.addTransaction(newTransaction);
      this.transactions.push(addedTransaction);
      window.dispatchEvent(new Event("transactionAdded"));
      return addedTransaction;
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  }

  async deleteTransaction(id) {
    try {
      await this.databaseManager.deleteTransaction(id);
      this.transactions = this.transactions.filter((tx) => tx.id !== id);
      window.dispatchEvent(new Event("transactionDeleted"));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  }

  async deleteAllTransactions() {
    try {
      await this.databaseManager.deleteAllTransactions();
      this.transactions = [];
      window.dispatchEvent(new Event("transactionsCleared"));
    } catch (error) {
      console.error("Error deleting all transactions:", error);
    }
  }

  getCurrentBalance() {
    return this.transactions.reduce((acc, tx) => acc + tx.amount, 0);
  }

  updateCurrencyBasedOnLanguage(lang) {
    if (lang === "pl") {
      this.currencyCode = "PLN";
      this.currencySymbol = "zł";
    } else {
      this.currencyCode = "USD";
      this.currencySymbol = "$";
    }
  }
}

export default TransactionManager;
