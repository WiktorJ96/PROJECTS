
class MongoDBManager {
  constructor() {
    // Bezpośrednie ustawienie adresu URL serwera API
    this.mongoUrl = "http://localhost:3000";
  }

  async getTransactions() {
    try {
      const response = await axios.get(`${this.mongoUrl}/api/transactions`);
      const transactions = response.data.map((tx) => ({
        ...tx,
        id: tx._id,
      }));
      return transactions;
    } catch (error) {
      console.error("Błąd podczas pobierania transakcji z MongoDB:", error);
      throw error;
    }
  }

  async addTransaction(transaction) {
    try {
      const response = await axios.post(
        `${this.mongoUrl}/api/transactions`,
        transaction
      );
      const addedTransaction = response.data;
      return { ...addedTransaction, id: addedTransaction._id };
    } catch (error) {
      console.error("Błąd podczas dodawania transakcji do MongoDB:", error);
      throw error;
    }
  }

  async deleteTransaction(id) {
    try {
      await axios.delete(`${this.mongoUrl}/api/transactions/${id}`);
    } catch (error) {
      console.error("Błąd podczas usuwania transakcji z MongoDB:", error);
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
      console.error(
        "Błąd podczas usuwania wszystkich transakcji z MongoDB:",
        error
      );
      throw error;
    }
  }
}

export default MongoDBManager;
