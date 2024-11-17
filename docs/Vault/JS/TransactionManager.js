class TransactionManager {
  constructor() {
    this.transactions = [];
    this.currencyCode = "USD"; // Domyślna waluta
    this.currencySymbol = "$"; // Domyślny symbol waluty
    this.initializeIndexedDB();

    // Pobierz preferowany język z localStorage
    const preferredLanguage = localStorage.getItem("preferredLanguage") || "en";
    this.updateCurrencyBasedOnLanguage(preferredLanguage);
  }

  // Metoda do zmiany waluty na podstawie wybranego języka
  updateCurrencyBasedOnLanguage(language) {
    const currencies = {
      pl: { code: "PLN", symbol: "zł" },
      en: { code: "USD", symbol: "$" },
    };

    const currency = currencies[language] || currencies["en"]; // Domyślnie "en"
    this.currencyCode = currency.code;
    this.currencySymbol = currency.symbol;
  }

  // Inicjalizacja IndexedDB
  initializeIndexedDB() {
    const request = indexedDB.open("transactionsDB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("transactions")) {
        db.createObjectStore("transactions", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event) => {
      this.db = event.target.result;
      console.log("Baza danych IndexedDB otwarta pomyślnie.");
      this.loadFromIndexedDB(); // Ładowanie transakcji po otwarciu bazy
      this.onTransactionsLoaded(); // Zaktualizuj UI po załadowaniu
    };

    request.onerror = (event) => {
      console.error("Błąd podczas otwierania IndexedDB:", event.target.error);
    };
  }

  // Ładowanie danych z IndexedDB
  loadFromIndexedDB() {
    if (!this.db) return;

    const transaction = this.db.transaction("transactions", "readonly");
    const store = transaction.objectStore("transactions");

    const getAllRequest = store.getAll();
    getAllRequest.onsuccess = (event) => {
      this.transactions = event.target.result || [];
      console.log("Załadowano transakcje z IndexedDB:", this.transactions);

      // Emituj zdarzenie niezależnie od liczby transakcji
      window.dispatchEvent(new Event("transactionsLoaded"));
    };

    getAllRequest.onerror = (event) => {
      console.error(
        "Błąd podczas ładowania transakcji z IndexedDB:",
        event.target.error
      );
    };
  }

  // Dodawanie nowej transakcji do IndexedDB
  async createNewTransaction(name, amount, category) {
    return new Promise((resolve, reject) => {
      const newTransaction = {
        name,
        amount: parseFloat(amount),
        category,
        date: new Date().toISOString().split("T")[0],
        currencyCode: this.currencyCode,
      };

      if (!this.db) {
        console.error("Baza danych nie została jeszcze zainicjowana.");
        reject("Baza danych nie została jeszcze zainicjowana.");
        return;
      }

      const transaction = this.db.transaction("transactions", "readwrite");
      const store = transaction.objectStore("transactions");

      const addRequest = store.add(newTransaction);

      addRequest.onsuccess = (event) => {
        newTransaction.id = event.target.result;
        this.transactions.push(newTransaction);
        console.log("Dodano nową transakcję do IndexedDB:", newTransaction);
        resolve(newTransaction);
      };

      addRequest.onerror = (event) => {
        console.error(
          "Błąd podczas dodawania transakcji do IndexedDB:",
          event.target.error
        );
        reject(event.target.error);
      };
    });
  }

  // Obliczenie aktualnego bilansu
  getCurrentBalance() {
    return this.transactions.reduce((balance, transaction) => {
      return balance + transaction.amount;
    }, 0);
  }

  // Usuwanie wszystkich transakcji z IndexedDB
  // TransactionManager.js
  async deleteTransaction(id) {
    if (!this.db) {
      console.error("Baza danych nie została jeszcze zainicjowana.");
      return;
    }

    if (typeof id === "undefined" || id === null) {
      console.error("Nieprawidłowy identyfikator transakcji do usunięcia:", id);
      return;
    }

    const transaction = this.db.transaction("transactions", "readwrite");
    const store = transaction.objectStore("transactions");

    const deleteRequest = store.delete(id);

    deleteRequest.onsuccess = () => {
      // Aktualizacja lokalnych transakcji po usunięciu
      this.transactions = this.transactions.filter(
        (transaction) => transaction.id !== id
      );
      console.log(`Transakcja o ID ${id} została usunięta z IndexedDB.`);

      // Ważne: Zaktualizuj UI po usunięciu
      window.dispatchEvent(new Event("transactionDeleted"));
    };

    deleteRequest.onerror = (event) => {
      console.error(
        "Błąd podczas usuwania transakcji z IndexedDB:",
        event.target.error
      );
    };
  }

  deleteAllTransactions() {
    const transaction = this.db.transaction("transactions", "readwrite");
    const store = transaction.objectStore("transactions");

    const clearRequest = store.clear();
    clearRequest.onsuccess = () => {
      this.transactions = [];
      console.log("Wszystkie transakcje usunięte z IndexedDB");

      // Powiadomienie o potrzebie odświeżenia UI
      const event = new CustomEvent("transactionsCleared");
      window.dispatchEvent(event); // Emitujemy zdarzenie dla UI
    };

    clearRequest.onerror = (event) => {
      console.error(
        "Błąd podczas usuwania transakcji z IndexedDB:",
        event.target.error
      );
    };
  }
}

export default TransactionManager;
