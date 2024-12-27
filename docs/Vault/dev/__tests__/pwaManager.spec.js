import { JSDOM } from "jsdom";
import { PWAManager } from "../src/scripts/PWAManager.js";

// Initialize DOM
const { window } = new JSDOM(
  '<!doctype html><html><body><button class="installButton"></button></body></html>'
);
global.window = window;
global.document = window.document;

/**
 * Test suite for the PWAManager class.
 * Validates initialization, event handling, and UI updates for PWA functionality.
 *
 * @module PWAManagerTests
 */
describe("PWAManager", () => {
  let pwaManager, installButton;

  /**
   * Sets up mock for `alert` function globally before all tests.
   *
   * @method beforeAll
   * @memberof module:PWAManagerTests
   * @returns {void}
   */
  beforeAll(() => {
    global.alert = jasmine.createSpy("alert");
  });

  /**
   * Sets up the test environment before each test.
   * Mocks navigator properties, initializes DOM, and creates an instance of PWAManager.
   *
   * @method beforeEach
   * @memberof module:PWAManagerTests
   * @returns {void}
   */
  beforeEach(() => {
    // Mock navigator.userAgent and navigator.standalone
    global.navigator = global.navigator || {};
    Object.defineProperty(global.navigator, "userAgent", {
      configurable: true,
      get: () =>
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A372 Safari/604.1",
    });

    Object.defineProperty(global.navigator, "standalone", {
      configurable: true,
      value: false,
    });

    // Mock window.matchMedia
    global.window.matchMedia = function (query) {
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: function () {},
        removeListener: function () {},
        addEventListener: function () {},
        removeEventListener: function () {},
        dispatchEvent: function () {},
      };
    };

    // Initialize DOM and PWAManager
    installButton = document.querySelector(".installButton");
    pwaManager = new PWAManager();
  });

  /**
   * Tests if the PWA Manager initializes properly by calling the `init` method.
   *
   * @method initPWA
   * @memberof module:PWAManagerTests
   * @returns {void}
   */
  it("should initialize the PWA Manager", () => {
    spyOn(PWAManager.prototype, "init").and.callThrough();
    const newManager = new PWAManager();
    expect(newManager.init).toHaveBeenCalled();
  });

  /**
   * Validates handling of the `beforeinstallprompt` event and showing the install button.
   *
   * @method handleBeforeInstallPrompt
   * @memberof module:PWAManagerTests
   * @returns {void}
   */
  it("should handle the `beforeinstallprompt` event and show the install button", () => {
    const mockEvent = new window.Event("beforeinstallprompt", {
      bubbles: true,
      cancelable: true,
    });

    // Mock prompt and preventDefault
    Object.defineProperty(mockEvent, "prompt", {
      value: jasmine.createSpy("prompt"),
      writable: true,
    });

    Object.defineProperty(mockEvent, "preventDefault", {
      value: jasmine.createSpy("preventDefault"),
      writable: true,
    });

    // Dispatch the event
    window.dispatchEvent(mockEvent);

    // Expectations
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(pwaManager.deferredPrompt).toBe(mockEvent);
    expect(installButton.style.display).toBe("block");
  });

  /**
   * Tests if the iOS installation instructions are displayed correctly.
   *
   * @method showIOSInstallInstructions
   * @memberof module:PWAManagerTests
   * @returns {void}
   */
  it("should display iOS installation instructions", () => {
    pwaManager.showIOSInstallInstructions();

    const iosInstructions = document.querySelector("div");
    expect(iosInstructions).not.toBeNull();
    expect(iosInstructions.innerHTML).toContain("Add to Home Screen");
  });

  /**
   * Validates that an alert is shown for iOS users with installation instructions
   * when `deferredPrompt` is null.
   *
   * @method alertIOSInstallInstructions
   * @memberof module:PWAManagerTests
   * @returns {void}
   */
  it("should alert iOS users with installation instructions when `deferredPrompt` is null", () => {
    pwaManager.deferredPrompt = null;
    pwaManager.installPWA();

    expect(global.alert).toHaveBeenCalledWith(
      'To install the app, use the "Add to Home Screen" option from the browser\'s share menu.'
    );
  });

  /**
   * Tests if the install button is displayed.
   *
   * @method showInstallButton
   * @memberof module:PWAManagerTests
   * @returns {void}
   */
  it("should display the install button", () => {
    pwaManager.showInstallButton();

    expect(installButton.style.display).toBe("block");
  });

  /**
   * Tests if the install button is hidden.
   *
   * @method hideInstallButton
   * @memberof module:PWAManagerTests
   * @returns {void}
   */
  it("should hide the install button", () => {
    pwaManager.hideInstallButton();

    expect(installButton.style.display).toBe("none");
  });

  /**
   * Validates the PWA installation process when `deferredPrompt` exists.
   * Ensures the install button is hidden and `deferredPrompt` is cleared after installation.
   *
   * @method handlePWAInstallation
   * @memberof module:PWAManagerTests
   * @returns {void}
   */
  it("should handle PWA installation process when `deferredPrompt` exists", () => {
    const mockEvent = {
      prompt: jasmine.createSpy("prompt"),
      userChoice: Promise.resolve({ outcome: "accepted" }),
    };

    pwaManager.deferredPrompt = mockEvent;
    spyOn(pwaManager, "hideInstallButton").and.callThrough();

    pwaManager.installPWA();

    expect(mockEvent.prompt).toHaveBeenCalled();

    mockEvent.userChoice.then(() => {
      expect(pwaManager.hideInstallButton).toHaveBeenCalled();
      expect(pwaManager.deferredPrompt).toBeNull();
    });
  });
});
