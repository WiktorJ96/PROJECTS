import { JSDOM } from "jsdom";
import ThemeManager from "../src/scripts/ThemeManager.js";

// Initialize DOM
const { window } = new JSDOM(
  '<!doctype html><html><body><button id="theme-toggle"></button></body></html>'
);
global.window = window;
global.document = window.document;

/**
 * Mock implementation of the `localStorage` API.
 * Simulates browser's localStorage behavior for testing purposes.
 *
 * @member {object}
 * @memberof module:ThemeManagerTests
 * @property {function} getItem - Mocked method to retrieve an item.
 * @property {function} setItem - Mocked method to store an item.
 * @property {function} clear - Mocked method to clear storage.
 *
 * @source ThemeManager.test.js, line 10
 */
global.localStorage = {
  getItem: jasmine.createSpy("getItem").and.returnValue("light"),
  setItem: jasmine.createSpy("setItem"),
  clear: jasmine.createSpy("clear"),
};

/**
 * Mock implementation of the `CustomEvent` API.
 * Simulates browser's CustomEvent for dispatching events during tests.
 *
 * @member {function}
 * @memberof module:ThemeManagerTests
 * @source ThemeManager.test.js, line 20
 */
global.CustomEvent = window.CustomEvent;

/**
 * Test suite for the ThemeManager class.
 * Contains unit tests that validate the behavior of ThemeManager methods.
 * Ensures correct functionality, including theme persistence, UI updates,
 * and event handling.
 *
 * @module ThemeManagerTests
 * @source ThemeManager.test.js, line 1
 */
describe("ThemeManager", () => {
  let themeToggle;

  /**
   * Sets up test environment before each test.
   * Initializes the DOM elements and spies on key methods.
   *
   * @method beforeEach
   * @memberof module:ThemeManagerTests
   * @returns {void}
   * @source ThemeManager.test.js, line 33
   */
  beforeEach(() => {
    themeToggle = document.getElementById("theme-toggle");
    spyOn(ThemeManager.prototype, "setTheme").and.callThrough();
  });

  /**
   * Validates that the ThemeManager initializes correctly with the theme
   * stored in localStorage.
   *
   * @method initTheme
   * @memberof module:ThemeManagerTests
   * @description Ensures the `initTheme` method is called and invokes `setTheme` with the correct value.
   * @returns {void}
   * @source ThemeManager.test.js, line 42
   */
  it("should initialize with the theme from localStorage", () => {
    spyOn(ThemeManager.prototype, "initTheme").and.callThrough();

    const themeManager = new ThemeManager();

    expect(themeManager.initTheme).toHaveBeenCalled();
    expect(themeManager.setTheme).toHaveBeenCalledWith("light");
  });

  /**
   * Ensures the ThemeManager attaches a click event listener to the theme toggle button.
   *
   * @method addEventListeners
   * @memberof module:ThemeManagerTests
   * @description Tests if the event listener is added to the theme toggle button.
   * @returns {void}
   * @source ThemeManager.test.js, line 55
   */
  it("should add event listeners to the theme toggle button", () => {
    const themeManager = new ThemeManager();
    spyOn(themeToggle, "addEventListener");
    themeManager.addEventListeners();
    expect(themeToggle.addEventListener).toHaveBeenCalledWith(
      "click",
      jasmine.any(Function)
    );
  });

  /**
   * Tests toggling the theme from light to dark.
   *
   * @method toggleThemeLightToDark
   * @memberof module:ThemeManagerTests
   * @description Ensures the ThemeManager toggles the theme to dark mode and updates the UI accordingly.
   * @returns {void}
   * @source ThemeManager.test.js, line 66
   */
  it("should toggle the theme from light to dark", () => {
    const themeManager = new ThemeManager();
    themeManager.currentTheme = "light";
    themeManager.toggleTheme();

    expect(themeManager.currentTheme).toBe("dark");
    expect(themeManager.setTheme).toHaveBeenCalledWith("dark");
  });

  /**
   * Tests toggling the theme from dark to light.
   *
   * @method toggleThemeDarkToLight
   * @memberof module:ThemeManagerTests
   * @description Ensures the ThemeManager toggles the theme to light mode and updates the UI accordingly.
   * @returns {void}
   * @source ThemeManager.test.js, line 78
   */
  it("should toggle the theme from dark to light", () => {
    const themeManager = new ThemeManager();
    themeManager.currentTheme = "dark";
    themeManager.toggleTheme();

    expect(themeManager.currentTheme).toBe("light");
    expect(themeManager.setTheme).toHaveBeenCalledWith("light");
  });

  /**
   * Validates the `<body>` element class updates based on the current theme.
   *
   * @method setTheme
   * @memberof module:ThemeManagerTests
   * @description Tests if the body class is updated to reflect the current theme.
   * @returns {void}
   * @source ThemeManager.test.js, line 88
   */
  it("should update the body's class based on the current theme", () => {
    const themeManager = new ThemeManager();
    themeManager.setTheme("dark");

    expect(document.body.classList.contains("dark-theme")).toBeTrue();
    expect(document.body.classList.contains("light-theme")).toBeFalse();

    themeManager.setTheme("light");

    expect(document.body.classList.contains("light-theme")).toBeTrue();
    expect(document.body.classList.contains("dark-theme")).toBeFalse();
  });

  /**
   * Tests theme persistence in localStorage.
   *
   * @method persistTheme
   * @memberof module:ThemeManagerTests
   * @description Ensures that the current theme is saved to localStorage when updated.
   * @returns {void}
   * @source ThemeManager.test.js, line 105
   */
  it("should persist the current theme in localStorage", () => {
    const themeManager = new ThemeManager();
    themeManager.setTheme("dark");
    expect(localStorage.setItem).toHaveBeenCalledWith("theme", "dark");

    themeManager.setTheme("light");
    expect(localStorage.setItem).toHaveBeenCalledWith("theme", "light");
  });

  /**
   * Verifies that a custom `themeChange` event is dispatched when the theme changes.
   *
   * @method dispatchThemeChangeEvent
   * @memberof module:ThemeManagerTests
   * @description Ensures the event contains the current theme details in its payload.
   * @returns {void}
   * @source ThemeManager.test.js, line 120
   */
  it("should dispatch a custom themeChange event", () => {
    const themeManager = new ThemeManager();
    spyOn(window, "dispatchEvent").and.callThrough();

    themeManager.setTheme("dark");

    expect(window.dispatchEvent).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: "themeChange",
        detail: { theme: "dark" },
      })
    );

    themeManager.setTheme("light");

    expect(window.dispatchEvent).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: "themeChange",
        detail: { theme: "light" },
      })
    );
  });

  /**
   * Validates updates to the toggle button's UI and accessibility attributes.
   *
   * @method updateToggleButton
   * @memberof module:ThemeManagerTests
   * @description Ensures the button reflects the current theme and provides proper ARIA support.
   * @returns {void}
   * @source ThemeManager.test.js, line 139
   */
  it("should update the toggle button's UI and accessibility attributes", () => {
    const themeManager = new ThemeManager();
    themeManager.setTheme("dark");

    expect(themeToggle.innerHTML).toBe('<i class="fas fa-sun"></i>');
    expect(themeToggle.getAttribute("aria-label")).toBe("Switch to light mode");

    themeManager.setTheme("light");

    expect(themeToggle.innerHTML).toBe('<i class="fas fa-moon"></i>');
    expect(themeToggle.getAttribute("aria-label")).toBe("Switch to dark mode");
  });
});
