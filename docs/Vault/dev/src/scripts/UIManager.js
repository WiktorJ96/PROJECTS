/**
 * Manages the User Interface (UI) of the application.
 * Handles user interactions, updates transaction displays, and manages modals.
 */
class UIManager {
  /**
   * Creates an instance of UIManager.
   * Initializes UI elements, sets up event listeners, and synchronizes the UI
   * with the transaction manager and chart manager.
   *
   * @constructor
   *
   * @param {Object} transactionManager - Instance of TransactionManager for managing transactions.
   * @param {Object} chartManager - Instance of ChartManager for rendering charts.
   */
  constructor(transactionManager, chartManager) {
    /**
     * Transaction manager instance for handling transaction data.
     * @type {Object}
     */
    this.transactionManager = transactionManager;

    /**
     * Chart manager instance for managing charts.
     * @type {Object}
     */
    this.chartManager = chartManager;

    /**
     * Current language of the application.
     * @type {string}
     */
    this.language = localStorage.getItem("preferredLanguage");

    this.initializeElements();
    this.initializeEventListeners();
    this.body = document.body;
    this.updateLanguage();

    // Event listeners for UI updates
    window.addEventListener("languageChange", () => {
      this.updateLanguage();
      this.updateBalance();
      this.updateTransactionsDisplay();
      this.chartManager.updateChart();
    });

    window.addEventListener("transactionAdded", () => {
      this.updateTransactionsDisplay();
      this.updateBalance();
      this.chartManager.updateChart();
    });

    window.addEventListener("transactionsCleared", () => {
      this.clearTransactionsDisplay();
      this.updateBalance();
      this.chartManager.updateChart();
    });

    window.addEventListener("transactionDeleted", () => {
      this.updateTransactionsDisplay();
      this.updateBalance();
      this.chartManager.updateChart();
    });

    window.addEventListener("transactionsLoaded", () => {
      this.updateTransactionsDisplay();
      this.updateBalance();
      this.chartManager.updateChart();
    });

    window.addEventListener("online", async () => {
      console.log("Connection restored. Starting synchronization...");
      await this.transactionManager.syncTransactions();
    });
  }

  /**
   * Initializes UI elements by selecting DOM elements based on predefined selectors.
   *
   * @returns {void}
   */
  initializeElements() {
    const selectors = {
      income: "#income-area",
      outcome: "#expenses-area",
      money: "#available-money",
      addTransactionPanel: "#addTransactionModal",
      addBtn: "#add-transaction",
      saveBtn: "#saveTransaction",
      cancelBtn: ".cancel",
      deleteAllBtn: "#delete-all",
      lightBtn: "#light-mode",
      darkBtn: "#dark-mode",
      nameInput: "#name",
      amountInput: "#amount",
      transactionTypeSelect: "#transaction-type",
      incomeCategorySelect: "#income-category",
      expenseCategorySelect: "#expense-category",
      deleteAllModal: "#confirmationModal",
      deleteTransactionModal: "#deleteTransactionModal",
      confirmDeleteBtn: "#confirmDelete",
      cancelDeleteBtn: "#cancelDelete",
      confirmDeleteTransactionBtn: "#confirmDeleteTransaction",
      cancelDeleteTransactionBtn: "#cancelDeleteTransaction",
      incomeTitle: "#income-tab",
      expensesTitle: "#expenses-tab",
    };

    Object.entries(selectors).forEach(([key, selector]) => {
      this[key] = document.querySelector(selector);
    });
  }

  /**
   * Sets up event listeners for UI elements to handle user interactions.
   *
   * @returns {void}
   */
  initializeEventListeners() {
    const eventMap = {
      addBtn: () => this.showPanel(),
      saveBtn: () => this.saveTransaction(),
      deleteAllBtn: () => this.showDeleteAllModal(),
      transactionTypeSelect: () => this.handleTransactionTypeChange(),
      confirmDeleteBtn: () => this.deleteAllTransactions(),
      cancelDeleteBtn: () => this.hideDeleteAllModal(),
      confirmDeleteTransactionBtn: () => this.confirmDeleteTransaction(),
      cancelDeleteTransactionBtn: () => this.hideDeleteTransactionModal(),
    };

    Object.entries(eventMap).forEach(([elementKey, handler]) => {
      if (this[elementKey]) {
        this[elementKey].addEventListener(
          "change" in this[elementKey] ? "change" : "click",
          handler.bind(this)
        );
      } else {
        console.warn(`Element ${elementKey} not found`);
      }
    });
  }

