import axios from "axios";
import MongoDBManager from "../src/scripts/MongoDBManager.js";

/**
 * Test suite for the MongoDBManager class.
 * Ensures that the MongoDBManager methods behave correctly under various conditions.
 *
 * @module MongoDBManagerTests
 */
describe("MongoDBManager", () => {
  let mongoDBManager;

  /**
   * Resets mocks and initializes a new instance of MongoDBManager before each test.
   *
   * @method beforeEach
   * @memberof module:MongoDBManagerTests
   */
  beforeEach(() => {
    axios.get = jasmine.createSpy("get");
    axios.post = jasmine.createSpy("post");
    axios.delete = jasmine.createSpy("delete");

    mongoDBManager = new MongoDBManager();
  });

  /**
   * Test suite for the `getTransactions` method.
   *
   * @method getTransactions
   * @memberof module:MongoDBManagerTests
   */
  describe("getTransactions", () => {
    /**
     * Verifies that all transactions are fetched and fields are correctly mapped.
     *
     * @returns {Promise<void>}
     */
    it("should fetch all transactions and map fields correctly", async () => {
      const mockTransactions = [
        { _id: "1", amount: 100, date: "2023-12-01T00:00:00.000Z" },
        { _id: "2", amount: 200, date: "2023-12-02T00:00:00.000Z" },
      ];
      axios.get.and.returnValue(Promise.resolve({ data: mockTransactions }));

      const transactions = await mongoDBManager.getTransactions();

      expect(axios.get).toHaveBeenCalledWith("/api/transactions");
      expect(transactions).toEqual([
        jasmine.objectContaining({ id: "1", amount: 100, date: "2023-12-01" }),
        jasmine.objectContaining({ id: "2", amount: 200, date: "2023-12-02" }),
      ]);
    });

    /**
     * Verifies that an error is thrown if the fetch request fails.
     *
     * @returns {Promise<void>}
     */
    it("should throw an error if the fetch request fails", async () => {
      axios.get.and.returnValue(Promise.reject(new Error("Network error")));

      await expectAsync(mongoDBManager.getTransactions()).toBeRejectedWithError(
        "Network error"
      );
    });
  });

  /**
   * Test suite for the `addTransaction` method.
   *
   * @method addTransaction
   * @memberof module:MongoDBManagerTests
   */
  describe("addTransaction", () => {
    /**
     * Verifies that a transaction is added and `_id` is mapped to `id`.
     *
     * @returns {Promise<void>}
     */
    it("should add a transaction and map `_id` to `id`", async () => {
      const mockTransaction = { _id: "3", amount: 150 };
      axios.post.and.returnValue(Promise.resolve({ data: mockTransaction }));

      const transaction = await mongoDBManager.addTransaction({
        amount: 150,
      });

      expect(axios.post).toHaveBeenCalledWith("/api/transactions", {
        amount: 150,
      });
      expect(transaction).toEqual(
        jasmine.objectContaining({ id: "3", amount: 150 })
      );
    });

    /**
     * Verifies that an error is thrown if the POST request fails.
     *
     * @returns {Promise<void>}
     */
    it("should throw an error if the POST request fails", async () => {
      axios.post.and.returnValue(Promise.reject(new Error("Network error")));

      await expectAsync(
        mongoDBManager.addTransaction({ amount: 150 })
      ).toBeRejectedWithError("Network error");
    });
  });

  /**
   * Test suite for the `deleteTransaction` method.
   *
   * @method deleteTransaction
   * @memberof module:MongoDBManagerTests
   */
  describe("deleteTransaction", () => {
    /**
     * Verifies that a transaction is deleted by its ID.
     *
     * @returns {Promise<void>}
     */
    it("should delete a transaction by ID", async () => {
      axios.delete.and.returnValue(Promise.resolve());

      await mongoDBManager.deleteTransaction("1");

      expect(axios.delete).toHaveBeenCalledWith("/api/transactions/1");
    });

    /**
     * Verifies that an error is thrown if the DELETE request fails.
     *
     * @returns {Promise<void>}
     */
    it("should throw an error if the DELETE request fails", async () => {
      axios.delete.and.returnValue(Promise.reject(new Error("Network error")));

      await expectAsync(
        mongoDBManager.deleteTransaction("1")
      ).toBeRejectedWithError("Network error");

      expect(axios.delete).toHaveBeenCalledWith("/api/transactions/1");
    });
  });

  /**
   * Test suite for the `deleteAllTransactions` method.
   *
   * @method deleteAllTransactions
   * @memberof module:MongoDBManagerTests
   */
  describe("deleteAllTransactions", () => {
    /**
     * Verifies that all transactions are deleted in parallel.
     *
     * @returns {Promise<void>}
     */
    it("should delete all transactions in parallel", async () => {
      const mockTransactions = [
        { _id: "1", amount: 100 },
        { _id: "2", amount: 200 },
      ];

      axios.get.and.returnValue(Promise.resolve({ data: mockTransactions }));
      axios.delete.and.returnValue(Promise.resolve());

      await mongoDBManager.deleteAllTransactions();

      expect(axios.get).toHaveBeenCalledWith("/api/transactions");
      expect(axios.delete).toHaveBeenCalledWith("/api/transactions/1");
      expect(axios.delete).toHaveBeenCalledWith("/api/transactions/2");
    });

    /**
     * Verifies that an error is thrown if one of the delete operations fails.
     *
     * @returns {Promise<void>}
     */
    it("should throw an error if one of the delete operations fails", async () => {
      const mockTransactions = [
        { _id: "1", amount: 100 },
        { _id: "2", amount: 200 },
      ];

      axios.get.and.returnValue(Promise.resolve({ data: mockTransactions }));
      axios.delete
        .withArgs("/api/transactions/1")
        .and.returnValue(Promise.resolve());
      axios.delete
        .withArgs("/api/transactions/2")
        .and.returnValue(Promise.reject(new Error("Network error")));

      await expectAsync(
        mongoDBManager.deleteAllTransactions()
      ).toBeRejectedWithError("Network error");
    });
  });
});
