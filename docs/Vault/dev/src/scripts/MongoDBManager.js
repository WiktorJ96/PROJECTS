
class MongoDBManager {
  constructor() {
    this.apiUrl = "";
  }

  async getTransactions() {
    try {
      const response = await axios.get(`/api/transactions`);
      const transactions = response.data.map((tx) => {
        const dateObj = new Date(tx.date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;

        return {
          ...tx,
          id: tx._id,
          date: formattedDate,
        };
      });
      return transactions;
    } catch (error) {
      console.error("Error fetching transactions from MongoDB:", error);
      throw error;
    }
  }

  async addTransaction(transaction) {
    try {
      const response = await axios.post(`/api/transactions`, transaction);
      const addedTransaction = response.data;
      return { ...addedTransaction, id: addedTransaction._id };
    } catch (error) {
      console.error("Błąd podczas dodawania transakcji do MongoDB:", error);
      throw error;
    }
  }

  async deleteTransaction(id) {
    try {
      await axios.delete(`/api/transactions/${id}`);
    } catch (error) {
      console.error("Error while deleting transaction from MongoDB:", error);
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
