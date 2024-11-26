/**
 * Manages translations for the application.
 * Handles fetching, applying translations, and language switching.
 * Updates the UI dynamically based on the selected language.
 */
class TranslationManager {
  /**
   * Creates an instance of TranslationManager.
   * Initializes translations, sets the current language, and adds event listeners.
   *
   * @constructor
   */
  constructor() {
    /**
     * Stores the translations for different languages.
     * @type {Object}
     * @property {Object} pl - Translations for Polish.
     * @property {Object} en - Translations for English.
     */
    this.translations = {
      pl: {},
      en: {},
    };

    /**
     * The currently selected language.
     * Defaults to 'pl' if no preference is stored in localStorage.
     * @type {string}
     */
    this.currentLanguage = localStorage.getItem("preferredLanguage") || "pl";

    // Initialize language buttons and load the preferred language
    this.addLanguageListeners();
    this.loadPreferredLanguage();
  }

  /**
   * Fetches translations from a JSON file based on the given language.
   * The file path is determined dynamically based on the current page.
   *
   * @param {string} lang - The language code ('pl' or 'en').
   * @returns {Promise<Object>} Resolves to the translations object.
   */
  async fetchTranslations(lang) {
    const page = document.body.getAttribute("data-page");
    const path = `./translates/${page}-${lang}.json`;

    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error loading translations for ${lang}:`, error);
      return {};
    }
  }

  /**
   * Loads translations for the specified language and updates the page UI.
   *
   * @param {string} lang - The language code ('pl' or 'en').
   * @returns {Promise<void>} Resolves when translations are applied.
   */
  async loadTranslations(lang) {
    const data = await this.fetchTranslations(lang);
    this.translations[lang] = data;
    this.translatePage(lang);
  }

  /**
   * Sets the application language, updates UI, and stores the preference in localStorage.
   *
   * @param {string} lang - The language code ('pl' or 'en').
   */
  setLanguage(lang) {
    localStorage.setItem("preferredLanguage", lang);
    this.currentLanguage = lang;
    this.loadTranslations(lang);
    this.updateLanguageButtons(lang);

    // Dispatch a custom event to notify other parts of the app
    document.dispatchEvent(
      new CustomEvent("languageChanged", { detail: { language: lang } })
    );
  }

  /**
   * Loads the preferred language from localStorage and applies its translations.
   */
  loadPreferredLanguage() {
    this.loadTranslations(this.currentLanguage);
    this.updateLanguageButtons(this.currentLanguage);
  }

  /**
   * Translates all elements on the page based on the selected language.
   *
   * @param {string} lang - The language code ('pl' or 'en').
   */
  translatePage(lang) {
    // Translate elements with `data-lang-key`
    document.querySelectorAll("[data-lang-key]").forEach((element) => {
      const key = element.getAttribute("data-lang-key");
      if (this.translations[lang][key]) {
        element.innerHTML = this.translations[lang][key];
      } else {
        console.warn(`Missing translation for key: ${key}`);
        element.innerHTML = `[${key}]`;
      }
    });

    // Translate elements with `data-placeholder-key`
    document.querySelectorAll("[data-placeholder-key]").forEach((element) => {
      const key = element.getAttribute("data-placeholder-key");
      if (this.translations[lang][key]) {
        element.placeholder = this.translations[lang][key];
      } else {
        console.warn(`Missing placeholder translation for key: ${key}`);
      }
    });

    // Translate options in select elements
    document.querySelectorAll("select option").forEach((option) => {
      const key = option.getAttribute("data-lang-key");
      if (this.translations[lang][key]) {
        option.textContent = this.translations[lang][key];
      } else if (key) {
        console.warn(`Missing option translation for key: ${key}`);
        option.textContent = `[${key}]`;
      }
    });

    // Update the language attribute for accessibility
    document.documentElement.lang = lang;
  }

  /**
   * Adds event listeners for language selection buttons.
   */
  addLanguageListeners() {
    const langPl = document.getElementById("lang-pl");
    const langEn = document.getElementById("lang-en");

    if (langPl) {
      langPl.addEventListener("click", () => this.setLanguage("pl"));
    } else {
      console.warn("Polish language button not found");
    }

    if (langEn) {
      langEn.addEventListener("click", () => this.setLanguage("en"));
    } else {
      console.warn("English language button not found");
    }
  }

  /**
   * Updates the active state of language selection buttons.
   *
   * @param {string} lang - The currently selected language ('pl' or 'en').
   */
  updateLanguageButtons(lang) {
    const langPl = document.getElementById("lang-pl");
    const langEn = document.getElementById("lang-en");

    if (langPl) langPl.classList.remove("active");
    if (langEn) langEn.classList.remove("active");

    if (lang === "pl" && langPl) {
      langPl.classList.add("active");
    } else if (lang === "en" && langEn) {
      langEn.classList.add("active");
    }
  }
}

export default TranslationManager;
