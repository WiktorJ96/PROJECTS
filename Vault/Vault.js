document.addEventListener('DOMContentLoaded', () => {
    const income = document.querySelector('.income-area');
    const outcome = document.querySelector('.expenses-area');
    const money = document.querySelector('.available-money');
    const addTransactionPanel = document.querySelector('.add-transaction-panel');

    const addBtn = document.querySelector('.add-transaction');
    const saveBtn = document.querySelector('.save');
    const cancelBtn = document.querySelector('.cancel');
    const deleteAllBtn = document.querySelector('.delete-all');
    const lightBtn = document.querySelector('.light');
    const darkBtn = document.querySelector('.dark');

    const nameInput = document.querySelector('#name');
    const amountInput = document.querySelector('#amount');
    const categorySelect = document.querySelector('#category');

    let root = document.documentElement;
    let ID = 0;
    let categoryIcon;
    let selectedCategory;
    let moneyArr = [0];
    let transactions = [];
    let balanceHistory = [];
    let currencyCode = 'USD';  
    let currencySymbol = '$';  
    window.selectCategory = () => {
        selectedCategory = categorySelect.options[categorySelect.selectedIndex].text;
    };

    const ctx = document.getElementById('balanceChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(58,123,213,1)');
    gradient.addColorStop(1, 'rgba(0,210,255,0.3)');

    const balanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Balance',
                    data: [],
                    backgroundColor: gradient,
                    borderColor: 'rgba(0,123,255,1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(0,123,255,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(0,123,255,1)',
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointStyle: 'circle'
                },
                {
                    label: 'Income',
                    data: [],
                    backgroundColor: 'rgba(19, 200, 109, 0.2)',
                    borderColor: 'rgba(19, 200, 109, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(19, 200, 109, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(19, 200, 109, 1)',
                    fill: false,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointStyle: 'circle',
                    hidden: true
                },
                {
                    label: 'Expenses',
                    data: [],
                    backgroundColor: 'rgba(255, 104, 104, 0.2)',
                    borderColor: 'rgba(255, 104, 104, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(255, 104, 104, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(255, 104, 104, 1)',
                    fill: false,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointStyle: 'circle',
                    hidden: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'BALANCE HISTORY',
                    font: {
                        size: 35,
                        weight: 'bold',
                        family: 'Poppins'
                    },
                    color: '#333',
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                },
                legend: {
                    onClick: (e, legendItem) => {
                        const index = legendItem.datasetIndex;
                        const ci = balanceChart;
                        const meta = ci.getDatasetMeta(index);
                        meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
                        ci.update();
                    },
                    labels: {
                        font: {
                            size: 14,
                            family: 'Poppins'
                        },
                        color: '#333',
                        usePointStyle: true,
                        padding: 20
                    },
                    onHover: (event, legendItem) => {
                        event.native.target.style.cursor = 'pointer';
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    titleFont: {
                        size: 16,
                        weight: 'bold',
                        family: 'Poppins'
                    },
                    bodyFont: {
                        size: 14,
                        family: 'Poppins'
                    },
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date',
                        font: {
                            size: 16,
                            weight: 'bold',
                            family: 'Poppins'
                        },
                        color: '#333'
                    },
                    ticks: {
                        color: '#333',
                        font: {
                            family: 'Poppins'
                        },
                        maxRotation: 0,
                        minRotation: 0
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: `Balance (${currencyCode})`,
                        font: {
                            size: 16,
                            weight: 'bold',
                            family: 'Poppins'
                        },
                        color: '#333'
                    },
                    ticks: {
                        color: '#333',
                        font: {
                            family: 'Poppins'
                        },
                        callback: function (value) {
                            return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(value);
                        }
                    },
                    grid: {
                        borderDash: [5, 5]
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutBounce'
            },
            hover: {
                animationDuration: 1000
            },
            responsiveAnimationDuration: 1000
        }
    });

    const showPanel = () => {
        addTransactionPanel.style.display = 'flex';
    };

    const closePanel = () => {
        addTransactionPanel.style.display = 'none';
        clearInputs();
    };

    const checkForm = () => {
        if (nameInput.value !== '' && amountInput.value !== '' && categorySelect.value !== 'none') {
            createNewTransaction();
        } else {
            alert('Enter all data');
        }
    };

    const clearInputs = () => {
        nameInput.value = '';
        amountInput.value = '';
        categorySelect.selectedIndex = 0;
    };

