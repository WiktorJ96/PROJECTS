class TransactionManager {
  constructor() {
    this.transactions = [];
    this.currencyCode = "USD";
    this.currencySymbol = "$";
    this.nextId = 1;
    this.initialBalance = 0;
    this.loadFromLocalStorage();
  }

  setCurrency(currencyCode) {
    this.currencyCode = currencyCode;
    this.currencySymbol = currencyCode === "PLN" ? "zł" : "$";
    this.saveToLocalStorage();
  }

  createNewTransaction(name, amount, category) {
    const newTransaction = {
      id: this.nextId++,
      name,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString().split("T")[0],
    };
    this.transactions.push(newTransaction);
    this.saveToLocalStorage();
    return newTransaction;
  }

  deleteTransaction(id) {
    this.transactions = this.transactions.filter((transaction) => transaction.id !== id);
    this.saveToLocalStorage();
  }

  deleteAllTransactions() {
    this.transactions = [];
    this.initialBalance = 0;
    this.saveToLocalStorage();
  }

  getCurrentBalance() {
    return this.transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      this.initialBalance
    );
  }

  get balanceHistory() {
    let balance = this.initialBalance;
    return this.transactions
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((transaction) => {
        balance += transaction.amount;
        return {
          date: transaction.date,
          balance,
          income: Math.max(transaction.amount, 0),
          expenses: Math.max(-transaction.amount, 0),
        };
      });
  }

  saveToLocalStorage() {
    const dataToSave = {
      transactions: this.transactions,
      currencyCode: this.currencyCode,
      currencySymbol: this.currencySymbol,
      nextId: this.nextId,
      initialBalance: this.initialBalance,
      availableFunds: this.getCurrentBalance(),
    };

    Object.entries(dataToSave).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }

  loadFromLocalStorage() {
    const keys = [
      "transactions",
      "currencyCode",
      "currencySymbol",
      "nextId",
      "initialBalance",
      "availableFunds",
    ];
    const savedData = {};

    keys.forEach((key) => {
      const savedItem = localStorage.getItem(key);
      if (savedItem) {
        savedData[key] = JSON.parse(savedItem);
      }
    });

    if (savedData.transactions) this.transactions = savedData.transactions;
    if (savedData.currencyCode) this.currencyCode = savedData.currencyCode;
    if (savedData.currencySymbol) this.currencySymbol = savedData.currencySymbol;
    if (savedData.nextId) this.nextId = savedData.nextId;
    if (savedData.initialBalance) this.initialBalance = savedData.initialBalance;

    return savedData.availableFunds || this.getCurrentBalance();
  }

  setInitialBalance(balance) {
    this.initialBalance = parseFloat(balance);
    this.saveToLocalStorage();
  }
}

export default TransactionManager;
