import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import DataBaseManager from "../src/scripts/DataBaseManager.js";
import MongoDBManager from "../src/scripts/MongoDBManager.js";
import IndexedDBManager from "../src/scripts/IndexedDBManager.js";

/**
 * Test suite for the DataBaseManager class.
 * Validates database operations, including fallback mechanisms between MongoDB and IndexedDB.
 *
 * @module DataBaseManagerTests
 */
describe("DataBaseManager", () => {
  let dataBaseManager, mockMongoDBManager, mockIndexedDBManager;

  /**
   * Sets up the global indexedDB mock before all tests.
   *
   * @method beforeAll
   * @memberof module:DataBaseManagerTests
   * @returns {void}
   */
  beforeAll(() => {
    global.indexedDB = new IDBFactory();
    global.IDBKeyRange = IDBKeyRange;
  });

  /**
   * Resets mocks and initializes the DataBaseManager instance before each test.
   *
   * @method beforeEach
   * @memberof module:DataBaseManagerTests
   * @returns {void}
   */
  beforeEach(() => {
    mockMongoDBManager = jasmine.createSpyObj("MongoDBManager", [
      "getTransactions",
      "addTransaction",
      "deleteTransaction",
      "deleteAllTransactions",
    ]);

    mockIndexedDBManager = jasmine.createSpyObj("IndexedDBManager", [
      "getTransactions",
      "addTransaction",
      "deleteTransaction",
      "deleteAllTransactions",
      "getUnsyncedTransactions",
      "markTransactionAsSynced",
    ]);

    spyOn(MongoDBManager.prototype, "constructor").and.returnValue(
      mockMongoDBManager
    );
    spyOn(IndexedDBManager.prototype, "constructor").and.returnValue(
      mockIndexedDBManager
    );

    dataBaseManager = new DataBaseManager();
    dataBaseManager.mongoDBManager = mockMongoDBManager;
    dataBaseManager.indexedDBManager = mockIndexedDBManager;
  });

  /**
   * Cleans up the global indexedDB mock after all tests.
   *
   * @method afterAll
   * @memberof module:DataBaseManagerTests
   * @returns {void}
   */
  afterAll(() => {
    delete global.indexedDB;
    delete global.IDBKeyRange;
  });

  /**
   * Validates that the `serverAvailable` flag is initialized as true.
   *
   * @method initializeServerAvailability
   * @memberof module:DataBaseManagerTests
   * @returns {void}
   */
  it("should initialize with serverAvailable as true", () => {
    expect(dataBaseManager.serverAvailable).toBeTrue();
  });

  /**
   * Test suite for the `getTransactions` method.
   *
   * @method getTransactions
   * @memberof module:DataBaseManagerTests
   */
  describe("getTransactions", () => {
    /**
     * Validates retrieval of transactions from MongoDB when the server is available.
     *
     * @returns {void}
     */
    it("should retrieve transactions from MongoDB if the server is available", async () => {
      mockMongoDBManager.getTransactions.and.resolveTo([
        { id: 1, amount: 100 },
      ]);

      const transactions = await dataBaseManager.getTransactions();
      expect(transactions).toEqual([{ id: 1, amount: 100 }]);
      expect(mockMongoDBManager.getTransactions).toHaveBeenCalled();
    });

    /**
     * Validates fallback to IndexedDB when MongoDB retrieval fails.
     *
     * @returns {void}
     */
    it("should fallback to IndexedDB if MongoDB retrieval fails", async () => {
      mockMongoDBManager.getTransactions.and.throwError("MongoDB error");
      mockIndexedDBManager.getTransactions.and.resolveTo([
        { id: 2, amount: 200 },
      ]);

      const transactions = await dataBaseManager.getTransactions();
      expect(transactions).toEqual([{ id: 2, amount: 200 }]);
      expect(mockIndexedDBManager.getTransactions).toHaveBeenCalled();
    });

    /**
     * Validates retrieval of transactions from IndexedDB when the server is unavailable.
     *
     * @returns {void}
     */
    it("should retrieve transactions from IndexedDB if the server is unavailable", async () => {
      dataBaseManager.serverAvailable = false;
      mockIndexedDBManager.getTransactions.and.resolveTo([
        { id: 3, amount: 300 },
      ]);

      const transactions = await dataBaseManager.getTransactions();
      expect(transactions).toEqual([{ id: 3, amount: 300 }]);
      expect(mockIndexedDBManager.getTransactions).toHaveBeenCalled();
    });
  });

  /**
   * Test suite for the `addTransaction` method.
   *
   * @method addTransaction
   * @memberof module:DataBaseManagerTests
   */
  describe("addTransaction", () => {
    /**
     * Validates adding a transaction to MongoDB when the server is available.
     *
     * @returns {void}
     */
    it("should add transaction to MongoDB if the server is available", async () => {
      mockMongoDBManager.addTransaction.and.resolveTo({ id: 1, amount: 100 });

      const transaction = await dataBaseManager.addTransaction({ amount: 100 });
      expect(transaction).toEqual({ id: 1, amount: 100 });
      expect(mockMongoDBManager.addTransaction).toHaveBeenCalledWith({
        amount: 100,
      });
    });

    /**
     * Validates fallback to IndexedDB when adding to MongoDB fails.
     *
     * @returns {void}
     */
    it("should fallback to IndexedDB if adding to MongoDB fails", async () => {
      mockMongoDBManager.addTransaction.and.throwError("MongoDB error");
      mockIndexedDBManager.addTransaction.and.resolveTo({ id: 2, amount: 200 });

      const transaction = await dataBaseManager.addTransaction({ amount: 200 });
      expect(transaction).toEqual({ id: 2, amount: 200 });
      expect(mockIndexedDBManager.addTransaction).toHaveBeenCalledWith({
        amount: 200,
      });
    });

    /**
     * Validates adding a transaction to IndexedDB when the server is unavailable.
     *
     * @returns {void}
     */
    it("should add transaction to IndexedDB if the server is unavailable", async () => {
      dataBaseManager.serverAvailable = false;
      mockIndexedDBManager.addTransaction.and.resolveTo({ id: 3, amount: 300 });

      const transaction = await dataBaseManager.addTransaction({ amount: 300 });
      expect(transaction).toEqual({ id: 3, amount: 300 });
      expect(mockIndexedDBManager.addTransaction).toHaveBeenCalledWith({
        amount: 300,
      });
    });
  });

  /**
   * Test suite for the `deleteTransaction` method.
   *
   * @method deleteTransaction
   * @memberof module:DataBaseManagerTests
   */
  describe("deleteTransaction", () => {
    /**
     * Validates deletion of a transaction from MongoDB when the server is available.
     *
     * @returns {void}
     */
    it("should delete transaction from MongoDB if the server is available", async () => {
      mockMongoDBManager.deleteTransaction.and.resolveTo();

      await dataBaseManager.deleteTransaction("1");
      expect(mockMongoDBManager.deleteTransaction).toHaveBeenCalledWith("1");
    });

    /**
     * Validates fallback to IndexedDB when deleting from MongoDB fails.
     *
     * @returns {void}
     */
    it("should fallback to IndexedDB if deleting from MongoDB fails", async () => {
      mockMongoDBManager.deleteTransaction.and.throwError("MongoDB error");
      mockIndexedDBManager.deleteTransaction.and.resolveTo();

      await dataBaseManager.deleteTransaction("2");
      expect(mockIndexedDBManager.deleteTransaction).toHaveBeenCalledWith("2");
    });

    /**
     * Validates deletion of a transaction from IndexedDB when the server is unavailable.
     *
     * @returns {void}
     */
    it("should delete transaction from IndexedDB if the server is unavailable", async () => {
      dataBaseManager.serverAvailable = false;
      mockIndexedDBManager.deleteTransaction.and.resolveTo();

      await dataBaseManager.deleteTransaction("3");
      expect(mockIndexedDBManager.deleteTransaction).toHaveBeenCalledWith("3");
    });
  });

  /**
   * Test suite for the `syncTransactions` method.
   *
   * @method syncTransactions
   * @memberof module:DataBaseManagerTests
   */
  describe("syncTransactions", () => {
    /**
     * Validates synchronization of unsynced transactions from IndexedDB to MongoDB.
     *
     * @returns {void}
     */
    it("should synchronize transactions from IndexedDB to MongoDB", async () => {
      const unsyncedTransactions = [
        { id: "1", amount: 100 },
        { id: "2", amount: 200 },
      ];
      mockIndexedDBManager.getUnsyncedTransactions.and.resolveTo(
        unsyncedTransactions
      );
      mockMongoDBManager.addTransaction.and.resolveTo();
      mockIndexedDBManager.markTransactionAsSynced.and.resolveTo();

      await dataBaseManager.syncTransactions();

      expect(mockIndexedDBManager.getUnsyncedTransactions).toHaveBeenCalled();
      for (const transaction of unsyncedTransactions) {
        expect(mockMongoDBManager.addTransaction).toHaveBeenCalledWith(
          transaction
        );
        expect(
          mockIndexedDBManager.markTransactionAsSynced
        ).toHaveBeenCalledWith(transaction.id);
      }
    });

    /**
     * Validates that synchronization is not attempted when the server is unavailable.
     *
     * @returns {void}
     */
    it("should not attempt synchronization if the server is unavailable", async () => {
      dataBaseManager.serverAvailable = false;

      await dataBaseManager.syncTransactions();

      expect(
        mockIndexedDBManager.getUnsyncedTransactions
      ).not.toHaveBeenCalled();
      expect(mockMongoDBManager.addTransaction).not.toHaveBeenCalled();
    });
  });
});
