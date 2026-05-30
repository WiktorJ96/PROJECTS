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
    this.updateTransactionListVisibility();

    // Detect LinkedIn browser
    this.checkInAppBrowser();

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
      transactionSection: "#transaction-section",
      confirmDeleteBtn: "#confirmDelete",
      cancelDeleteBtn: "#cancelDelete",
      confirmDeleteTransactionBtn: "#confirmDeleteTransaction",
      cancelDeleteTransactionBtn: "#cancelDeleteTransaction",
      incomeTitle: "#income-tab",
      expensesTitle: "#expenses-tab",
      chartEmptyState: "#chart-empty-state",
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
          handler.bind(this),
        );
      } else {
        console.warn(`Element ${elementKey} not found`);
      }
    });
  }

  /**
   * Detects LinkedIn in-app browser
   * and shows recommendation popup.
   *
   * @returns {void}
   */
  checkInAppBrowser() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    const isLinkedInBrowser = userAgent.includes("LinkedInApp");

    if (!isLinkedInBrowser) {
      return;
    }

    // Prevent showing popup multiple times
    if (localStorage.getItem("browserPopupShown")) {
      return;
    }

    localStorage.setItem("browserPopupShown", "true");

    this.showBrowserRecommendationModal();
  }

  /**
   * Shows popup recommending opening
   * the application in Chrome or Safari.
   *
   * @returns {void}
   */
  showBrowserRecommendationModal() {
    const modalHTML = `
      <div 
        class="modal fade" 
        id="browserRecommendationModal" 
        tabindex="-1"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content bg-dark text-white border-0 rounded-4">

            <div class="modal-header border-0">
              <h5 class="modal-title">
                Better experience available
              </h5>
            </div>

            <div class="modal-body">
              This portfolio may not display correctly inside the LinkedIn browser.
              <br><br>
              Please open it in
              <strong>Chrome</strong> or
              <strong>Safari</strong>
              for the best experience.
            </div>

            <div class="modal-footer border-0">

              <button
                type="button"
                class="btn btn-light"
                id="openExternalBrowser"
              >
                Open in browser
              </button>

              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Stay here
              </button>

            </div>

          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modalElement = document.getElementById("browserRecommendationModal");

    const modal = new bootstrap.Modal(modalElement);

    modal.show();

    document
      .getElementById("openExternalBrowser")
      .addEventListener("click", () => {
        window.open(window.location.href, "_blank");
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
    this.nameInput.focus();

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
    const name = this.nameInput.value.trim();
    const rawAmount = parseFloat(this.amountInput.value);

    if (
      name &&
      Number.isFinite(rawAmount) &&
      rawAmount > 0 &&
      this.transactionTypeSelect.value
    ) {
      const isIncome = this.transactionTypeSelect.value === "income";

      const categorySelect = isIncome
        ? this.incomeCategorySelect
        : this.expenseCategorySelect;

      const category = categorySelect.value;

      const amount = isIncome
        ? Math.abs(rawAmount)
        : -Math.abs(rawAmount);

      await this.transactionManager.createNewTransaction(
        name,
        amount,
        category,
      );

      this.closePanel();
    } else {
      this.nameInput.value = name;
      this.nameInput.reportValidity();
      this.amountInput.reportValidity();
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
      this.updateTransactionListVisibility();
      this.updateTransactionTabCounts();
      return;
    }

    this.transactionManager.transactions.forEach((transaction) => {
      this.addTransactionToDOM(transaction);
    });

    this.updateTransactionListVisibility();
    this.updateTransactionTabCounts();
  }

  /**
   * Updates the balance displayed in the UI.
   *
   * @returns {void}
   */
  updateBalance() {
    const balance = this.transactionManager.getCurrentBalance();

    this.money.textContent = `
      ${balance.toFixed(2)}
      ${this.transactionManager.currencySymbol}
    `;
  }

  /**
   * Clears the transactions displayed in the income and expense areas.
   *
   * @returns {void}
   */
  clearTransactionsDisplay() {
    this.income.innerHTML = "";
    this.outcome.innerHTML = "";
    this.updateTransactionListVisibility();
    this.updateTransactionTabCounts();
  }

  /**
   * Shows transaction list cards only when they contain transactions.
   *
   * @returns {void}
   */
  updateTransactionListVisibility() {
    const hasTransactions =
      this.income.children.length > 0 || this.outcome.children.length > 0;

    this.transactionSection?.classList.toggle(
      "transaction-section-hidden",
      !hasTransactions,
    );
    this.deleteAllBtn?.classList.toggle("d-none", !hasTransactions);

    [
      this.income,
      this.outcome,
    ].forEach((list) => {
      const card = list?.closest(".card");

      if (!card) {
        return;
      }

      card.classList.toggle(
        "transaction-list-card-hidden",
        list.children.length === 0,
      );
    });
  }

  /**
   * Updates income and expense tab counters.
   *
   * @returns {void}
   */
  updateTransactionTabCounts() {
    const incomeCount = this.income?.children.length || 0;
    const expenseCount = this.outcome?.children.length || 0;
    const isPolish = this.language !== "en";

    if (this.incomeTitle) {
      this.incomeTitle.textContent = `${isPolish ? "Przychód" : "Income"} (${incomeCount})`;
    }

    if (this.expensesTitle) {
      this.expensesTitle.textContent = `${isPolish ? "Wydatki" : "Expenses"} (${expenseCount})`;
    }
  }

  /**
   * Gets a localized category label from a stored category key.
   *
   * @param {string} category - Stored category key or legacy label.
   * @returns {string} Localized category label.
   */
  getCategoryLabel(category) {
    const labels = {
      pl: {
        salary: "Wypłata",
        bonus: "Premia",
        gift: "Prezent",
        "other-income": "Inne",
        shopping: "Zakupy",
        food: "Jedzenie",
        cinema: "Kino",
        transport: "Transport",
        "other-expense": "Inne",
      },
      en: {
        salary: "Salary",
        bonus: "Bonus",
        gift: "Gift",
        "other-income": "Other",
        shopping: "Shopping",
        food: "Food",
        cinema: "Cinema",
        transport: "Transport",
        "other-expense": "Other",
      },
    };

    const language = this.language === "en" ? "en" : "pl";
    return labels[language][category] || category;
  }

  /**
   * Adds a transaction to the DOM.
   *
   * @param {Object} transaction - The transaction object containing details to display.
   * @returns {void}
   */
  addTransactionToDOM(transaction) {
    const categoryName = transaction.category;
    const categoryLabel = this.getCategoryLabel(categoryName);

    const newTransactionElement = document.createElement("div");

    newTransactionElement.classList.add("transaction-item");

    newTransactionElement.classList.add(
      transaction.amount > 0 ? "income-item" : "expense-item",
    );

    newTransactionElement.setAttribute("id", transaction.id);

    const categoryIcon = this.getCategoryIcon(transaction.category);

    newTransactionElement.innerHTML = `
      <div class="transaction-details">
        <div class="transaction-name">
          <span class="category-icon">
            ${categoryIcon}
          </span>

          <span class="transaction-title">
            ${transaction.name}
          </span>
        </div>

        <div 
          class="transaction-category"
          data-lang-key="${categoryName}"
        >
          ${categoryLabel}
        </div>

        <div class="transaction-date">
          ${this.formatTransactionDate(transaction.date)}
        </div>
      </div>

      <div class="transaction-amount ${
        transaction.amount > 0 ? "income" : "expense"
      }">
        ${Math.abs(transaction.amount).toFixed(2)}
        ${this.transactionManager.currencySymbol}
      </div>

      <button
        class="delete-transaction"
        aria-label="Usuń transakcję"
      >
        <i class="fas fa-times"></i>
      </button>
    `;

    newTransactionElement
      .querySelector(".delete-transaction")
      .addEventListener("click", () => {
        this.showDeleteTransactionModal(transaction.id);
      });

    (transaction.amount > 0 ? this.income : this.outcome).appendChild(
      newTransactionElement,
    );

    this.updateTransactionListVisibility();
    this.updateTransactionTabCounts();
  }

  /**
   * Formats transaction date for list display.
   *
   * @param {string} date - Transaction date.
   * @returns {string} Formatted date.
   */
  formatTransactionDate(date) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat(this.language === "en" ? "en-US" : "pl-PL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(parsedDate);
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

    this.updateTransactionListVisibility();
    this.updateTransactionTabCounts();

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
    this.updateTransactionTabCounts();
  }

  /**
   * Retrieves an icon representing the given category.
   *
   * @param {string} category - The category to retrieve the icon for.
   * @returns {string} The HTML string of the icon element.
   */
  getCategoryIcon(category) {
    if (!category || typeof category !== "string") {
      return `
        <i class="fas fa-question-circle"></i>
      `;
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
      "other-income": "fa-question-circle",
      "other-expense": "fa-question-circle",
      zakupy: "fa-cart-arrow-down",
      shopping: "fa-cart-arrow-down",
      jedzenie: "fa-hamburger",
      food: "fa-hamburger",
      kino: "fa-film",
      cinema: "fa-film",
      transport: "fa-bus",
    };

    return `
      <i class="me-1 fas ${iconMap[lowerCategory] || "fa-question-circle"}"></i>
    `;
  }
}

export default UIManager;
