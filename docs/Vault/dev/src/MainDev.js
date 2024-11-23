/**
 * Inicjalizuje aplikację i zarządza jej głównymi komponentami. // PL
 * Initializes the application and manages its main components. // EN
 * @module App
 */
import DataBaseManager from "./scripts/DataBaseManager.js";
import TransactionManager from "./scripts/TransactionManager.js";
import ChartManager from "./scripts/ChartManager.js";
import UIManager from "./scripts/UIManager.js";
import ThemeManager from "./scripts/ThemeManager.js";
import { PWAManager } from "./scripts/PWAManager.js";

/**
 * Funkcja główna wykonywana po załadowaniu DOM. // PL
 * Main function executed after DOM is loaded. // EN
 * Tworzy instancje menedżerów i ustawia preferowany język oraz obsługę PWA. // PL
 * Creates manager instances and sets the preferred language and PWA handling. // EN
 * @event DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", async () => {

  const databaseManager = new DataBaseManager();
  /**
   * Instancja zarządzająca transakcjami użytkownika. // PL
   * Instance managing user transactions. // EN
   * @type {TransactionManager}
   */
  const transactionManager = new TransactionManager();

  /**
   * Instancja zarządzająca wykresem salda. // PL
   * Instance managing the balance chart. // EN
   * @type {ChartManager}
   */
  const chartManager = new ChartManager(transactionManager);

  /**
   * Instancja zarządzająca interfejsem użytkownika. // PL
   * Instance managing the user interface. // EN
   * @type {UIManager}
   */
  const uiManager = new UIManager(transactionManager, chartManager);

  /**
   * Instancja zarządzająca motywami (jasny/ciemny). // PL
   * Instance managing themes (light/dark). // EN
   * @type {ThemeManager}
   */
  const themeManager = new ThemeManager();

  /**
   * Instancja zarządzająca funkcjami Progressive Web App (PWA). // PL
   * Instance managing Progressive Web App (PWA) features. // EN
   * @type {PWAManager}
   */
  const pwaManager = new PWAManager();

  /**
   * Sprawdza, czy aplikacja działa w trybie PWA. // PL
   * Checks if the application is running in PWA mode. // EN
   * @returns {boolean} `true` jeśli aplikacja działa jako PWA, `false` w przeciwnym razie. // PL
   * `true` if the application runs as PWA, `false` otherwise. // EN
   */
  function isPWA() {
    return window.matchMedia("(display-mode: standalone)").matches;
  }

  /**
   * Sprawdza, czy aplikacja działa w środowisku Docker. // PL
   * Checks if the application is running in a Docker environment. // EN
   * @returns {boolean} `true` jeśli aplikacja działa w Dockerze, `false` w przeciwnym razie. // PL
   * `true` if the application is running in Docker, `false` otherwise. // EN
   */
  function isDocker() {
    return process.env.ENVIRONMENT === "docker";
  }

  /**
   * Obsługuje zdarzenie załadowania transakcji. // PL
   * Handles the transaction load event. // EN
   * Aktualizuje interfejs użytkownika i wykres. // PL
   * Updates the user interface and chart. // EN
   * @event transactionsLoaded
   */
  window.addEventListener("transactionsLoaded", () => {
    uiManager.updateTransactionsDisplay();
    uiManager.updateBalance();
    chartManager.updateChart();
  });

  
  const langPlButton = document.getElementById("lang-pl");
  const langEnButton = document.getElementById("lang-en");

  if (langPlButton) {
    langPlButton.addEventListener("click", () => {
      uiManager.setLanguage("pl");
      window.dispatchEvent(new Event("languageChange"));
    });
  }

  if (langEnButton) {
    langEnButton.addEventListener("click", () => {
      uiManager.setLanguage("en");
      window.dispatchEvent(new Event("languageChange"));
    });
  }

});
