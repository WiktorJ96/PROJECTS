
document.addEventListener('DOMContentLoaded', function () {
    const translations = {
        "pl": {},
        "en": {}
    };

    fetch('pl.json')
        .then(response => response.json())
        .then(data => {
            translations['pl'] = data;
        });

    fetch('en.json')
        .then(response => response.json())
        .then(data => {
            translations['en'] = data;
        });

    function loadTranslations(lang) {
        const page = document.body.getAttribute('data-page');
        fetch(`../translations/${page}-${lang}.json`)
            .then(response => response.json())
            .then(data => {
                translations[lang] = data;
                translatePage(lang);
            })
            .catch(error => console.error(`Error loading translations for ${lang}:`, error));
    }

    function setLanguage(lang) {
        localStorage.setItem('preferredLanguage', lang);
        loadTranslations(lang);
    }

    function loadPreferredLanguage() {
        const lang = localStorage.getItem('preferredLanguage') || 'pl';
        loadTranslations(lang);
    }

    function translatePage(lang) {
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.getAttribute('data-lang-key');
            if (translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });
        document.querySelectorAll('[data-placeholder-lang-key]').forEach(element => {
            const key = element.getAttribute('data-placeholder-lang-key');
            if (translations[lang][key]) {
                element.placeholder = translations[lang][key];
            }
        });
        document.querySelectorAll('select option').forEach(option => {
            const key = option.getAttribute('data-lang-key');
            if (translations[lang][key]) {
                option.textContent = translations[lang][key];
            }
        });
        document.documentElement.lang = lang;
    }

    document.getElementById('lang-pl').addEventListener('click', () => setLanguage('pl'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    loadPreferredLanguage();
});