  /**
   * Sets the application's language and updates the UI to reflect the selected language.
   *
   * @param {string} lang - Language code (e.g., 'en', 'pl').
   * @returns {void}
   */
  setLanguage(lang) {
    this.language = lang;
    localStorage.setItem("preferredLanguage", lang);

    // Update currency and UI
    this.transactionManager.updateCurrencyBasedOnLanguage(lang);
    this.updateLanguage();
    this.updateBalance();
    this.updateTransactionsDisplay();
    this.chartManager.updateChart();
  }

  /**
   * Displays the modal panel for adding a new transaction.
   *
   * @returns {void}
   */
  showPanel() {
    const modal = new bootstrap.Modal(this.addTransactionPanel);
    modal.show();
    this.handleTransactionTypeChange();
  }

  /**
   * Closes the modal panel for adding a new transaction and clears input fields.
   *
   * @returns {void}
   */
  closePanel() {
    const modal = bootstrap.Modal.getInstance(this.addTransactionPanel);
    if (modal) {
      modal.hide();
    }
    this.clearInputs();
  }

  /**
   * Handles changes in the transaction type (income or expense) and updates the UI accordingly.
   *
   * @returns {void}
   */
  handleTransactionTypeChange() {
    const isIncome = this.transactionTypeSelect.value === "income";
    this.incomeCategorySelect.closest(".mb-3").style.display = isIncome
      ? "block"
      : "none";
    this.expenseCategorySelect.closest(".mb-3").style.display = isIncome
      ? "none"
      : "block";
  }

  /**
   * Saves a transaction and updates the UI.
   *
   * @returns {Promise<void>}
   */
  async saveTransaction() {
    if (
      this.nameInput.value &&
      this.amountInput.value &&
      this.transactionTypeSelect.value
    ) {
      const isIncome = this.transactionTypeSelect.value === "income";
      const categorySelect = isIncome
        ? this.incomeCategorySelect
        : this.expenseCategorySelect;
      const category =
        categorySelect.options[categorySelect.selectedIndex].text;

      const amount = isIncome
        ? Math.abs(parseFloat(this.amountInput.value))
        : -Math.abs(parseFloat(this.amountInput.value));

      // Save the transaction
      await this.transactionManager.createNewTransaction(
        this.nameInput.value,
        amount,
        category
      );

      this.closePanel();
    } else {
      alert(
        this.language === "pl" ? "Wprowadź wszystkie dane" : "Enter all data"
      );
    }
  }

  /**
   * Updates the transaction list in the DOM.
   *
   * @returns {void}
   */
  updateTransactionsDisplay() {
    this.clearTransactionsDisplay();

    if (!this.transactionManager.transactions.length) {
      console.log("No transactions to display.");
      return;
    }

    this.transactionManager.transactions.forEach((transaction) => {
      this.addTransactionToDOM(transaction);
    });
  }

  /**
   * Updates the balance displayed in the UI.
   *
   * @returns {void}
   */
  updateBalance() {
    const balance = this.transactionManager.getCurrentBalance();
    this.money.textContent = `${balance.toFixed(2)}${this.transactionManager.currencySymbol}`;
  }

  /**
   * Clears the transactions displayed in the income and expense areas.
   *
   * @returns {void}
   */
  clearTransactionsDisplay() {
    this.income.innerHTML = "";
    this.outcome.innerHTML = "";
  }

  /**
   * Adds a transaction to the DOM.
   *
   * @param {Object} transaction - The transaction object containing details to display.
   * @returns {void}
   */
  addTransactionToDOM(transaction) {
    const categoryName = transaction.category;

    const newTransactionElement = document.createElement("div");
    newTransactionElement.classList.add("transaction-item");
    newTransactionElement.classList.add(
      transaction.amount > 0 ? "income-item" : "expense-item"
    );
    newTransactionElement.setAttribute("id", transaction.id);

    const categoryIcon = this.getCategoryIcon(transaction.category);

    newTransactionElement.innerHTML = `
    <div class="transaction-details">
      <div class="transaction-name">
        <span class="category-icon">${categoryIcon}</span>
        <span class="transaction-title">${transaction.name}</span>
      </div>
      <div class="transaction-category" data-lang-key="${categoryName}">${categoryName}</div>
    </div>
    <div class="transaction-amount ${transaction.amount > 0 ? "income" : "expense"}">
      ${Math.abs(transaction.amount).toFixed(2)}${this.transactionManager.currencySymbol}
    </div>
    <button class="delete-transaction" aria-label="Usuń transakcję">
      <i class="fas fa-times"></i>
    </button>
  `;

    // Event listener for delete button
    newTransactionElement
      .querySelector(".delete-transaction")
      .addEventListener("click", () => {
        this.showDeleteTransactionModal(transaction.id);
      });

    // Append transaction to the appropriate container
    (transaction.amount > 0 ? this.income : this.outcome).appendChild(
      newTransactionElement
    );
  }

