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
      categorySelect: "#category",
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
      categorySelect: () => this.handleCategoryChange(),
      confirmDeleteBtn: () => this.deleteAllTransactions(),
      cancelDeleteBtn: () => this.hideDeleteAllModal(),
      confirmDeleteTransactionBtn: () => this.confirmDeleteTransaction(),
      cancelDeleteTransactionBtn: () => this.hideDeleteTransactionModal(),
    };

    Object.entries(eventMap).forEach(([elementKey, handler]) => {
      if (this[elementKey]) {
        this[elementKey].addEventListener("click", handler.bind(this));
      } else {
        console.warn(`Element ${elementKey} not found`);
      }
    });
  }

  showPanel() {
    this.addTransactionPanel.style.display = "flex";
  }

  closePanel() {
    this.addTransactionPanel.style.display = "none";
    this.clearInputs();
  }

  saveTransaction() {
    if (this.nameInput.value && this.amountInput.value && this.categorySelect.value !== "none") {
      const newTransaction = this.transactionManager.createNewTransaction(
        this.nameInput.value,
        this.amountInput.value,
        this.categorySelect.options[this.categorySelect.selectedIndex].text
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
    let categoryIcon;

    switch (category) {
      case "[ + ] Income":
      case "[ + ] Przychód":
        categoryIcon = '<i class="fas fa-money-bill-wave"></i>';
        break;
      case "[ - ] Shopping":
      case "[ - ] Zakupy":
        categoryIcon = '<i class="fas fa-cart-arrow-down"></i>';
        break;
      case "[ - ] Food":
      case "[ - ] Jedzenie":
        categoryIcon = '<i class="fas fa-hamburger"></i>';
        break;
      case "[ - ] Cinema":
      case "[ - ] Kino":
        categoryIcon = '<i class="fas fa-film"></i>';
        break;
      default:
        categoryIcon = '<i class="fas fa-question-circle"></i>';
        break;
    }

    return categoryIcon;
  }

  addTransactionToDOM(transaction) {
    const newTransactionElement = document.createElement("div");
    newTransactionElement.classList.add("transaction");
    newTransactionElement.setAttribute("id", transaction.id);

    const categoryIcon = this.getCategoryIcon(transaction.category);
    const categoryName = transaction.category.replace(/\[.*?\]\s/, "").trim();

    newTransactionElement.innerHTML = `                   
    <p class="transaction-name">
      <span class="category-icon">${categoryIcon}</span>
      <span class="transaction-title">${transaction.name}</span>
      <span class="transaction-category" data-lang-key="${categoryName}">(${categoryName})</span>
    </p>
    <p class="transaction-amount ${transaction.amount > 0 ? "income" : "expense"}">
      ${transaction.amount.toFixed(2)}${this.transactionManager.currencySymbol}
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
    const incomeTitle = this.income.querySelector("h3");
    const outcomeTitle = this.outcome.querySelector("h3");

    this.income.innerHTML = "";
    this.outcome.innerHTML = "";

    if (incomeTitle) this.income.appendChild(incomeTitle);
    if (outcomeTitle) this.outcome.appendChild(outcomeTitle);

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

  handleCategoryChange() {
    console.log(
      "Selected category:",
      this.categorySelect.options[this.categorySelect.selectedIndex].text
    );
  }

  clearInputs() {
    [this.nameInput, this.amountInput].forEach((input) => (input.value = ""));
    this.categorySelect.selectedIndex = 0;
  }

  updateLanguage() {
    this.language = localStorage.getItem("preferredLanguage");
  }

  showDeleteAllModal() {
    if (this.deleteAllModal) {
      this.deleteAllModal.style.display = "block";
    } else {
      console.error("Delete all modal not found");
    }
  }

  hideDeleteAllModal() {
    if (this.deleteAllModal) {
      this.deleteAllModal.style.display = "none";
    }
  }

  showDeleteTransactionModal(id) {
    if (this.deleteTransactionModal) {
      this.deleteTransactionModal.style.display = "block";
      this.deleteTransactionModal.dataset.transactionId = id;
    } else {
      console.error("Delete transaction modal not found");
    }
  }

  hideDeleteTransactionModal() {
    if (this.deleteTransactionModal) {
      this.deleteTransactionModal.style.display = "none";
    }
  }
}

export default UIManager;
