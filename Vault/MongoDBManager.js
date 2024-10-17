

class MongoDBManager {
  constructor() {
    this.apiBaseUrl = process.env.API_BASE_URL || "http://localhost:3000";
  }

  async getTransactions() {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/api/transactions`);
      const transactions = response.data;
      // Mapowanie _id na id dla spójności z IndexedDB
      return transactions.map((tx) => ({ ...tx, id: tx._id }));
    } catch (error) {
      console.error("Error fetching transactions from MongoDB:", error);
      throw error;
    }
  }

  async addTransaction(transaction) {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/api/transactions`,
        transaction
      );
      const addedTransaction = response.data;
      // Mapowanie _id na id
      return { ...addedTransaction, id: addedTransaction._id };
    } catch (error) {
      console.error("Error adding transaction to MongoDB:", error);
      throw error;
    }
  }

  async deleteTransaction(id) {
    try {
      await axios.delete(`${this.apiBaseUrl}/api/transactions/${id}`);
    } catch (error) {
      console.error("Error deleting transaction from MongoDB:", error);
      throw error;
    }
  }

  async deleteAllTransactions() {
    try {
      const transactions = await this.getTransactions();
      const deletePromises = transactions.map((tx) =>
        this.deleteTransaction(tx.id)
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error deleting all transactions from MongoDB:", error);
      throw error;
    }
  }
}

export default MongoDBManager;
