/**
 * Inicjalizuje aplikację i zarządza jej głównymi komponentami. // PL
 * Initializes the application and manages its main components. // EN
 * @module App
 */

import TransactionManager from "./TransactionManager.js";
import ChartManager from "./ChartManager.js";
import UIManager from "./UIManager.js";
import ThemeManager from "./ThemeManager.js";
import { PWAManager } from "./PWAManager.js";

/**
 * Funkcja główna wykonywana po załadowaniu DOM. // PL
 * Main function executed after DOM is loaded. // EN
 * Tworzy instancje menedżerów i ustawia preferowany język oraz obsługę PWA. // PL
 * Creates manager instances and sets the preferred language and PWA handling. // EN
 * @event DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", async () => {
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

  /**
   * Ustawia preferowany język na podstawie zapisanej wartości w LocalStorage. // PL
   * Sets the preferred language based on the stored value in LocalStorage. // EN
   * @type {string}
   */
  const preferredLanguage = localStorage.getItem("preferredLanguage") || "pl";
  uiManager.setLanguage(preferredLanguage);

  /**
   * Obsługuje kliknięcie przycisku zmiany języka na polski. // PL
   * Handles the click event for changing the language to Polish. // EN
   * @event click
   */
  document.getElementById("lang-pl").addEventListener("click", () => {
    uiManager.setLanguage("pl");
    window.dispatchEvent(new Event("languageChange"));
  });

  /**
   * Obsługuje kliknięcie przycisku zmiany języka na angielski. // PL
   * Handles the click event for changing the language to English. // EN
   * @event click
   */
  document.getElementById("lang-en").addEventListener("click", () => {
    uiManager.setLanguage("en");
    window.dispatchEvent(new Event("languageChange"));
  });
});
