
class TransactionManager {
    constructor() {
        this.transactions = [];
        this.moneyArr = [0];
        this.balanceHistory = [];
        this.ID = 0;
        this.currencyCode = 'USD';
        this.currencySymbol = '$';
    }

    createNewTransaction(name, amount, category) {
        const newTransaction = {
            id: this.ID,
            name,
            amount: parseFloat(amount),
            category
        };
        this.transactions.push(newTransaction);
        this.moneyArr.push(newTransaction.amount);
        this.ID++;
        this.updateBalanceHistory();
        return newTransaction;
    }

    deleteTransaction(id) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index > -1) {
            this.transactions.splice(index, 1);
            this.moneyArr.splice(index + 1, 1);
            this.updateBalanceHistory();
        }
    }

    deleteAllTransactions() {
        this.transactions = [];
        this.moneyArr = [0];
        this.balanceHistory = [];
        this.ID = 0;
    }

    getCurrentBalance() {
        return this.moneyArr.reduce((acc, curr) => acc + curr, 0);
    }

    getIncome() {
        return this.transactions
            .filter(t => t.amount > 0)
            .reduce((acc, t) => acc + t.amount, 0);
    }

    getExpenses() {
        return this.transactions
            .filter(t => t.amount < 0)
            .reduce((acc, t) => acc + t.amount, 0);
    }

    updateBalanceHistory() {
        this.balanceHistory.push({
            date: new Date().toLocaleDateString(),
            balance: this.getCurrentBalance(),
            income: this.getIncome(),
            expenses: this.getExpenses()
        });
    }

    setCurrency(code, symbol) {
        this.currencyCode = code;
        this.currencySymbol = symbol;
    }
}

export default TransactionManager;