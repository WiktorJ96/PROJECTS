import "./styles/main.css";
import TranslationManager from "./scripts/TranslationManager.js";
import DataBaseManager from "./scripts/DataBaseManager.js";
import TransactionManager from "./scripts/TransactionManager.js";
import ChartManager from "./scripts/ChartManager.js";
import UIManager from "./scripts/UIManager.js";
import ThemeManager from "./scripts/ThemeManager.js";
import { PWAManager } from "./scripts/PWAManager.js";

class MainDev {
  constructor() {
    this.translationManager = new TranslationManager();

    this.databaseManager = new DataBaseManager();

    this.transactionManager = new TransactionManager();

    this.chartManager = new ChartManager(this.transactionManager);

    this.uiManager = new UIManager(this.transactionManager, this.chartManager);

    this.themeManager = new ThemeManager();

    this.pwaManager = new PWAManager();

    this.initLanguageSettings();
    this.setupEventListeners();
  }

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

  isPWA() {
    return window.matchMedia("(display-mode: standalone)").matches;
  }

  isDocker() {
    return process.env.ENVIRONMENT === "docker" || false;
  }
}

export default MainDev;

const mainApp = new MainDev();
