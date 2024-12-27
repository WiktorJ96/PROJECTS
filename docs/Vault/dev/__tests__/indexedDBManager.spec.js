import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import IndexedDBManager from "../src/scripts/IndexedDBManager.js";
/**
 * Test suite for the IndexedDBManager class.
 * Validates IndexedDB operations, including CRUD operations and synchronization handling.
 *
 * @module IndexedDBManagerTests
 */
describe("IndexedDBManager", () => {
  let indexedDBManager;

  /**
   * Sets up the global indexedDB mock before all tests.
   *
   * @method beforeAll
   * @memberof module:IndexedDBManagerTests
   * @returns {void}
   */
  beforeAll(() => {
    global.indexedDB = new IDBFactory();
    global.IDBKeyRange = IDBKeyRange;
  });

  /**
   * Initializes a new instance of IndexedDBManager and clears all transactions before each test.
   *
   * @method beforeEach
   * @memberof module:IndexedDBManagerTests
   * @returns {void}
   */
  beforeEach(async () => {
    indexedDBManager = new IndexedDBManager();
    await indexedDBManager.deleteAllTransactions();
  });

  /**
   * Cleans up the global indexedDB mock after all tests.
   *
   * @method afterAll
   * @memberof module:IndexedDBManagerTests
   * @returns {void}
   */
  afterAll(() => {
    delete global.indexedDB;
    delete global.IDBKeyRange;
  });

  /**
   * Validates that the IndexedDBManager initializes correctly.
   *
   * @method initializeDatabase
   * @memberof module:IndexedDBManagerTests
   * @returns {void}
   */
  it("should initialize the IndexedDBManager and setup database", async () => {
    const db = await indexedDBManager.getDB();
    expect(db.name).toBe("transactionsDB");
    expect(db.version).toBe(1);
  });

  /**
   * Test suite for the `addTransaction` method.
   *
   * @method addTransaction
   * @memberof module:IndexedDBManagerTests
   */
  describe("addTransaction", () => {
    /**
     * Validates adding a transaction to the database.
     *
     * @returns {void}
     */
    it("should add a transaction to the database", async () => {
      const transaction = { amount: 100, isSynced: false };
      const addedTransaction =
        await indexedDBManager.addTransaction(transaction);

      expect(addedTransaction).toEqual(
        jasmine.objectContaining({ amount: 100, isSynced: false })
      );

      const transactions = await indexedDBManager.getTransactions();
      expect(transactions).toEqual([addedTransaction]);
    });
  });

  /**
   * Test suite for the `getTransactions` method.
   *
   * @method getTransactions
   * @memberof module:IndexedDBManagerTests
   */
  describe("getTransactions", () => {
    /**
     * Validates retrieving all transactions from the database.
     *
     * @returns {void}
     */
    it("should retrieve all transactions from the database", async () => {
      await indexedDBManager.addTransaction({ amount: 100, isSynced: false });
      await indexedDBManager.addTransaction({ amount: 200, isSynced: true });

      const transactions = await indexedDBManager.getTransactions();
      expect(transactions.length).toBe(2);
      expect(transactions).toEqual(
        jasmine.arrayContaining([
          jasmine.objectContaining({ amount: 100 }),
          jasmine.objectContaining({ amount: 200 }),
        ])
      );
    });
  });

  /**
   * Test suite for the `getUnsyncedTransactions` method.
   *
   * @method getUnsyncedTransactions
   * @memberof module:IndexedDBManagerTests
   */
  describe("getUnsyncedTransactions", () => {
    /**
     * Validates retrieving unsynchronized transactions from the database.
     *
     * @returns {void}
     */
    it("should retrieve unsynchronized transactions", async () => {
      await indexedDBManager.addTransaction({ amount: 100, isSynced: false });
      await indexedDBManager.addTransaction({ amount: 200, isSynced: true });

      const transactions = await indexedDBManager.getTransactions();
      console.log("All transactions in DB:", transactions);

      const unsyncedTransactions =
        await indexedDBManager.getUnsyncedTransactions();
      console.log("Unsynced transactions:", unsyncedTransactions);

      expect(unsyncedTransactions.length).toBe(1);
      expect(unsyncedTransactions[0]).toEqual(
        jasmine.objectContaining({ amount: 100, isSynced: false })
      );
    });
  });

  /**
   * Test suite for the `markTransactionAsSynced` method.
   *
   * @method markTransactionAsSynced
   * @memberof module:IndexedDBManagerTests
   */
  describe("markTransactionAsSynced", () => {
    /**
     * Validates marking a transaction as synchronized.
     *
     * @returns {void}
     */
    it("should mark a transaction as synchronized", async () => {
      const transaction = await indexedDBManager.addTransaction({
        amount: 100,
        isSynced: false,
      });

      await indexedDBManager.markTransactionAsSynced(transaction.id);

      const transactions = await indexedDBManager.getTransactions();
      expect(transactions[0].isSynced).toBeTrue();
    });
  });

  /**
   * Test suite for the `deleteTransaction` method.
   *
   * @method deleteTransaction
   * @memberof module:IndexedDBManagerTests
   */
  describe("deleteTransaction", () => {
    /**
     * Validates deleting a transaction from the database.
     *
     * @returns {void}
     */
    it("should delete a transaction from the database", async () => {
      const transaction = await indexedDBManager.addTransaction({
        amount: 100,
        isSynced: false,
      });

      await indexedDBManager.deleteTransaction(transaction.id);

      const transactions = await indexedDBManager.getTransactions();
      expect(transactions.length).toBe(0);
    });
  });

  /**
   * Test suite for the `deleteAllTransactions` method.
   *
   * @method deleteAllTransactions
   * @memberof module:IndexedDBManagerTests
   */
  describe("deleteAllTransactions", () => {
    /**
     * Validates deleting all transactions from the database.
     *
     * @returns {void}
     */
    it("should delete all transactions from the database", async () => {
      await indexedDBManager.addTransaction({ amount: 100, isSynced: false });
      await indexedDBManager.addTransaction({ amount: 200, isSynced: true });

      await indexedDBManager.deleteAllTransactions();

      const transactions = await indexedDBManager.getTransactions();
      expect(transactions.length).toBe(0);
    });
  });
});
