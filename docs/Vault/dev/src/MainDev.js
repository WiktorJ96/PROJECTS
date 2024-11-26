import TranslationManager from "./scripts/TranslationManager.js";
import DataBaseManager from "./scripts/DataBaseManager.js";
import TransactionManager from "./scripts/TransactionManager.js";
import ChartManager from "./scripts/ChartManager.js";
import UIManager from "./scripts/UIManager.js";
import ThemeManager from "./scripts/ThemeManager.js";
import { PWAManager } from "./scripts/PWAManager.js";

/**
 * @class MainDev
 * @classdesc Main entry point of the application.
 * Initializes various managers, sets up event listeners, and manages application-wide behaviors
 * like language selection, theme handling, and PWA support.
 */
class MainDev {
  constructor() {
    /**
     * @property {TranslationManager} translationManager
     * Manages translations for the application.
     */
    this.translationManager = new TranslationManager();

    /**
     * @property {DataBaseManager} databaseManager
     * Handles database operations, including saving and retrieving transactions.
     */
    this.databaseManager = new DataBaseManager();

    /**
     * @property {TransactionManager} transactionManager
     * Manages transactions, including adding, editing, and deleting them.
     */
    this.transactionManager = new TransactionManager();

    /**
     * @property {ChartManager} chartManager
     * Manages rendering and updating charts with transaction data.
     */
    this.chartManager = new ChartManager(this.transactionManager);

    /**
     * @property {UIManager} uiManager
     * Manages the User Interface (UI), including user interactions and dynamic updates.
     */
    this.uiManager = new UIManager(this.transactionManager, this.chartManager);

    /**
     * @property {ThemeManager} themeManager
     * Manages theme-related functionality, such as light/dark mode toggling.
     */
    this.themeManager = new ThemeManager();

    /**
     * @property {PWAManager} pwaManager
     * Manages Progressive Web App (PWA) features.
     */
    this.pwaManager = new PWAManager();

    this.initLanguageSettings();
    this.setupEventListeners();
  }

  /**
   * Initializes language-related settings and buttons.
   * Sets the language based on user preferences stored in localStorage.
   */
  initLanguageSettings() {
    // Set the initial language using TranslationManager
    const initialLanguage = this.translationManager.currentLanguage;
    this.translationManager.setLanguage(initialLanguage);

    // Update UIManager to use the initial language
    this.uiManager.setLanguage(initialLanguage);

    // Listen for language change events
    document.addEventListener("languageChanged", (event) => {
      const lang = event.detail.language;
      this.uiManager.setLanguage(lang); // Update UIManager
      this.chartManager.updateLanguage(); // Update charts
    });
  }

  /**
   * Sets up global event listeners for the application.
   */
  setupEventListeners() {
    window.addEventListener("transactionsLoaded", () => {
      this.uiManager.updateTransactionsDisplay();
      this.uiManager.updateBalance();
      this.chartManager.updateChart();
    });

    window.addEventListener("themeChange", () => {
      const isDark = document.body.classList.contains("dark-theme");
      this.chartManager.setTheme(isDark);
    });
  }

  /**
   * Checks if the application is running in Progressive Web App (PWA) mode.
   * Determines if the app is opened in "standalone" mode or in a browser tab.
   *
   * @returns {boolean} True if running as a PWA, false otherwise.
   */
  isPWA() {
    return window.matchMedia("(display-mode: standalone)").matches;
  }

  /**
   * Determines if the application is running inside a Docker container.
   *
   * @returns {boolean} True if running in Docker, false otherwise.
   */
  isDocker() {
    return process.env.ENVIRONMENT === "docker" || false;
  }
}

export default MainDev;

const mainApp = new MainDev();
