class ChartManager {
  constructor(transactionManager) {
    this.transactionManager = transactionManager;
    this.chart = null;
    this.initializeChart();
    this.setupLanguageChangeListener();
  }

  initializeChart() {
    const ctx = document.getElementById("balanceChart").getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(58,123,213,1)");
    gradient.addColorStop(1, "rgba(0,210,255,0.3)");

    this.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Balance",
            data: [],
            backgroundColor: gradient,
            borderColor: "rgba(0,123,255,1)",
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: "rgba(0,123,255,1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(0,123,255,1)",
            fill: true,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointStyle: "circle",
          },
          {
            label: "Income",
            data: [],
            backgroundColor: "rgba(19, 200, 109, 0.2)",
            borderColor: "rgba(19, 200, 109, 1)",
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: "rgba(19, 200, 109, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(19, 200, 109, 1)",
            fill: false,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointStyle: "circle",
            hidden: true,
          },
          {
            label: "Expenses",
            data: [],
            backgroundColor: "rgba(255, 104, 104, 0.2)",
            borderColor: "rgba(255, 104, 104, 1)",
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: "rgba(255, 104, 104, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(255, 104, 104, 1)",
            fill: false,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointStyle: "circle",
            hidden: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "BALANCE HISTORY",
            font: {
              size: 35,
              weight: "bold",
              family: "Poppins",
            },
            color: "#333",
            padding: {
              top: 10,
              bottom: 30,
            },
          },
          legend: {
            onClick: (e, legendItem) => {
              const index = legendItem.datasetIndex;
              const ci = this.chart;
              const meta = ci.getDatasetMeta(index);
              meta.hidden =
                meta.hidden === null ? !ci.data.datasets[index].hidden : null;
              ci.update();
            },
            labels: {
              font: {
                size: 14,
                family: "Poppins",
              },
              color: "#333",
              usePointStyle: true,
              padding: 20,
            },
            onHover: (event, legendItem) => {
              event.native.target.style.cursor = "pointer";
            },
          },
          tooltip: {
            backgroundColor: "rgba(0,0,0,0.7)",
            titleFont: {
              size: 16,
              weight: "bold",
              family: "Poppins",
            },
            bodyFont: {
              size: 14,
              family: "Poppins",
            },
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: this.transactionManager.currencyCode,
                  }).format(context.parsed.y);
                }
                return label;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Date",
              font: {
                size: 16,
                weight: "bold",
                family: "Poppins",
              },
              color: "#333",
            },
            ticks: {
              color: "#333",
              font: {
                family: "Poppins",
              },
              maxRotation: 0,
              minRotation: 0,
            },
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: `Balance (${this.transactionManager.currencyCode})`,
              font: {
                size: 16,
                weight: "bold",
                family: "Poppins",
              },
              color: "#333",
            },
            ticks: {
              color: "#333",
              font: {
                family: "Poppins",
              },
              callback: (value) => {
                return new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: this.transactionManager.currencyCode,
                }).format(value);
              },
            },
            grid: {
              borderDash: [5, 5],
            },
          },
        },
        animation: {
          duration: 2000,
          easing: "easeInOutBounce",
        },
        hover: {
          animationDuration: 1000,
        },
        responsiveAnimationDuration: 1000,
      },
    });
  }

  updateChart() {
    const balanceHistory = this.transactionManager.balanceHistory;
    const labels = balanceHistory.map((entry) => entry.date);
    const balanceData = balanceHistory.map((entry) => entry.balance);
    const incomeData = balanceHistory.map((entry) => entry.income);
    const expensesData = balanceHistory.map((entry) => entry.expenses);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = balanceData;
    this.chart.data.datasets[1].data = incomeData;
    this.chart.data.datasets[2].data = expensesData;
    this.chart.update();
  }

  setTheme(isDark) {
    const textColor = isDark ? "#FFF" : "#333";
    const gridColor = isDark
      ? "rgba(255, 255, 255, 0.2)"
      : "rgba(0, 0, 0, 0.1)";

    this.chart.options.plugins.title.color = textColor;
    this.chart.options.scales.x.title.color = textColor;
    this.chart.options.scales.y.title.color = textColor;
    this.chart.options.scales.x.ticks.color = textColor;
    this.chart.options.scales.y.ticks.color = textColor;
    this.chart.options.scales.x.grid.color = gridColor;
    this.chart.options.scales.y.grid.color = gridColor;
    this.chart.options.plugins.legend.labels.color = textColor;
    this.chart.update();
  }

  setupLanguageChangeListener() {
    window.addEventListener("storage", (event) => {
      if (event.key === "preferredLanguage") {
        this.setLanguage(event.newValue);
      }
    });
  }

  setLanguage(language) {
    const currencyCode = language.startsWith("pl") ? "PLN" : "USD";
    const isPolish = language.startsWith("pl");

    this.chart.options.plugins.title.text = isPolish
      ? "HISTORIA SALDA"
      : "BALANCE HISTORY";
    this.chart.options.scales.x.title.text = isPolish ? "Data" : "Date";
    this.chart.options.scales.y.title.text = isPolish
      ? `Saldo (${currencyCode})`
      : `Balance (${currencyCode})`;
    this.chart.data.datasets[0].label = isPolish ? "Saldo" : "Balance";
    this.chart.data.datasets[1].label = isPolish ? "Przychody" : "Income";
    this.chart.data.datasets[2].label = isPolish ? "Wydatki" : "Expenses";
    this.chart.options.scales.y.ticks.callback = (value) => {
      return new Intl.NumberFormat(isPolish ? "pl-PL" : "en-US", {
        style: "currency",
        currency: currencyCode,
      }).format(value);
    };
    this.chart.update();

    localStorage.setItem("preferredLanguage", language);
  }
}

export default ChartManager;