const checkCategory = transaction => {
    switch (transaction) {
        case '[ + ] Income':
        case '[ + ] Przychód':
            categoryIcon = '<i class="fas fa-money-bill-wave"></i>';
            break;
        case '[ - ] Shopping':
        case '[ - ] Zakupy':
            categoryIcon = '<i class="fas fa-cart-arrow-down"></i>';
            break;
        case '[ - ] Food':
        case '[ - ] Jedzenie':
            categoryIcon = '<i class="fas fa-hamburger"></i>';
            break;
        case '[ - ] Cinema':
        case '[ - ] Kino':
            categoryIcon = '<i class="fas fa-film"></i>';
            break;
        default:
            categoryIcon = '<i class="fas fa-question-circle"></i>'; 
            break;
    }
};


const createNewTransaction = () => {
    const newTransaction = document.createElement('div');
    newTransaction.classList.add('transaction');
    newTransaction.setAttribute('id', ID);

    selectCategory();
    console.log("Selected Category:", selectedCategory); 
    checkCategory(selectedCategory); 
    console.log("Category Icon:", categoryIcon);

    newTransaction.innerHTML = `                   
        <p class="transaction-name">${categoryIcon} ${nameInput.value}</p>
        <p class="transaction-amount ${parseFloat(amountInput.value) > 0 ? 'income' : 'expense'}">${amountInput.value}${currencySymbol}
        <button class="delete" onclick="deleteTransaction(${ID})"><i class="fas fa-times"></i></button></p>
    `;

    if (parseFloat(amountInput.value) > 0) {
        income.appendChild(newTransaction);
        newTransaction.classList.add('income');
    } else {
        outcome.appendChild(newTransaction);
        newTransaction.classList.add('expense');
    }

    const amount = parseFloat(amountInput.value);
    moneyArr.push(amount);
    transactions.push({ id: ID, name: nameInput.value, amount, category: selectedCategory });
    updateBalance();
    updateChart();

    closePanel();
    ID++;
    clearInputs();
};



    const getCurrentBalance = () => {
        return moneyArr.reduce((acc, curr) => acc + curr, 0);
    };

    const getIncome = () => {
        return transactions
            .filter(t => t.amount > 0)
            .map(t => t.amount)
            .reduce((acc, curr) => acc + curr, 0);
    };

    const getExpenses = () => {
        return transactions
            .filter(t => t.amount < 0)
            .map(t => t.amount)
            .reduce((acc, curr) => acc + curr, 0);
    };

    const updateBalance = () => {
        const balance = getCurrentBalance();
        money.textContent = `${balance.toFixed(2)}${currencySymbol}`;
        balanceHistory.push({
            date: new Date().toLocaleDateString(),
            balance,
            income: getIncome(),
            expenses: getExpenses()
        });
    };

    const updateChart = () => {
        const labels = balanceHistory.map(entry => entry.date);
        const balanceData = balanceHistory.map(entry => entry.balance);
        const incomeData = balanceHistory.map(entry => entry.income);
        const expensesData = balanceHistory.map(entry => entry.expenses);

        balanceChart.data.labels = labels;
        balanceChart.data.datasets[0].data = balanceData;
        balanceChart.data.datasets[1].data = incomeData;
        balanceChart.data.datasets[2].data = expensesData;
        balanceChart.update();
    };

    window.deleteTransaction = (id) => {
        const transactionIndex = transactions.findIndex(transaction => transaction.id === id);
        if (transactionIndex > -1) {
            transactions.splice(transactionIndex, 1);
            moneyArr.splice(transactionIndex + 1, 1);
            document.getElementById(id).remove();
            updateBalance();
            updateChart();
        }
    };

    addBtn.addEventListener('click', showPanel);
    cancelBtn.addEventListener('click', closePanel);
    saveBtn.addEventListener('click', () => {
        selectCategory();
        checkForm();
    });

    deleteAllBtn.addEventListener('click', () => {
        income.innerHTML = `<h3>${selectedLanguage === 'pl' ? 'Przychód' : 'Income'}</h3>`;
        outcome.innerHTML = `<h3>${selectedLanguage === 'pl' ? 'Wydatki' : 'Expenses'}</h3>`;
        money.textContent = `0${currencySymbol}`;
        transactions = [];
        moneyArr = [0];
        balanceHistory = [];
        updateChart();
    });

    lightBtn.addEventListener('click', () => {
        root.style.setProperty('--first-color', '#F5F7FA');
        root.style.setProperty('--second-color', '##1E2A3A');
        root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.15)');

        balanceChart.options.plugins.title.color = '#333';
        balanceChart.options.scales.x.title.color = '#333';
        balanceChart.options.scales.y.title.color = '#333';
        balanceChart.options.scales.x.ticks.color = '#333';
        balanceChart.options.scales.y.ticks.color = '#333';
        balanceChart.options.scales.x.grid.color = 'rgba(0, 0, 0, 0.1)';
        balanceChart.options.scales.y.grid.color = 'rgba(0, 0, 0, 0.1)';
        balanceChart.options.plugins.legend.labels.color = '#333';
        balanceChart.update();
    });

    darkBtn.addEventListener('click', () => {
        root.style.setProperty('--first-color', '#222');
        root.style.setProperty('--second-color', '#F9F9F9');
        root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.4)');

        balanceChart.options.plugins.title.color = '#FFF';
        balanceChart.options.scales.x.title.color = '#FFF';
        balanceChart.options.scales.y.title.color = '#FFF';
        balanceChart.options.scales.x.ticks.color = '#FFF';
        balanceChart.options.scales.y.ticks.color = '#FFF';
        balanceChart.options.scales.x.grid.color = 'rgba(255, 255, 255, 0.2)';
        balanceChart.options.scales.y.grid.color = 'rgba(255, 255, 255, 0.2)';
        balanceChart.options.plugins.legend.labels.color = '#FFF';
        balanceChart.update();
    });

    const setLanguage = (language) => {
        console.log("Setting language to:", language);
        currencyCode = language === 'pl' ? 'PLN' : 'USD';
        currencySymbol = language === 'pl' ? 'zł' : '$';
        if (language === 'pl') {
            document.querySelector('.income-area h3').textContent = 'Przychód:';
            document.querySelector('.expenses-area h3').textContent = 'Wydatki:';
            document.querySelector('.add-transaction').textContent = 'Dodaj Transakcję';
            document.querySelector('.save').textContent = 'Zapisz';
            document.querySelector('.cancel').textContent = 'Anuluj';
            document.querySelector('.delete-all').textContent = 'Usuń Wszystkie';

            balanceChart.options.plugins.title.text = 'HISTORIA SALDA';
            balanceChart.options.scales.x.title.text = 'Data';
            balanceChart.options.scales.y.title.text = 'Saldo (PLN)';
            balanceChart.data.datasets[0].label = 'Saldo';
            balanceChart.data.datasets[1].label = 'Przychody';
            balanceChart.data.datasets[2].label = 'Wydatki';
            balanceChart.options.scales.y.ticks.callback = function (value) {
                return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
            };
            balanceChart.update();
        } else if (language === 'en') {
            document.querySelector('.income-area h3').textContent = 'Income:';
            document.querySelector('.expenses-area h3').textContent = 'Expenses:';
            document.querySelector('.add-transaction').textContent = 'Add Transaction';
            document.querySelector('.save').textContent = 'Save';
            document.querySelector('.cancel').textContent = 'Cancel';
            document.querySelector('.delete-all').textContent = 'Delete All';

            balanceChart.options.plugins.title.text = 'BALANCE HISTORY';
            balanceChart.options.scales.x.title.text = 'Date';
            balanceChart.options.scales.y.title.text = 'Balance (USD)';
            balanceChart.data.datasets[0].label = 'Balance';
            balanceChart.data.datasets[1].label = 'Income';
            balanceChart.data.datasets[2].label = 'Expenses';
            balanceChart.options.scales.y.ticks.callback = function (value) {
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
            };
            balanceChart.update();
        }
        updateBalance();
    };

    const selectedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    console.log("Detected language:", selectedLanguage);
    setLanguage(selectedLanguage);
});
