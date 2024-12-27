import { JSDOM } from "jsdom";
import TranslationManager from "../src/scripts/TranslationManager.js";

const { window } = new JSDOM(
  "<!doctype html><html><body>" +
    "<div data-lang-key='greeting'></div>" +
    "<input data-placeholder-key='search' />" +
    "<select><option data-lang-key='option1'></option></select>" +
    "<button id='lang-pl'>PL</button>" +
    "<button id='lang-en'>EN</button>" +
    "</body></html>",
  { url: "http://localhost/" }
);

global.window = window;
global.document = window.document;
global.localStorage = {
  getItem: jasmine.createSpy("getItem").and.returnValue(null),
  setItem: jasmine.createSpy("setItem"),
};

global.fetch = jasmine.createSpy("fetch").and.callFake((path) => {
  if (path.includes("pl")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          greeting: "Witaj",
          search: "Szukaj",
          option1: "Opcja 1",
        }),
    });
  } else if (path.includes("en")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          greeting: "Hello",
          search: "Search",
          option1: "Option 1",
        }),
    });
  }
  return Promise.reject(new Error("File not found"));
});

/**
 * Test suite for the TranslationManager class.
 * Ensures proper functionality for managing translations and UI updates.
 *
 * @module TranslationManagerTests
 */
describe("TranslationManager", () => {
  let translationManager;

  /**
   * Sets up a new instance of TranslationManager before each test.
   *
   * @method beforeEach
   * @memberof module:TranslationManagerTests
   * @returns {void}
   */
  beforeEach(() => {
    translationManager = new TranslationManager();
  });

  /**
   * Verifies the initialization of TranslationManager with the default language.
   *
   * @method initializeDefaultLanguage
   * @memberof module:TranslationManagerTests
   * @returns {void}
   */
  it("should initialize with default language 'pl'", () => {
    localStorage.getItem.and.returnValue(null);
    const translationManager = new TranslationManager();
    expect(translationManager.currentLanguage).toBe("pl");
  });

  /**
   * Tests setting the language, updating UI, and storing preference in localStorage.
   *
   * @method setLanguage
   * @memberof module:TranslationManagerTests
   * @returns {Promise<void>}
   */
  it("should set the language, update UI, and store preference in localStorage", async () => {
    await translationManager.setLanguage("en");
    expect(global.localStorage.setItem).toHaveBeenCalledWith(
      "preferredLanguage",
      "en"
    );
    expect(document.documentElement.lang).toBe("en");

    const greetingElement = document.querySelector(
      "[data-lang-key='greeting']"
    );
    expect(greetingElement.textContent).toBe("Hello");
  });

  /**
   * Tests fetching and applying translations for a different language.
   *
   * @method fetchAndApplyTranslations
   * @memberof module:TranslationManagerTests
   * @returns {Promise<void>}
   */
  it("should fetch and apply translations for another language (pl -> en)", async () => {
    await translationManager.setLanguage("en");

    const greetingElement = document.querySelector(
      "[data-lang-key='greeting']"
    );
    const searchElement = document.querySelector(
      "[data-placeholder-key='search']"
    );
    const optionElement = document.querySelector("select option");

    expect(greetingElement.textContent).toBe("Hello");
    expect(searchElement.placeholder).toBe("Search");
    expect(optionElement.textContent).toBe("Option 1");
  });

  /**
   * Tests loading the preferred language from localStorage.
   *
   * @method loadPreferredLanguage
   * @memberof module:TranslationManagerTests
   * @returns {Promise<void>}
   */
  it("should load preferred language from localStorage", async () => {
    global.localStorage.getItem.and.returnValue("en");
    translationManager = new TranslationManager();

    await translationManager.setLanguage("en");
    expect(translationManager.currentLanguage).toBe("en");

    const greetingElement = document.querySelector(
      "[data-lang-key='greeting']"
    );
    expect(greetingElement.textContent).toBe("Hello");
  });

  /**
   * Verifies event listeners are added to language buttons.
   *
   * @method addLanguageListeners
   * @memberof module:TranslationManagerTests
   * @returns {void}
   */
  it("should add event listeners to language buttons", () => {
    const langPlButton = document.getElementById("lang-pl");
    const langEnButton = document.getElementById("lang-en");

    spyOn(langPlButton, "addEventListener").and.callThrough();
    spyOn(langEnButton, "addEventListener").and.callThrough();

    translationManager.addLanguageListeners();

    expect(langPlButton.addEventListener).toHaveBeenCalledWith(
      "click",
      jasmine.any(Function)
    );
    expect(langEnButton.addEventListener).toHaveBeenCalledWith(
      "click",
      jasmine.any(Function)
    );
  });

  /**
   * Tests updating the active state of language buttons.
   *
   * @method updateLanguageButtons
   * @memberof module:TranslationManagerTests
   * @returns {void}
   */
  it("should update active state of language buttons", () => {
    const langPlButton = document.getElementById("lang-pl");
    const langEnButton = document.getElementById("lang-en");

    translationManager.updateLanguageButtons("pl");
    expect(langPlButton.classList.contains("active")).toBeTrue();
    expect(langEnButton.classList.contains("active")).toBeFalse();

    translationManager.updateLanguageButtons("en");
    expect(langPlButton.classList.contains("active")).toBeFalse();
    expect(langEnButton.classList.contains("active")).toBeTrue();
  });

  /**
   * Verifies handling of missing translations with default placeholder.
   *
   * @method handleMissingTranslations
   * @memberof module:TranslationManagerTests
   * @returns {Promise<void>}
   */
  it("should handle missing translations gracefully", async () => {
    await translationManager.setLanguage("en");

    const missingElement = document.createElement("div");
    missingElement.setAttribute("data-lang-key", "missingKey");
    document.body.appendChild(missingElement);

    translationManager.translatePage("en");

    expect(missingElement.textContent).toBe("[missingKey]");
  });

  /**
   * Ensures a custom event is dispatched when the language changes.
   *
   * @method dispatchLanguageChangeEvent
   * @memberof module:TranslationManagerTests
   * @returns {Promise<void>}
   */
  it("should dispatch a custom event when the language changes", async () => {
    spyOn(document, "dispatchEvent").and.callThrough();

    await translationManager.setLanguage("en");
    const lastCallArg = document.dispatchEvent.calls.mostRecent().args[0];

    expect(lastCallArg.type).toBe("languageChanged");
    expect(lastCallArg.detail).toEqual({ language: "en" });
  });
});