  /**
   * Clears all inputs in the add transaction modal.
   *
   * @returns {void}
   */
  clearInputs() {
    [this.nameInput, this.amountInput].forEach((input) => (input.value = ""));
    this.transactionTypeSelect.selectedIndex = 0;
  }

  /**
   * Shows a modal to confirm the deletion of all transactions.
   *
   * @returns {void}
   */
  showDeleteAllModal() {
    const modal = new bootstrap.Modal(this.deleteAllModal);
    modal.show();
  }

  /**
   * Hides the modal for confirming the deletion of all transactions.
   *
   * @returns {void}
   */
  hideDeleteAllModal() {
    const modal = bootstrap.Modal.getInstance(this.deleteAllModal);
    if (modal) {
      modal.hide();
    }
  }

  /**
   * Deletes all transactions and updates the UI accordingly.
   *
   * @returns {Promise<void>}
   */
  async deleteAllTransactions() {
    await this.transactionManager.deleteAllTransactions();
    this.clearTransactionsDisplay();
    this.updateBalance();
    this.chartManager.updateChart();
    this.hideDeleteAllModal();
  }

  /**
   * Shows a modal to confirm the deletion of a specific transaction.
   *
   * @param {string} id - The ID of the transaction to delete.
   * @returns {void}
   */
  showDeleteTransactionModal(id) {
    if (!id) {
      console.error("Invalid transaction ID:", id);
      return;
    }

    this.deleteTransactionModal.dataset.transactionId = id;
    const modal = new bootstrap.Modal(this.deleteTransactionModal);
    modal.show();
  }

  /**
   * Hides the modal for confirming the deletion of a specific transaction.
   *
   * @returns {void}
   */
  hideDeleteTransactionModal() {
    const modal = bootstrap.Modal.getInstance(this.deleteTransactionModal);
    if (modal) {
      modal.hide();
    }
  }

  /**
   * Confirms the deletion of a transaction by calling the delete method.
   *
   * @returns {Promise<void>}
   */
  async confirmDeleteTransaction() {
    const id = this.deleteTransactionModal.dataset.transactionId;
    if (!id) {
      console.error("Invalid transaction ID:", id);
      return;
    }

    await this.deleteTransaction(id);
    this.hideDeleteTransactionModal();
  }

  /**
   * Deletes a specific transaction and updates the UI.
   *
   * @param {string} id - The ID of the transaction to delete.
   * @returns {Promise<void>}
   */
  async deleteTransaction(id) {
    await this.transactionManager.deleteTransaction(id);
    const transactionElement = document.getElementById(id);
    if (transactionElement) {
      transactionElement.remove();
    }
    this.updateBalance();
    this.chartManager.updateChart();
  }

  /**
   * Updates the application's language settings based on the selected language.
   *
   * @returns {void}
   */
  updateLanguage() {
    this.language = localStorage.getItem("preferredLanguage");
  }

  /**
   * Retrieves an icon representing the given category.
   *
   * @param {string} category - The category to retrieve the icon for.
   * @returns {string} The HTML string of the icon element.
   */
  getCategoryIcon(category) {
    if (!category || typeof category !== "string") {
      return `<i class="fas fa-question-circle"></i>`;
    }
    const lowerCategory = category.toLowerCase();
    const iconMap = {
      wypłata: "fa-money-bill-wave",
      salary: "fa-money-bill-wave",
      premia: "fa-gift",
      bonus: "fa-gift",
      prezent: "fa-gift",
      gift: "fa-gift",
      inne: "fa-question-circle",
      other: "fa-question-circle",
      zakupy: "fa-cart-arrow-down",
      shopping: "fa-cart-arrow-down",
      jedzenie: "fa-hamburger",
      food: "fa-hamburger",
      kino: "fa-film",
      cinema: "fa-film",
      transport: "fa-bus",
    };

    return `<i class="me-1 fas ${iconMap[lowerCategory] || "fa-question-circle"}"></i>`;
  }
}

export default UIManager;
