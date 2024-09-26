class UIManager {
  constructor(transactionManager, chartManager) {
    this.transactionManager = transactionManager;
    this.chartManager = chartManager;
    this.language = localStorage.getItem("preferredLanguage");
    this.initializeElements();
    this.initializeEventListeners();
    this.body = document.body;
    this.updateLanguage();

    window.addEventListener("languageChange", () => {
      this.updateLanguage();
      this.updateBalance();
      this.updateTransactionsDisplay();
    });
  }

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

    this.addTransactionPanel.addEventListener("hidden.bs.modal", () => {
      this.clearInputs();
    });
  }

  showPanel() {
    const modal = new bootstrap.Modal(this.addTransactionPanel);
    modal.show();
    this.handleTransactionTypeChange();
  }

  closePanel() {
    const modal = bootstrap.Modal.getInstance(this.addTransactionPanel);
    if (modal) {
      modal.hide();
    }
    this.clearInputs();
  }

  handleTransactionTypeChange() {
    const isIncome = this.transactionTypeSelect.value === "income";
    this.incomeCategorySelect.closest(".mb-3").style.display = isIncome
      ? "block"
      : "none";
    this.expenseCategorySelect.closest(".mb-3").style.display = isIncome
      ? "none"
      : "block";
  }

  saveTransaction() {
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

      const newTransaction = this.transactionManager.createNewTransaction(
        this.nameInput.value,
        amount,
        category
      );

      this.addTransactionToDOM(newTransaction);
      this.updateBalance();
      this.chartManager.updateChart();
      this.closePanel();
    } else {
      alert(
        this.language === "pl" ? "Wprowadź wszystkie dane" : "Enter all data"
      );
    }
  }

  getCategoryIcon(category) {
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

    return `<i class="fas ${iconMap[lowerCategory] || "fa-question-circle"}"></i>`;
  }

  addTransactionToDOM(transaction) {
    const newTransactionElement = document.createElement("div");
    newTransactionElement.classList.add("transaction-item");
    newTransactionElement.classList.add(
      transaction.amount > 0 ? "income-item" : "expense-item"
    );
    newTransactionElement.setAttribute("id", transaction.id);

    const categoryIcon = this.getCategoryIcon(transaction.category);
    const categoryName = transaction.category;

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

    const deleteButton = newTransactionElement.querySelector(
      ".delete-transaction"
    );
    deleteButton.addEventListener("click", () =>
      this.showDeleteTransactionModal(transaction.id)
    );

    (transaction.amount > 0 ? this.income : this.outcome).appendChild(
      newTransactionElement
    );
  }

  clearTransactionsDisplay() {
    this.income.innerHTML = "";
    this.outcome.innerHTML = "";
  }

  updateBalance() {
    const balance = this.transactionManager.getCurrentBalance();
    this.money.textContent = `${balance.toFixed(2)}${this.transactionManager.currencySymbol}`;
    localStorage.setItem("availableFunds", balance.toString());
  }

  deleteAllTransactions() {
    this.transactionManager.deleteAllTransactions();
    this.clearTransactionsDisplay();
    this.updateBalance();
    this.chartManager.updateChart();
    this.hideDeleteAllModal();
  }

  confirmDeleteTransaction() {
    const id = parseInt(this.deleteTransactionModal.dataset.transactionId);
    this.deleteTransaction(id);
    this.hideDeleteTransactionModal();
  }

  deleteTransaction(id) {
    this.transactionManager.deleteTransaction(id);
    const transactionElement = document.getElementById(id);
    if (transactionElement) {
      transactionElement.remove();
    }
    this.updateBalance();
    this.chartManager.updateChart();
  }

  updateTransactionsDisplay() {
    this.clearTransactionsDisplay();
    this.transactionManager.transactions.forEach((transaction) =>
      this.addTransactionToDOM(transaction)
    );
  }

  clearInputs() {
    [this.nameInput, this.amountInput].forEach((input) => (input.value = ""));
    this.transactionTypeSelect.selectedIndex = 0;
    this.incomeCategorySelect.selectedIndex = 0;
    this.expenseCategorySelect.selectedIndex = 0;
    this.handleTransactionTypeChange();
  }

  updateLanguage() {
    this.language = localStorage.getItem("preferredLanguage");
  }

  showDeleteAllModal() {
    const modal = new bootstrap.Modal(this.deleteAllModal);
    modal.show();
  }

  hideDeleteAllModal() {
    const modal = bootstrap.Modal.getInstance(this.deleteAllModal);
    if (modal) {
      modal.hide();
    }
  }

  showDeleteTransactionModal(id) {
    this.deleteTransactionModal.dataset.transactionId = id;
    const modal = new bootstrap.Modal(this.deleteTransactionModal);
    modal.show();
  }

  hideDeleteTransactionModal() {
    const modal = bootstrap.Modal.getInstance(this.deleteTransactionModal);
    if (modal) {
      modal.hide();
    }
  }
}

export default UIManager;
