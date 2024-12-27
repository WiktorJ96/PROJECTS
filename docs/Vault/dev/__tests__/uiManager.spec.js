import { JSDOM } from "jsdom";
import "fake-indexeddb/auto";
import axios from "axios";
import UIManager from "../src/scripts/UIManager.js";
import TransactionManager from "../src/scripts/TransactionManager.js";
import ChartManager from "../src/scripts/ChartManager.js";

/**
 * Mock Bootstrapa z getInstance
 */
global.bootstrap = {
  Modal: class {
    constructor(element) {
      this._element = element;
    }
    static getInstance(element) {
      return new this(element);
    }
    show() {}
    hide() {}
  },
};

/**
 * Mock localStorage
 */
global.localStorage = {
  getItem: jasmine.createSpy("getItem").and.callFake((key) => {
    if (key === "preferredLanguage") {
      return "pl"; // Domyślna wartość, zmień według potrzeb
    }
    return null;
  }),
  setItem: jasmine.createSpy("setItem"),
};

/**
 * Przygotowanie wirtualnego DOM (JSDOM) z identycznymi ID jak w kodzie UIManager
 */
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
  <body>
    <div id="income-area"></div>
    <div id="expenses-area"></div>
    <div id="available-money"></div>
    <div id="addTransactionModal"></div>
    <div id="confirmationModal"></div>
    <div id="deleteTransactionModal"></div>

    <button id="add-transaction"></button>
    <button id="saveTransaction"></button>
    <button id="delete-all"></button>
    <select id="transaction-type">
      <option value="income" selected>Income</option>
      <option value="expense">Expense</option>
    </select>

    <div class="mb-3">
      <select id="income-category">
        <option>Salary</option>
        <option>Bonus</option>
      </select>
    </div>
    <div class="mb-3">
      <select id="expense-category">
        <option>Food</option>
        <option>Shopping</option>
      </select>
    </div>

    <button id="confirmDelete"></button>
    <button id="cancelDelete"></button>
    <button id="confirmDeleteTransaction"></button>
    <button id="cancelDeleteTransaction"></button>

    <input id="name" />
    <input id="amount" />

    <button id="light-mode"></button>
    <button id="dark-mode"></button>

    <span id="income-tab">Income</span>
    <span id="expenses-tab">Expenses</span>

    <canvas id="chart"></canvas>
    <canvas id="balanceChart"></canvas>
  </body>
