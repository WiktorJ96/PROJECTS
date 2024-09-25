class UIManager {
  constructor(transactionManager, chartManager) {
    this.transactionManager = transactionManager;
    this.chartManager = chartManager;
    this.language = localStorage.getItem("preferredLanguage");
    this.initializeElements();
    this.initializeEventListeners();
    this.root = document.documentElement;
    this.body = document.body;
    this.updateLanguage();
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      this.setTheme(savedTheme === "dark");
    }

    window.addEventListener("languageChange", () => {
      this.updateLanguage();
      this.updateBalance();
      this.updateTransactionsDisplay();
    });
  }

  initializeElements() {
    const selectors = {
      income: ".income-area",
      outcome: ".expenses-area",
      money: ".available-money",
      addTransactionPanel: ".add-transaction-panel",
      addBtn: ".add-transaction",
      saveBtn: ".save",
      cancelBtn: ".cancel",
      deleteAllBtn: ".delete-all",
      lightBtn: ".light",
      darkBtn: ".dark",
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
      incomeTitle: ".income-area h3",
      expensesTitle: ".expenses-area h3",
    };

    Object.entries(selectors).forEach(([key, selector]) => {
      this[key] = document.querySelector(selector);
    });
  }

  initializeEventListeners() {
    const eventMap = {
      addBtn: () => this.showPanel(),
      cancelBtn: () => this.closePanel(),
      saveBtn: () => this.saveTransaction(),
      deleteAllBtn: () => this.showDeleteAllModal(),
      lightBtn: () => this.setLightTheme(),
      darkBtn: () => this.setDarkTheme(),
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

  showPanel() {
    this.addTransactionPanel.style.display = "flex";
    this.handleTransactionTypeChange();
  }

  closePanel() {
    this.addTransactionPanel.style.display = "none";
    this.clearInputs();
  }

  handleTransactionTypeChange() {
    const isIncome = this.transactionTypeSelect.value === "income";
    this.incomeCategorySelect.style.display = isIncome ? "block" : "none";
    this.expenseCategorySelect.style.display = isIncome ? "none" : "block";
  }

  saveTransaction() {
    if (this.nameInput.value && this.amountInput.value && this.transactionTypeSelect.value) {
      const isIncome = this.transactionTypeSelect.value === "income";
      const categorySelect = isIncome ? this.incomeCategorySelect : this.expenseCategorySelect;
      const category = categorySelect.options[categorySelect.selectedIndex].text;

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
      alert(this.language === "pl" ? "Wprowadź wszystkie dane" : "Enter all data");
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
    newTransactionElement.classList.add("transaction");
    newTransactionElement.setAttribute("id", transaction.id);

    const categoryIcon = this.getCategoryIcon(transaction.category);
    const categoryName = transaction.category;

    newTransactionElement.innerHTML = `                   
    <p class="transaction-name">
      <span class="category-icon">${categoryIcon}</span>
      <span class="transaction-title">${transaction.name}</span>
      <span class="transaction-category" data-lang-key="${categoryName}">(${categoryName})</span>
    </p>
    <p class="transaction-amount ${transaction.amount > 0 ? "income" : "expense"}">
      ${Math.abs(transaction.amount).toFixed(2)}${this.transactionManager.currencySymbol}
      <button class="delete"><i class="fas fa-times"></i></button>
    </p>
  `;

    const deleteButton = newTransactionElement.querySelector(".delete");
    deleteButton.addEventListener("click", () => this.showDeleteTransactionModal(transaction.id));

    (transaction.amount > 0 ? this.income : this.outcome).appendChild(newTransactionElement);
  }

  clearTransactionsDisplay() {
    const incomeTitle = this.income.querySelector("h3");
    const outcomeTitle = this.outcome.querySelector("h3");

    this.income.innerHTML = "";
    this.outcome.innerHTML = "";

    if (incomeTitle) this.income.appendChild(incomeTitle);
    if (outcomeTitle) this.outcome.appendChild(outcomeTitle);
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

  setTheme(isDark) {
    const theme = isDark ? "dark" : "light";
    const colors = {
      light: { first: "#F5F7FA", second: "#1E2A3A", border: "rgba(0, 0, 0, 0.15)" },
      dark: { first: "#222", second: "#F9F9F9", border: "rgba(255, 255, 255, 0.4)" },
    };

    Object.entries(colors[theme]).forEach(([key, value]) => {
      this.root.style.setProperty(`--${key}-color`, value);
    });

    this.body.style.backgroundColor = `var(--${theme}-bg-primary)`;
    this.body.style.backgroundImage = this.getBackgroundImage(theme);
    this.body.style.boxShadow = this.getBoxShadow(theme);

    this.updateBodyAfterStyle(theme);
    this.chartManager.setTheme(isDark);
    this.body.classList.toggle("dark-theme", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }

  setLightTheme() {
    this.setTheme(false);
  }

  setDarkTheme() {
    this.setTheme(true);
  }

  getBackgroundImage(theme) {
    return `
      repeating-linear-gradient(0deg, 
          var(--${theme}-bg-primary), 
          var(--${theme}-bg-primary) 15px, 
          var(--${theme}-bg-secondary) 15px, 
          var(--${theme}-bg-secondary) 16px
      ),
      repeating-linear-gradient(90deg, 
          var(--${theme}-bg-primary), 
          var(--${theme}-bg-primary) 15px, 
          var(--${theme}-bg-secondary) 15px, 
          var(--${theme}-bg-secondary) 16px
      )
    `;
  }

  getBoxShadow(theme) {
    return `
      inset 0 0 50px var(--${theme}-shadow-strong),
      inset 0 0 100px var(--${theme}-shadow-light)
    `;
  }

  updateBodyAfterStyle(theme) {
    const style = document.createElement("style");
    style.textContent = `
      body::after {
          background: radial-gradient(circle at 50% 50%, 
              var(--${theme}-highlight) 0%, 
              transparent 60%
          );
      }
    `;
    document.head.appendChild(style);
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
    if (this.deleteAllModal) {
      this.deleteAllModal.classList.add("show");
      document.body.style.overflow = "hidden";
    } else {
      console.error("Delete all modal not found");
    }
  }

  hideDeleteAllModal() {
    if (this.deleteAllModal) {
      this.deleteAllModal.classList.remove("show");
      document.body.style.overflow = "";
    }
  }

  showDeleteTransactionModal(id) {
    if (this.deleteTransactionModal) {
      this.deleteTransactionModal.classList.add("show");
      this.deleteTransactionModal.dataset.transactionId = id;
      document.body.style.overflow = "hidden"; 
    } else {
      console.error("Delete transaction modal not found");
    }
  }

  hideDeleteTransactionModal() {
    if (this.deleteTransactionModal) {
      this.deleteTransactionModal.classList.remove("show");
      document.body.style.overflow = ""; 
    }
  }
}

export default UIManager;
