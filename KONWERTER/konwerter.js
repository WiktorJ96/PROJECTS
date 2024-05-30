
const conversionFactors = {
    'iu': { 'mcg': 0.025, 'mg': 0.000025, 'g': 0.000000025 },
    'mcg': { 'mg': 0.001, 'iu': 40, 'g': 0.000001 },
    'mg': { 'mcg': 1000, 'iu': 40000, 'g': 0.001 },
    'g': { 'mcg': 1000000, 'mg': 1000, 'iu': 40000000 },
    'ml': { 'g': 1 },
    'l': { 'ml': 1000, 'g': 1000 },
};

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

function convertUnits() {
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
}

function resetCalculator() {
    document.getElementById('from-unit').value = 'iu';
    document.getElementById('to-unit').value = 'mcg';
    document.getElementById('amount').value = '';
    document.getElementById('result').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('result').textContent = '';
    document.getElementById('error').textContent = '';
}
