const conversionFactors = {
    'iu': { 'mcg': 0.025, 'mg': 0.000025, 'g': 0.000000025 },
    'mcg': { 'mg': 0.001, 'iu': 40, 'g': 0.000001 },
    'mg': { 'mcg': 1000, 'iu': 40000, 'g': 0.001 },
    'g': { 'mcg': 1000000, 'mg': 1000, 'iu': 40000000 },
    'ml': { 'g': 1 },
    'l': { 'ml': 1000, 'g': 1000 },
};

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

    function translate(key, params = {}) {
        const lang = document.documentElement.lang;
        let text = translations[lang][key] || key;

        for (const [paramKey, paramValue] of Object.entries(params)) {
            text = text.replace(`{${paramKey}}`, paramValue);
        }

        return text;
    }

    function showError(key) {
        const errorElement = document.getElementById('error');
        errorElement.textContent = translate(key);
        errorElement.style.display = 'block';
        document.getElementById('result').style.display = 'none';
    }

    document.getElementById('lang-pl').addEventListener('click', () => translatePage('pl'));
    document.getElementById('lang-en').addEventListener('click', () => translatePage('en'));

    // Initialize translation
    translatePage('pl');

    window.convertUnits = function () {
        const fromUnit = document.getElementById('from-unit').value;
        const toUnit = document.getElementById('to-unit').value;
        let amount = parseFloat(document.getElementById('amount').value);
        const resultElement = document.getElementById('result');
        const errorElement = document.getElementById('error');

        if (!amount) {
            showError('error_no_value');
            return;
        }

        if (fromUnit === toUnit) {
            showError('error_same_units');
            return;
        }

        if (!conversionFactors[fromUnit] || !conversionFactors[fromUnit][toUnit]) {
            showError('error_no_conversion');
            return;
        }

        const factor = conversionFactors[fromUnit][toUnit];
        const resultValue = (amount * factor).toFixed(1);
        const result = translate('result_text', { amount, fromUnit, resultValue, toUnit });
        resultElement.textContent = result;
        resultElement.style.display = 'block';
        errorElement.style.display = 'none';
    };

    window.resetCalculator = function () {
        document.getElementById('from-unit').value = 'iu';
        document.getElementById('to-unit').value = 'mcg';
        document.getElementById('amount').value = '';
        document.getElementById('result').style.display = 'none';
        document.getElementById('error').style.display = 'none';
        document.getElementById('result').textContent = '';
        document.getElementById('error').textContent = '';
    };
});
