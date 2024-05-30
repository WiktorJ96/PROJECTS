/*
function fetchTranslations(lang, page) {
    return fetch(`/translations/${page}-${lang}.json`)
        .then(response => response.json())
        .catch(error => {
            console.error(`Error loading translations for ${lang}:`, error);
            return {};
        });
}
*/

function setLanguage(lang) {
    localStorage.setItem('preferredLanguage', lang);
    loadTranslations(lang);
}
function loadPreferredLanguage() {
    const lang = localStorage.getItem('preferredLanguage') || 'pl'; 
    loadTranslations(lang);
}

function loadTranslations(lang) {
    const page = document.body.getAttribute('data-page');
    fetchTranslations(lang, page).then(translations => {
        translatePage(translations);
    });
}

function translatePage(translations) {
    document.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (translations[key]) {
            element.innerHTML = translations[key];
        }
    });
    updateSentences(translations); 
}

document.getElementById('lang-pl').addEventListener('click', () => setLanguage('pl'));
document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

document.addEventListener('DOMContentLoaded', loadPreferredLanguage);

function updateSentences(translations) {
}