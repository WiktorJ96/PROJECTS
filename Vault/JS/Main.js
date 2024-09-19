import TransactionManager from "./TransactionManager.js";
import ChartManager from "./ChartManager.js";
import UIManager from "./UIManager.js";

document.addEventListener("DOMContentLoaded", () => {
  const transactionManager = new TransactionManager();
  const chartManager = new ChartManager(transactionManager);
  const uiManager = new UIManager(transactionManager, chartManager);

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
});
