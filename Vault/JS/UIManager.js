class UIManager {
  constructor(transactionManager, chartManager) {
    this.transactionManager = transactionManager;
    this.chartManager = chartManager;
    this.initializeElements();
    this.initializeEventListeners();
    this.root = document.documentElement;
    this.body = document.body;
    this.lightBtn = document.querySelector(".light");
    this.darkBtn = document.querySelector(".dark");
    this.initializeThemeButtons();
  }

  initializeElements() {
    this.body = document.body;
    this.income = document.querySelector(".income-area");
    this.outcome = document.querySelector(".expenses-area");
    this.money = document.querySelector(".available-money");
    this.addTransactionPanel = document.querySelector(".add-transaction-panel");
    this.addBtn = document.querySelector(".add-transaction");
    this.saveBtn = document.querySelector(".save");
    this.cancelBtn = document.querySelector(".cancel");
    this.deleteAllBtn = document.querySelector(".delete-all");
    this.lightBtn = document.querySelector(".light");
    this.darkBtn = document.querySelector(".dark");
    this.nameInput = document.querySelector("#name");
    this.amountInput = document.querySelector("#amount");
    this.categorySelect = document.querySelector("#category");
    this.deleteAllModal = document.getElementById("confirmationModal");
    this.deleteTransactionModal = document.getElementById(
      "deleteTransactionModal",
    );
    this.confirmDeleteBtn = document.getElementById("confirmDelete");
    this.cancelDeleteBtn = document.getElementById("cancelDelete");
    this.confirmDeleteTransactionBtn = document.getElementById(
      "confirmDeleteTransaction",
    );
    this.cancelDeleteTransactionBtn = document.getElementById(
      "cancelDeleteTransaction",
    );
  }

  initializeEventListeners() {
    this.addBtn.addEventListener("click", () => this.showPanel());
    this.cancelBtn.addEventListener("click", () => this.closePanel());
    this.saveBtn.addEventListener("click", () => this.saveTransaction());
    this.deleteAllBtn.addEventListener("click", () =>
      this.showDeleteAllModal(),
    );
    this.lightBtn.addEventListener("click", () => this.setLightTheme());
    this.darkBtn.addEventListener("click", () => this.setDarkTheme());
    this.categorySelect.addEventListener("change", () =>
      this.handleCategoryChange(),
    );
    this.confirmDeleteBtn.addEventListener("click", () =>
      this.deleteAllTransactions(),
    );
    this.cancelDeleteBtn.addEventListener("click", () =>
      this.hideDeleteAllModal(),
    );
    this.confirmDeleteTransactionBtn.addEventListener("click", () =>
      this.confirmDeleteTransaction(),
    );
    this.cancelDeleteTransactionBtn.addEventListener("click", () =>
      this.hideDeleteTransactionModal(),
    );
  }

  initializeThemeButtons() {
    this.lightBtn.addEventListener("click", () => this.setLightTheme());
    this.darkBtn.addEventListener("click", () => this.setDarkTheme());
  }

  showPanel() {
    this.addTransactionPanel.style.display = "flex";
  }

  closePanel() {
    this.addTransactionPanel.style.display = "none";
    this.clearInputs();
  }

  saveTransaction() {
    if (
      this.nameInput.value &&
      this.amountInput.value &&
      this.categorySelect.value !== "none"
    ) {
      const newTransaction = this.transactionManager.createNewTransaction(
        this.nameInput.value,
        this.amountInput.value,
        this.categorySelect.options[this.categorySelect.selectedIndex].text,
      );
      this.addTransactionToDOM(newTransaction);
      this.updateBalance();
      this.chartManager.updateChart();
      this.closePanel();
    } else {
      alert("Enter all data");
    }
  }

  addTransactionToDOM(transaction) {
    const newTransactionElement = document.createElement("div");
    newTransactionElement.classList.add("transaction");
    newTransactionElement.setAttribute("id", transaction.id);

    const categoryIcon = this.getCategoryIcon(transaction.category);

    newTransactionElement.innerHTML = `                   
            <p class="transaction-name">${categoryIcon} ${transaction.name}</p>
            <p class="transaction-amount ${transaction.amount > 0 ? "income" : "expense"}">
                ${transaction.amount.toFixed(2)}${this.transactionManager.currencySymbol}
            </p>
        `;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete";
    deleteButton.innerHTML = '<i class="fas fa-times"></i>';
    deleteButton.addEventListener("click", () =>
      this.showDeleteTransactionModal(transaction.id),
    );

    newTransactionElement
      .querySelector(".transaction-amount")
      .appendChild(deleteButton);

    if (transaction.amount > 0) {
      this.income.appendChild(newTransactionElement);
    } else {
      this.outcome.appendChild(newTransactionElement);
    }
  }

  getCategoryIcon(category) {
    switch (category) {
      case "[ + ] Income":
      case "[ + ] Przychód":
        return '<i class="fas fa-money-bill-wave"></i>';
      case "[ - ] Shopping":
      case "[ - ] Zakupy":
        return '<i class="fas fa-cart-arrow-down"></i>';
      case "[ - ] Food":
      case "[ - ] Jedzenie":
        return '<i class="fas fa-hamburger"></i>';
      case "[ - ] Cinema":
      case "[ - ] Kino":
        return '<i class="fas fa-film"></i>';
      default:
        return '<i class="fas fa-question-circle"></i>';
    }
  }

  updateBalance() {
    const balance = this.transactionManager.getCurrentBalance();
    this.money.textContent = `${balance.toFixed(2)}${this.transactionManager.currencySymbol}`;
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

  deleteAllTransactions() {
    this.transactionManager.deleteAllTransactions();
    this.clearTransactionsDisplay();
    this.updateBalance();
    this.chartManager.updateChart();
    this.hideDeleteAllModal();
  }

  clearTransactionsDisplay() {
    this.income.innerHTML = `<h3>${this.language === "pl" ? "Przychód:" : "Income:"}</h3>`;
    this.outcome.innerHTML = `<h3>${this.language === "pl" ? "Wydatki:" : "Expenses:"}</h3>`;
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
    this.income.innerHTML = `<h3>${this.language === "pl" ? "Przychód:" : "Income:"}</h3>`;
    this.outcome.innerHTML = `<h3>${this.language === "pl" ? "Wydatki:" : "Expenses:"}</h3>`;

    this.transactionManager.transactions.forEach((transaction) => {
      this.addTransactionToDOM(transaction);
    });

    const transactions = document.querySelectorAll(".transaction");
    transactions.forEach((transaction) => {
      const amountElement = transaction.querySelector(".transaction-amount");
      const amount = parseFloat(amountElement.textContent);
      amountElement.textContent = `${amount.toFixed(2)}${this.transactionManager.currencySymbol}`;
    });
  }

  setLightTheme() {
    this.root.style.setProperty("--first-color", "#F5F7FA");
    this.root.style.setProperty("--second-color", "#1E2A3A");
    this.root.style.setProperty("--border-color", "rgba(0, 0, 0, 0.15)");

    this.body.style.backgroundColor = "var(--light-bg-primary)";
    this.body.style.backgroundImage = `
            repeating-linear-gradient(0deg, 
                var(--light-bg-primary), 
                var(--light-bg-primary) 15px, 
                var(--light-bg-secondary) 15px, 
                var(--light-bg-secondary) 16px
            ),
            repeating-linear-gradient(90deg, 
                var(--light-bg-primary), 
                var(--light-bg-primary) 15px, 
                var(--light-bg-secondary) 15px, 
                var(--light-bg-secondary) 16px
            )
        `;
    this.body.style.boxShadow = `
            inset 0 0 50px var(--light-shadow-strong),
            inset 0 0 100px var(--light-shadow-light)
        `;

    this.updateBodyAfterStyle("light");
    this.updateChartTheme("light");
    this.body.classList.remove("dark-theme");
  }

  setDarkTheme() {
    this.root.style.setProperty("--first-color", "#222");
    this.root.style.setProperty("--second-color", "#F9F9F9");
    this.root.style.setProperty("--border-color", "rgba(255, 255, 255, 0.4)");

    this.body.style.backgroundColor = "var(--dark-bg-primary)";
    this.body.style.backgroundImage = `
            repeating-linear-gradient(0deg, 
                var(--dark-bg-primary), 
                var(--dark-bg-primary) 15px, 
                var(--dark-bg-secondary) 15px, 
                var(--dark-bg-secondary) 16px
            ),
            repeating-linear-gradient(90deg, 
                var(--dark-bg-primary), 
                var(--dark-bg-primary) 15px, 
                var(--dark-bg-secondary) 15px, 
                var(--dark-bg-secondary) 16px
            )
        `;
    this.body.style.boxShadow = `
            inset 0 0 50px var(--dark-shadow-strong),
            inset 0 0 100px var(--dark-shadow-light)
        `;

    this.updateBodyAfterStyle("dark");
    this.updateChartTheme("dark");
    this.body.classList.add("dark-theme");
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

  updateChartTheme(theme) {
    if (this.chartManager && this.chartManager.chart) {
      const chart = this.chartManager.chart;
      const color = theme === "light" ? "#333" : "#FFF";
      const gridColor =
        theme === "light" ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)";

      chart.options.plugins.title.color = color;
      chart.options.scales.x.title.color = color;
      chart.options.scales.y.title.color = color;
      chart.options.scales.x.ticks.color = color;
      chart.options.scales.y.ticks.color = color;
      chart.options.scales.x.grid.color = gridColor;
      chart.options.scales.y.grid.color = gridColor;
      chart.options.plugins.legend.labels.color = color;
      chart.update();
    }
  }

  handleCategoryChange() {
    const selectedCategory =
      this.categorySelect.options[this.categorySelect.selectedIndex].text;
    console.log("Selected category:", selectedCategory);
  }

  setLanguage(language) {
    this.language = language;
    const currencyCode = language === "pl" ? "PLN" : "USD";
    const currencySymbol = language === "pl" ? "zł" : "$";

    this.transactionManager.setCurrency(currencyCode, currencySymbol);

    document.querySelector(".income-area h3").textContent =
      language === "pl" ? "Przychód:" : "Income:";
    document.querySelector(".expenses-area h3").textContent =
      language === "pl" ? "Wydatki:" : "Expenses:";
    document.querySelector(".add-transaction").textContent =
      language === "pl" ? "Dodaj transakcję" : "Add transaction";
    document.querySelector(".save").textContent =
      language === "pl" ? "Zapisz" : "Save";
    document.querySelector(".cancel").textContent =
      language === "pl" ? "Anuluj" : "Cancel";
    document.querySelector(".delete-all").textContent =
      language === "pl" ? "Usuń wszystko" : "Delete All";

    this.chartManager.setLanguage(language);

    this.updateTransactionsDisplay();
  }

  clearInputs() {
    this.nameInput.value = "";
    this.amountInput.value = "";
    this.categorySelect.selectedIndex = 0;
  }
}

export default UIManager;