</html>
`);

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

/**
 * Mockowanie Canvas
 */
if (!global.HTMLCanvasElement) {
  global.HTMLCanvasElement = class {
    getContext() {
      return {
        clearRect: jasmine.createSpy("clearRect"),
        fillText: jasmine.createSpy("fillText"),
        createLinearGradient: jasmine
          .createSpy("createLinearGradient")
          .and.returnValue({
            addColorStop: jasmine.createSpy("addColorStop"),
          }),
      };
    }
  };
}

/**
 * Mockowanie Chart.js
 */
global.Chart = class {
  constructor(ctx, config) {
    this.ctx = ctx;
    this.config = config;
    this.options = {};
    this.data = { labels: [], datasets: [] };
    this.update = jasmine.createSpy("update");
  }
};

/**
 * Mockowanie Axios
 */
beforeEach(() => {
  axios.get = jasmine.createSpy("get").and.returnValue(
    Promise.resolve({
      data: [
        {
          _id: "1",
          name: "Test Transaction",
          amount: 100,
          category: "Salary",
          date: "2023-12-22T00:00:00Z",
        },
      ],
    })
  );
  axios.post = jasmine.createSpy("post").and.returnValue(
    Promise.resolve({
      data: {
        _id: "2",
        name: "New Transaction",
        amount: 200,
        category: "Bonus",
        date: "2023-12-22T00:00:00Z",
      },
    })
  );
  axios.delete = jasmine.createSpy("delete").and.returnValue(Promise.resolve());
});

/**
 * Test suite for the UIManager class.
 * Ensures proper functionality of UI interactions, modals, and integration with TransactionManager & ChartManager.
 *
 * @module UIManagerTests
 */
describe("UIManager", () => {
  let uiManager;
  let mockTransactionManager;
  let mockChartManager;

  /**
   * Sets up a new instance of UIManager, TransactionManager, and ChartManager before each test.
   *
   * @method beforeEach
   * @memberof module:UIManagerTests
   * @returns {void}
   */
  beforeEach(() => {
    // Inicjalizacja menedżerów
    mockTransactionManager = new TransactionManager();
    mockChartManager = new ChartManager(mockTransactionManager);

    // Zastąpienie realnych metod, by testy nie wykonywały prawdziwych operacji
    spyOn(mockTransactionManager, "createNewTransaction").and.callFake(() =>
      Promise.resolve()
    );
    spyOn(mockTransactionManager, "deleteTransaction").and.callFake(() =>
      Promise.resolve()
    );
    spyOn(mockTransactionManager, "deleteAllTransactions").and.callFake(() =>
      Promise.resolve()
    );
    spyOn(mockTransactionManager, "getCurrentBalance").and.returnValue(1000);
    spyOn(mockChartManager, "updateChart").and.callThrough();

    // Tworzymy UIManager
    uiManager = new UIManager(mockTransactionManager, mockChartManager);
  });

  /**
   * Verifies that UIManager initializes the default language from localStorage.
   *
   * @method initializeDefaultLanguage
   * @memberof module:UIManagerTests
   * @returns {void}
   */
  it("should initialize UIManager with the default language", () => {
    // Według mocka localStorage, preferowany jest "pl"
    expect(uiManager.language).toBe("pl");
  });

  /**
   * Tests showing the add-transaction panel.
   * Ensures that showPanel can be called without errors and triggers any related UI updates.
   *
   * @method showTransactionPanel
   * @memberof module:UIManagerTests
   * @returns {void}
   */
  it("should show the add transaction panel", () => {
    spyOn(uiManager, "showPanel").and.callThrough();
    uiManager.showPanel();
    expect(uiManager.showPanel).toHaveBeenCalled();
  });

  /**
   * Tests saving a new transaction by setting form inputs and invoking saveTransaction.
   * Confirms that the TransactionManager is called with correct arguments.
   *
   * @method saveTransaction
   * @memberof module:UIManagerTests
   * @returns {Promise<void>}
   */
  it("should save a new transaction", async () => {
    // Ustawiamy wartości w polach formularza
    uiManager.nameInput.value = "Test Transaction";
    uiManager.amountInput.value = "100";
    uiManager.transactionTypeSelect.value = "income";
    uiManager.incomeCategorySelect.selectedIndex = 0; // Salary

    await uiManager.saveTransaction();

    expect(mockTransactionManager.createNewTransaction).toHaveBeenCalledWith(
      "Test Transaction",
      100,
      "Salary"
    );
  });

  /**
   * Verifies behavior when changing the language:
   * - localStorage set to correct language
   * - UI language updated
   * - chart updated
   *
   * @method handleLanguageChanges
   * @memberof module:UIManagerTests
   * @returns {void}
   */
  it("should handle language changes", () => {
    spyOn(uiManager, "updateLanguage").and.callThrough();
    uiManager.setLanguage("en");
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "preferredLanguage",
      "en"
    );
    expect(uiManager.updateLanguage).toHaveBeenCalled();
    expect(mockChartManager.updateChart).toHaveBeenCalled();
  });

  /**
   * Ensures a transaction is correctly added to the DOM, with the correct category icon and formatting.
   *
   * @method addTransactionToDOM
   * @memberof module:UIManagerTests
   * @returns {void}
   */
  it("should add a transaction to the DOM", () => {
    const transaction = {
      id: "1",
      name: "Test",
      amount: 100,
      category: "Salary",
    };
    spyOn(uiManager, "getCategoryIcon").and.returnValue(
      '<i class="fas fa-money-bill"></i>'
    );

    uiManager.addTransactionToDOM(transaction);

    const transactionElement = document.getElementById("1");
    expect(transactionElement).toBeTruthy();
    expect(
      transactionElement.querySelector(".transaction-title").textContent
    ).toBe("Test");
    expect(
      transactionElement.querySelector(".transaction-amount").textContent
    ).toContain("100");
  });

  /**
   * Tests deleting a transaction via UIManager, ensures TransactionManager is called,
   * and balance/chart are updated.
   *
   * @method deleteTransaction
   * @memberof module:UIManagerTests
   * @returns {Promise<void>}
   */
  it("should delete a transaction and update UI", async () => {
    spyOn(uiManager, "updateBalance").and.callThrough();
    await uiManager.deleteTransaction("1");
    expect(mockTransactionManager.deleteTransaction).toHaveBeenCalledWith("1");
    expect(uiManager.updateBalance).toHaveBeenCalled();
    expect(mockChartManager.updateChart).toHaveBeenCalled();
  });

  /**
   * Verifies that the balance is correctly updated in the DOM (including currency symbol).
   *
   * @method updateBalance
   * @memberof module:UIManagerTests
   * @returns {void}
   */
  it("should update the balance display", () => {
    uiManager.updateBalance();
    const balanceElement = document.getElementById("available-money");
    expect(balanceElement.textContent).toBe("1000.00zł");
  });

  /**
   * Tests deleting all transactions via UIManager, checks if TransactionManager is called
   * and UI (balance, chart) are refreshed.
   *
   * @method deleteAllTransactions
   * @memberof module:UIManagerTests
   * @returns {Promise<void>}
   */
  it("should delete all transactions", async () => {
    spyOn(uiManager, "hideDeleteAllModal").and.callThrough();
    await uiManager.deleteAllTransactions();
    expect(mockTransactionManager.deleteAllTransactions).toHaveBeenCalled();
    expect(mockChartManager.updateChart).toHaveBeenCalled();
    expect(uiManager.hideDeleteAllModal).toHaveBeenCalled();
  });
});
