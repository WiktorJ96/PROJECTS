/**
 * Manages the application's theme (light or dark mode).
 * Handles theme initialization, switching, and persistence using localStorage.
 * Provides a seamless user experience by remembering the user's preference.
 */
class ThemeManager {
  /**
   * Initializes a new instance of the ThemeManager class.
   * Sets up the theme based on user preferences and prepares event listeners.
   *
   * @constructor
   */
  constructor() {
    /**
     * The button used to toggle between light and dark themes.
     * @type {HTMLElement}
     */
    this.themeToggle = document.getElementById("theme-toggle");

    /**
     * The `<body>` element where the theme class is applied.
     * @type {HTMLElement}
     */
    this.body = document.body;

    /**
     * The current theme ("light" or "dark").
     * Defaults to "light" if no theme is found in localStorage.
     * @type {string}
     */
    this.currentTheme = localStorage.getItem("theme") || "light";

    this.initTheme();
    this.addEventListeners();
  }

  /**
   * Initializes the theme by applying the current theme stored in localStorage.
   * Updates the UI to reflect the user's theme preference.
   *
   * @returns {void}
   */
  initTheme() {
    this.setTheme(this.currentTheme);
  }

  /**
   * Adds event listeners for user interactions, such as toggling the theme.
   *
   * @returns {void}
   */
  addEventListeners() {
    this.themeToggle.addEventListener("click", () => this.toggleTheme());
  }

  /**
   * Toggles the theme between light and dark modes.
   * Updates the UI and saves the user's preference to localStorage.
   *
   * @returns {void}
   */
  toggleTheme() {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
    this.setTheme(this.currentTheme);
  }

  /**
   * Sets the current theme by updating the `<body>` class, saving to localStorage,
   * and dispatching a custom "themeChange" event.
   *
   * @param {string} theme - The theme to be applied ("light" or "dark").
   * @returns {void}
   * @fires ThemeManager#themeChange
   */
  setTheme(theme) {
    this.currentTheme = theme;

    // Update <body> class
    this.body.classList.remove("light-theme", "dark-theme");
    this.body.classList.add(`${this.currentTheme}-theme`);

    // Persist the theme in localStorage
    localStorage.setItem("theme", this.currentTheme);

    // Update the toggle button UI
    this.updateToggleButton();

    /**
     * Event triggered when the theme is changed.
     *
     * @type {CustomEvent}
     * @property {Object} detail - Contains the current theme.
     */
    const event = new CustomEvent("themeChange", {
      detail: { theme: this.currentTheme },
    });
    window.dispatchEvent(event);
  }

  /**
   * Updates the toggle button's icon and ARIA label based on the current theme.
   * Provides accessibility support for screen readers.
   *
   * @returns {void}
   */
  updateToggleButton() {
    if (this.currentTheme === "dark") {
      this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      this.themeToggle.setAttribute("aria-label", "Switch to light mode");
    } else {
      this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      this.themeToggle.setAttribute("aria-label", "Switch to dark mode");
    }
  }
}

export default ThemeManager;
