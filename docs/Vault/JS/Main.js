import TransactionManager from "./TransactionManager.js";
import ChartManager from "./ChartManager.js";
import UIManager from "./UIManager.js";
import ThemeManager from "./ThemeManager.js";
import { PWAManager } from "./PWAManager.js";

document.addEventListener("DOMContentLoaded", async () => {
  const transactionManager = new TransactionManager();
  const chartManager = new ChartManager(transactionManager);
  const uiManager = new UIManager(transactionManager, chartManager);
  const themeManager = new ThemeManager();
  const pwaManager = new PWAManager();

  function isPWA() {
    return window.matchMedia("(display-mode: standalone)").matches;
  }

  function isDocker() {
    return process.env.ENVIRONMENT === "docker";
  }

  // Zaktualizuj UI po załadowaniu transakcji
  window.addEventListener("transactionsLoaded", () => {
    uiManager.updateTransactionsDisplay();
    uiManager.updateBalance();
    chartManager.updateChart();
  });

  // Ustaw preferowany język
  const preferredLanguage = localStorage.getItem("preferredLanguage") || "en";
  uiManager.setLanguage(preferredLanguage);

  // Obsługa zmiany języka
  document.getElementById("lang-pl").addEventListener("click", () => {
    uiManager.setLanguage("pl");
    window.dispatchEvent(new Event("languageChange"));
  });

  document.getElementById("lang-en").addEventListener("click", () => {
    uiManager.setLanguage("en");
    window.dispatchEvent(new Event("languageChange"));
  });
});
