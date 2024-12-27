// import axios from "axios";
/**
 * Manages MongoDB operations for transaction management.
 * Provides methods for CRUD operations and batch processing of transactions.
 */
class MongoDBManager {
  /**
   * Creates an instance of MongoDBManager.
   * Initializes the base API URL for MongoDB requests.
   *
   * @constructor
   */
  constructor() {
    /**
     * Base API URL for MongoDB requests.
     * @type {string}
     */
    this.apiUrl = "";
  }

  /**
   * Fetches all transactions from the MongoDB API.
   * Converts transaction dates to a formatted string and maps MongoDB `_id` to `id`.
   *
   * @async
   * @returns {Promise<Array>} An array of transaction objects.
   * @throws Will throw an error if the fetch request fails.
   */
  async getTransactions() {
    try {
      const response = await axios.get(`/api/transactions`);
      const transactions = response.data.map((tx) => {
        let dateObj = new Date(tx.date);

        if (isNaN(dateObj.getTime())) {
          console.warn("Invalid or missing date:", tx.date);
          dateObj = new Date();
        }

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

  /**
   * Adds a new transaction to MongoDB.
   * Maps MongoDB `_id` to `id` in the response.
   *
   * @async
   * @param {Object} transaction - The transaction object to be added.
   * @returns {Promise<Object>} The added transaction object with mapped `id`.
   * @throws Will throw an error if the POST request fails.
   */
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

  /**
   * Deletes a specific transaction from MongoDB by its ID.
   *
   * @async
   * @param {string} id - The ID of the transaction to delete.
   * @returns {Promise<void>}
   * @throws Will throw an error if the DELETE request fails.
   */
  async deleteTransaction(id) {
    try {
      await axios.delete(`/api/transactions/${id}`);
    } catch (error) {
      console.error("Error while deleting transaction from MongoDB:", error);
      throw error;
    }
  }

  /**
   * Deletes all transactions from MongoDB.
   * Fetches all transactions and deletes them in parallel.
   *
   * @async
   * @returns {Promise<void>}
   * @throws Will throw an error if any of the delete operations fail.
   */
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
