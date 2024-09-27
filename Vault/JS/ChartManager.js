class ChartManager {
  constructor(transactionManager) {
    this.transactionManager = transactionManager;
    this.chart = null;
    this.initializeChart();
    this.setupLanguageChangeListener();
    this.setupResizeListener();
    window.addEventListener("themeChange", (event) => {
      const isDark = event.detail.theme === "dark";
      this.setTheme(isDark);
    });
  }

  initializeChart() {
    const ctx = document.getElementById("balanceChart").getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(52, 152, 219, 0.6)");
    gradient.addColorStop(1, "rgba(52, 152, 219, 0.1)");

    this.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Balance",
            data: [],
            backgroundColor: gradient,
            borderColor: "rgba(52, 152, 219, 1)",
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: "rgba(52, 152, 219, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(52, 152, 219, 1)",
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointStyle: "circle",
          },
          {
            label: "Income",
            data: [],
            backgroundColor: "rgba(46, 204, 113, 0.2)",
            borderColor: "rgba(46, 204, 113, 1)",
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: "rgba(46, 204, 113, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(46, 204, 113, 1)",
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointStyle: "circle",
            hidden: true,
          },
          {
            label: "Expenses",
            data: [],
            backgroundColor: "rgba(231, 76, 60, 0.2)",
            borderColor: "rgba(231, 76, 60, 1)",
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: "rgba(231, 76, 60, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(231, 76, 60, 1)",
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
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
            display: false,
          },
          legend: {
            position: "top",
            align: "center",
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
                size: this.getResponsiveFontSize(12),
                family: "'Poppins', sans-serif",
                weight: "600",
              },
              color: "#34495e",
              usePointStyle: true,
              padding: this.getResponsivePadding(15),
            },
            onHover: (event, legendItem) => {
              event.native.target.style.cursor = "pointer";
            },
          },
          tooltip: {
            backgroundColor: "rgba(52, 73, 94, 0.8)",
            titleFont: {
              size: this.getResponsiveFontSize(14),
              weight: "600",
              family: "'Poppins', sans-serif",
            },
            bodyFont: {
              size: this.getResponsiveFontSize(12),
              family: "'Poppins', sans-serif",
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
                size: this.getResponsiveFontSize(14),
                weight: "600",
                family: "'Poppins', sans-serif",
              },
              color: "#34495e",
            },
            ticks: {
              color: "#34495e",
              font: {
                family: "'Poppins', sans-serif",
                size: this.getResponsiveFontSize(10),
              },
              maxRotation: 0,
              minRotation: 0,
              maxTicksLimit: this.getResponsiveTicksLimit(),
            },
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              font: {
                size: this.getResponsiveFontSize(14),
                weight: "600",
                family: "'Poppins', sans-serif",
              },
              color: "#34495e",
            },
            ticks: {
              color: "#34495e",
              font: {
                family: "'Poppins', sans-serif",
                size: this.getResponsiveFontSize(10),
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
              color: "rgba(52, 73, 94, 0.1)",
            },
          },
        },
        animation: {
          duration: 1500,
          easing: "easeInOutQuart",
        },
        hover: {
          animationDuration: 300,
        },
        responsiveAnimationDuration: 300,
      },
    });
  }

  getResponsiveFontSize(baseSize) {
    const width = window.innerWidth;
    if (width < 768) {
      return baseSize * 0.8;
    } else if (width < 1024) {
      return baseSize * 0.9;
    }
    return baseSize;
  }

  getResponsivePadding(basePadding) {
    const width = window.innerWidth;
    if (width < 768) {
      return basePadding * 0.6;
    } else if (width < 1024) {
      return basePadding * 0.8;
    }
    return basePadding;
  }

  getResponsiveTicksLimit() {
    const width = window.innerWidth;
    if (width < 768) {
      return 4;
    } else if (width < 1024) {
      return 6;
    }
    return 8;
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
    const textColor = isDark ? "#ecf0f1" : "#34495e";
    const gridColor = isDark
      ? "rgba(236, 240, 241, 0.1)"
      : "rgba(52, 73, 94, 0.1)";

    this.chart.options.plugins.legend.labels.color = textColor;
    this.chart.options.scales.x.title.color = textColor;
    this.chart.options.scales.y.title.color = textColor;
    this.chart.options.scales.x.ticks.color = textColor;
    this.chart.options.scales.y.ticks.color = textColor;

    this.chart.options.scales.x.grid.color = gridColor;
    this.chart.options.scales.y.grid.color = gridColor;

    if (isDark) {
      this.chart.data.datasets[0].backgroundColor = (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "rgba(52, 152, 219, 0.4)");
        gradient.addColorStop(1, "rgba(52, 152, 219, 0.05)");
        return gradient;
      };
    } else {
      this.chart.data.datasets[0].backgroundColor = (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "rgba(52, 152, 219, 0.6)");
        gradient.addColorStop(1, "rgba(52, 152, 219, 0.1)");
        return gradient;
      };
    }

    this.chart.update();
  }

  updateLanguage() {
    const lang = localStorage.getItem("preferredLanguage");

    this.chart.options.scales.x.title.text = lang === "pl" ? "Data" : "Date";

    this.chart.data.datasets[0].label = lang === "pl" ? "Saldo" : "Balance";
    this.chart.data.datasets[1].label = lang === "pl" ? "Przychody" : "Income";
    this.chart.data.datasets[2].label = lang === "pl" ? "Wydatki" : "Expenses";

    this.chart.update();
  }

  setupLanguageChangeListener() {
    window.addEventListener("languageChange", () => {
      this.updateLanguage();
    });
  }

  setupResizeListener() {
    window.addEventListener("resize", () => {
      this.updateResponsiveSettings();
    });
  }

  updateResponsiveSettings() {
    this.chart.options.plugins.legend.labels.font.size =
      this.getResponsiveFontSize(12);
    this.chart.options.plugins.legend.labels.padding =
      this.getResponsivePadding(15);
    this.chart.options.plugins.tooltip.titleFont.size =
      this.getResponsiveFontSize(14);
    this.chart.options.plugins.tooltip.bodyFont.size =
      this.getResponsiveFontSize(12);
    this.chart.options.scales.x.title.font.size =
      this.getResponsiveFontSize(14);
    this.chart.options.scales.x.ticks.font.size =
      this.getResponsiveFontSize(10);
    this.chart.options.scales.y.title.font.size =
      this.getResponsiveFontSize(14);
    this.chart.options.scales.y.ticks.font.size =
      this.getResponsiveFontSize(10);
    this.chart.options.scales.x.ticks.maxTicksLimit =
      this.getResponsiveTicksLimit();

    const width = window.innerWidth;
    if (width < 768) {
      this.chart.options.plugins.legend.position = "bottom";
    } else {
      this.chart.options.plugins.legend.position = "top";
    }

    this.chart.update();
  }
}

export default ChartManager;
