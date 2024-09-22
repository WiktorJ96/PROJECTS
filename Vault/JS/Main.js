import TransactionManager from "./TransactionManager.js";
import ChartManager from "./ChartManager.js";
import UIManager from "./UIManager.js";
import { PWAManager } from "./PWAManager.js";

document.addEventListener("DOMContentLoaded", () => {
  const transactionManager = new TransactionManager();
  const chartManager = new ChartManager(transactionManager);
  const uiManager = new UIManager(transactionManager, chartManager);
  const pwaManager = new PWAManager();

  function setLanguage(lang) {
    transactionManager.setCurrency(lang === "pl" ? "PLN" : "USD");
    window.dispatchEvent(new Event("languageChange"));
  }

  const preferredLanguage = localStorage.getItem("preferredLanguage");
  setLanguage(preferredLanguage);

  uiManager.updateTransactionsDisplay();
  uiManager.updateBalance();
  chartManager.updateChart();

  document.getElementById("lang-pl").addEventListener("click", () => setLanguage("pl"));
  document.getElementById("lang-en").addEventListener("click", () => setLanguage("en"));

  window.addEventListener("appinstalled", (evt) => {
    console.log("Aplikacja została zainstalowana", evt);
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./service-worker.js")
        .then((registration) => {
          console.log("Service Worker zarejestrowany pomyślnie:", registration);
        })
        .catch((error) => {
          console.error("Błąd podczas rejestracji Service Workera:", error);
        });
    });
  }

  window.addEventListener("storage", function (e) {
    console.log("Zmiana w storage:", e);
  });
});
