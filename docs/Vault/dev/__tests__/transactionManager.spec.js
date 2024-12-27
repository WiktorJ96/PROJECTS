import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { JSDOM } from "jsdom";
import TransactionManager from "../src/scripts/TransactionManager.js";

// Initialize the DOM environment for testing
const { window } = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/",
});
global.window = window;
global.document = window.document;
global.localStorage = {
  getItem: jasmine.createSpy("getItem").and.returnValue("pl"),
  setItem: jasmine.createSpy("setItem"),
};
global.navigator = { onLine: true };
global.indexedDB = new IDBFactory();
global.IDBKeyRange = IDBKeyRange;

/**
 * Test suite for the TransactionManager class.
 * Contains unit tests for transaction creation, deletion, synchronization,
 * and other operations within the TransactionManager.
 *
 * @module TransactionManagerTests
 * @source TransactionManager.test.js
 */
describe("TransactionManager", () => {
  let transactionManager;
  let mockDataBaseManager;

  /**
   * Sets up the test environment before each test.
   * Initializes a mocked DataBaseManager and replaces the original instance in TransactionManager.
   *
   * @method beforeEach
   * @memberof module:TransactionManagerTests
   * @returns {void}
   * @source TransactionManager.test.js, line 22
   */
  beforeEach(async () => {
    // Create a mocked DataBaseManager with all necessary methods
    mockDataBaseManager = jasmine.createSpyObj("DataBaseManager", [
      "getTransactions",
      "addTransaction",
      "deleteTransaction",
      "deleteAllTransactions",
      "getUnsyncedTransactions",
      "markTransactionAsSynced",
    ]);

    // Set default return values for mocked methods
    mockDataBaseManager.getTransactions.and.returnValue(
      Promise.resolve([{ id: "1", name: "Test Transaction", amount: 100 }])
    );
    mockDataBaseManager.addTransaction.and.returnValue(
      Promise.resolve({ id: "2", name: "New Transaction", amount: 200 })
    );
    mockDataBaseManager.deleteTransaction.and.returnValue(Promise.resolve());
    mockDataBaseManager.deleteAllTransactions.and.returnValue(
      Promise.resolve()
    );
    mockDataBaseManager.getUnsyncedTransactions.and.returnValue(
      Promise.resolve([{ id: "3", name: "Unsynced", amount: 300 }])
    );
    mockDataBaseManager.markTransactionAsSynced.and.returnValue(
      Promise.resolve()
    );

    // Mock MongoDBManager within DataBaseManager
    mockDataBaseManager.serverAvailable = true;
    mockDataBaseManager.mongoDBManager = jasmine.createSpyObj(
      "mongoDBManager",
      ["addTransaction"]
    );
    mockDataBaseManager.mongoDBManager.addTransaction.and.returnValue(
      Promise.resolve({ id: "3", name: "Unsynced", amount: 300 })
    );

    spyOn(window, "dispatchEvent");

    // Initialize TransactionManager and replace its databaseManager with the mock
    transactionManager = new TransactionManager();
    transactionManager.databaseManager = mockDataBaseManager;

    // Load initial transactions
    await transactionManager.loadTransactions();
  });

  /**
   * Tests the `loadTransactions` method to ensure transactions are loaded and events dispatched.
   *
   * @method loadTransactions
   * @memberof module:TransactionManagerTests
   * @returns {void}
   * @source TransactionManager.test.js, line 55
   */
  describe("loadTransactions", () => {
    it("should load transactions and dispatch 'transactionsLoaded' event", () => {
      expect(mockDataBaseManager.getTransactions).toHaveBeenCalled();
      expect(transactionManager.transactions.length).toBe(1);
      expect(transactionManager.transactions[0].name).toBe("Test Transaction");
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        new Event("transactionsLoaded")
      );
    });
  });

  /**
   * Tests the `createNewTransaction` method to ensure a transaction is created and added.
   *
   * @method createNewTransaction
   * @memberof module:TransactionManagerTests
   * @returns {void}
   * @source TransactionManager.test.js, line 69
   */
  it("should create a new transaction and dispatch 'transactionAdded' event", async () => {
    const newTransaction = {
      id: "2",
      name: "New Transaction",
      amount: 200,
      category: "Test Category",
      currencyCode: "PLN",
      date: "2024-01-01T00:00:00.000Z",
    };

    mockDataBaseManager.addTransaction.and.returnValue(
      Promise.resolve(newTransaction)
    );

    const result = await transactionManager.createNewTransaction(
      newTransaction.name,
      newTransaction.amount,
      newTransaction.category
    );

    expect(transactionManager.transactions).toContain(result);
    expect(transactionManager.transactions.length).toBe(2);
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      new Event("transactionAdded")
    );
  });

  /**
   * Tests the `deleteTransaction` method to ensure a transaction is deleted.
   *
   * @method deleteTransaction
   * @memberof module:TransactionManagerTests
   * @returns {void}
   * @source TransactionManager.test.js, line 88
   */
  describe("deleteTransaction", () => {
    it("should delete a transaction by ID and dispatch 'transactionDeleted' event", async () => {
      await transactionManager.deleteTransaction("1");
      expect(mockDataBaseManager.deleteTransaction).toHaveBeenCalledWith("1");
      expect(transactionManager.transactions.length).toBe(0);
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        new Event("transactionDeleted")
      );
    });
  });

  /**
   * Tests the `deleteAllTransactions` method to ensure all transactions are cleared.
   *
   * @method deleteAllTransactions
   * @memberof module:TransactionManagerTests
   * @returns {void}
   * @source TransactionManager.test.js, line 98
   */
  describe("deleteAllTransactions", () => {
    it("should delete all transactions and dispatch 'transactionsCleared' event", async () => {
      await transactionManager.deleteAllTransactions();
      expect(mockDataBaseManager.deleteAllTransactions).toHaveBeenCalled();
      expect(transactionManager.transactions.length).toBe(0);
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        new Event("transactionsCleared")
      );
    });
  });

  /**
   * Tests the `syncTransactions` method to ensure unsynced transactions are synchronized.
   *
   * @method syncTransactions
   * @memberof module:TransactionManagerTests
   * @returns {void}
   * @source TransactionManager.test.js, line 109
   */
  describe("syncTransactions", () => {
    it("should synchronize unsynced transactions if the server is available", async () => {
      await transactionManager.syncTransactions();
      expect(mockDataBaseManager.getUnsyncedTransactions).toHaveBeenCalled();
      expect(
        mockDataBaseManager.mongoDBManager.addTransaction
      ).toHaveBeenCalledWith(
        jasmine.objectContaining({ name: "Unsynced", amount: 300 })
      );
      expect(mockDataBaseManager.markTransactionAsSynced).toHaveBeenCalledWith(
        "3"
      );
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        new Event("transactionsLoaded")
      );
    });

    it("should not synchronize if the server is unavailable", async () => {
      mockDataBaseManager.serverAvailable = false;
      await transactionManager.syncTransactions();
      expect(
        mockDataBaseManager.getUnsyncedTransactions
      ).not.toHaveBeenCalled();
    });
  });

  /**
   * Tests the `getCurrentBalance` method to calculate the total balance correctly.
   *
   * @method getCurrentBalance
   * @memberof module:TransactionManagerTests
   * @returns {void}
   * @source TransactionManager.test.js, line 132
   */
  describe("getCurrentBalance", () => {
    it("should calculate the total balance correctly", () => {
      transactionManager.transactions = [
        { id: "1", amount: 100 },
        { id: "2", amount: 200 },
        { id: "3", amount: -50 },
      ];
      const balance = transactionManager.getCurrentBalance();
      expect(balance).toBe(250);
    });
  });
});
