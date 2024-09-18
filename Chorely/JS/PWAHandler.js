export class PWAHandler {
    constructor() {
        this.installButton = document.querySelector('.installButton');
        this.deferredPrompt = null;

        this.setupPWA();
    }

    setupPWA() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.hideInstallButton();
            return;
        }

        window.addEventListener('beforeinstallprompt', (e) => {
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

        if (this.installButton) {
            this.installButton.addEventListener('click', () => this.installPWA());
        }
    }

    showInstallButton() {
        if (this.installButton) {
            this.installButton.style.display = 'block';
        }
    }

    hideInstallButton() {
        if (this.installButton) {
            this.installButton.style.display = 'none';
        }
    }

    showIOSInstallInstructions() {
        const iosInstructions = document.createElement('div');
        iosInstructions.innerHTML = `
            <p>Aby zainstalować tę aplikację na iOS:</p>
            <ol>
                <li>Dotknij ikony "Udostępnij" w przeglądarce</li>
                <li>Wybierz "Dodaj do ekranu głównego"</li>
            </ol>
        `;
        document.body.appendChild(iosInstructions);
    }

    installPWA() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            this.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    this.hideInstallButton();
                }
                this.deferredPrompt = null;
            });
        } else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
            alert('Aby zainstalować aplikację, użyj opcji "Dodaj do ekranu głównego" w menu udostępniania przeglądarki.');
        }
    }
}