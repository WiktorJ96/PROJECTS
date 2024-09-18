import TransactionManager from './TransactionManager.js';
import ChartManager from './ChartManager.js';
import UIManager from './UIManager.js';

document.addEventListener('DOMContentLoaded', () => {
    const transactionManager = new TransactionManager();
    const chartManager = new ChartManager(transactionManager);
    const uiManager = new UIManager(transactionManager, chartManager);

    window.uiManager = uiManager;

    const preferredLanguage = localStorage.getItem('preferredLanguage');
    uiManager.setLanguage(preferredLanguage);

    document.getElementById('lang-pl').addEventListener('click', () => uiManager.setLanguage('pl'));
    document.getElementById('lang-en').addEventListener('click', () => uiManager.setLanguage('en'));
});