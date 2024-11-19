// DatabaseManager.js
import { isRunningInBrowser } from "./isRunningInBrowser.js";
import IndexedDBManager from "./IndexedDBManager.js";
import MongoDBManager from "./MongoDBManager.js";

class DatabaseManager {
  constructor() {
    if (isRunningInBrowser()) {
      this.db = new IndexedDBManager();
    } else {
      this.db = new MongoDBManager();
    }
  }

  async getTransactions() {
    return await this.db.getTransactions();
  }

  async addTransaction(transaction) {
    return await this.db.addTransaction(transaction);
  }

  async deleteTransaction(id) {
    return await this.db.deleteTransaction(id);
  }

  async deleteAllTransactions() {
    return await this.db.deleteAllTransactions();
  }
}

export default DatabaseManager;
