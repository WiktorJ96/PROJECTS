/**
 * Manages Progressive Web App (PWA) functionality.
 * Handles installation prompts, tailored instructions for iOS users,
 * and UI updates for PWA-related features.
 */
export class PWAManager {
  /**
   * Creates an instance of PWAManager.
   * Initializes the PWA functionality by storing the installation prompt
   * event and setting up the installation button in the DOM.
   *
   * @constructor
   */
  constructor() {
    /**
     * Stores the `beforeinstallprompt` event, allowing the app
     * to show the installation prompt later.
     * @type {Event|null}
     */
    this.deferredPrompt = null;

    /**
     * Reference to the installation button element in the DOM.
     * This button is shown to the user when the app is installable.
     * @type {HTMLElement|null}
     */
    this.installButton = document.querySelector(".installButton");

    this.init();
  }

  /**
   * Initializes the PWA Manager.
   * Sets up event listeners for installation prompts and handles
   * specific behaviors for iOS devices.
   *
   * @returns {void}
   */
  init() {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      this.hideInstallButton();
      return;
    }

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    if (
      navigator.standalone === false &&
      /iPhone|iPad|iPod/.test(navigator.userAgent)
    ) {
      this.showIOSInstallInstructions();
    }

    window.addEventListener("appinstalled", () => {
      this.hideInstallButton();
    });

    if (this.installButton) {
      this.installButton.addEventListener("click", () => this.installPWA());
    }
  }

  /**
   * Displays the installation button.
   * Sets the button's `display` property to `block`.
   *
   * @returns {void}
   */
  showInstallButton() {
    if (this.installButton) {
      this.installButton.style.display = "block";
    }
  }

  /**
   * Hides the installation button.
   * Sets the button's `display` property to `none`.
   *
   * @returns {void}
   */
  hideInstallButton() {
    if (this.installButton) {
      this.installButton.style.display = "none";
    }
  }

  /**
   * Displays tailored installation instructions for iOS devices.
   * Dynamically creates a DOM element containing step-by-step instructions
   * for adding the app to the home screen.
   *
   * @returns {void}
   */
  showIOSInstallInstructions() {
    const iosInstructions = document.createElement("div");
    iosInstructions.innerHTML = `
      <p>To install this app on iOS:</p>
      <ol>
        <li>Tap the "Share" icon in your browser.</li>
        <li>Select "Add to Home Screen".</li>
      </ol>
    `;
    document.body.appendChild(iosInstructions);
  }

  /**
   * Handles the PWA installation process.
   * Prompts the user using the `beforeinstallprompt` event or displays
   * tailored instructions for iOS devices.
   *
   * @returns {void}
   */
  installPWA() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          this.hideInstallButton();
        }
        this.deferredPrompt = null;
      });
    } else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      alert(
        'To install the app, use the "Add to Home Screen" option from the browser\'s share menu.'
      );
    }
  }
}
