/**
 * Manages the chart visualization for the application.
 * Handles chart initialization, updates, responsiveness, theming, and language changes.
 */
class ChartManager {
  /**
   * Creates an instance of ChartManager.
   * Initializes the chart and sets up event listeners for theme, language changes, and responsiveness.
   *
   * @constructor
   * @param {Object} transactionManager - Instance of the transaction manager for accessing transaction data.
   */
  constructor(transactionManager) {
    /**
     * Instance of the transaction manager for accessing transaction data.
     * @type {Object}
     */
    this.transactionManager = transactionManager;
    /**
     * Chart.js chart instance.
     * @type {Chart|null}
     */
    this.chart = null;

    this.initializeChart();
    this.setupLanguageChangeListener();
    this.setupResizeListener();

    window.addEventListener("themeChange", (event) => {
      const isDark = event.detail.theme === "dark";
      this.setTheme(isDark);
    });
  }

  /**
   * Initializes the Chart.js chart instance.
   */
  initializeChart() {
    const canvas = document.getElementById("balanceChart");
    if (!canvas) {
      throw new Error("Canvas element with ID 'balanceChart' not found");
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Unable to get '2d' context from canvas element");
    }

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
    this.updateLanguage();
  }

  /**
   * Calculates the appropriate font size based on the screen width.
   * @param {number} baseSize - The base font size to adjust.
   * @returns {number} Adjusted font size.
   */
  getResponsiveFontSize(baseSize) {
    const width = window.innerWidth;
    if (width < 768) {
      return baseSize * 0.8;
    } else if (width < 1024) {
      return baseSize * 0.9;
    }
    return baseSize;
  }

  /**
   * Calculates appropriate padding based on the screen width.
   * @param {number} basePadding - The base padding to adjust.
   * @returns {number} Adjusted padding.
   */
  getResponsivePadding(basePadding) {
    const width = window.innerWidth;
    if (width < 768) {
      return basePadding * 0.6;
    } else if (width < 1024) {
      return basePadding * 0.8;
    }
    return basePadding;
  }

  /**
   * Determines the maximum number of ticks to display on the x-axis based on screen width.
   * @returns {number} Maximum ticks limit.
   */
  getResponsiveTicksLimit() {
    const width = window.innerWidth;
    if (width < 768) {
      return 4;
    } else if (width < 1024) {
      return 6;
    }
    return 8;
  }

  /**
   * Updates the chart data and refreshes the chart display.
   */
  updateChart() {
    const transactions = this.transactionManager.transactions || [];

    if (transactions.length === 0) {
      console.log("Brak danych do zaktualizowania wykresu.");
      return;
    }

    const labels = transactions.map((entry) => {
      const date = new Date(entry.date);
      return date.toISOString().split("T")[0];
    });

    const balanceData = transactions.reduce((acc, transaction) => {
      const lastBalance = acc.length > 0 ? acc[acc.length - 1] : 0;
      acc.push(lastBalance + transaction.amount);
      return acc;
    }, []);

    console.log("Dane do wykresu (saldo):", balanceData);

    // Aktualizacja danych wykresu
    this.chart.data.labels = labels; // Daty jako etykiety x-axis
    this.chart.data.datasets[0].data = balanceData; // Saldo
    this.chart.data.datasets[1].data = []; // Wyzerowanie innych linii, jeśli nie są używane
    this.chart.data.datasets[2].data = [];

    this.chart.update();
  }

  /**
   * Updates the chart's theme based on the current mode (light or dark).
   * @param {boolean} isDark - True if the theme is dark, false otherwise.
   */
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

  /**
   * Updates the chart's labels and language-dependent content based on the current language.
   */
  updateLanguage() {
    if (!this.chart || !this.chart.options || !this.chart.options.scales) {
      console.warn("Chart or its scales are not initialized yet.");
      return;
    }

    const lang = localStorage.getItem("preferredLanguage");

    this.chart.options.scales.x.title.text = lang === "pl" ? "Data" : "Date";
    this.chart.data.datasets[0].label = lang === "pl" ? "Saldo" : "Balance";
    this.chart.data.datasets[1].label = lang === "pl" ? "Przychody" : "Income";
    this.chart.data.datasets[2].label = lang === "pl" ? "Wydatki" : "Expenses";

    this.chart.update();
  }

  /**
   * Sets up a listener to update the chart's language when the language changes.
   */
  setupLanguageChangeListener() {
    window.addEventListener("languageChange", () => {
      this.updateLanguage();
    });
  }

  /**
   * Sets up a listener to adjust chart settings on window resize.
   */
  setupResizeListener() {
    window.addEventListener("resize", () => {
      this.updateResponsiveSettings();
    });
  }

  /**
   * Updates the chart's settings for responsiveness based on the current window size.
   */
  updateResponsiveSettings() {
    if (!this.chart.options.plugins.legend.labels.font) {
      this.chart.options.plugins.legend.labels.font = {};
    }
    this.chart.options.plugins.legend.labels.font.size =
      this.getResponsiveFontSize(12);

    this.chart.options.plugins.legend.labels.padding =
      this.getResponsivePadding(15);

    if (!this.chart.options.plugins.tooltip) {
      this.chart.options.plugins.tooltip = { titleFont: {}, bodyFont: {} };
    }
    if (!this.chart.options.plugins.tooltip.titleFont) {
      this.chart.options.plugins.tooltip.titleFont = {};
    }
    if (!this.chart.options.plugins.tooltip.bodyFont) {
      this.chart.options.plugins.tooltip.bodyFont = {};
    }
    this.chart.options.plugins.tooltip.titleFont.size =
      this.getResponsiveFontSize(14);
    this.chart.options.plugins.tooltip.bodyFont.size =
      this.getResponsiveFontSize(12);

    if (!this.chart.options.scales.x.title.font) {
      this.chart.options.scales.x.title.font = {};
    }
    this.chart.options.scales.x.title.font.size =
      this.getResponsiveFontSize(14);

    if (!this.chart.options.scales.x.ticks.font) {
      this.chart.options.scales.x.ticks.font = {};
    }
    this.chart.options.scales.x.ticks.font.size =
      this.getResponsiveFontSize(10);

    if (!this.chart.options.scales.y.title.font) {
      this.chart.options.scales.y.title.font = {};
    }
    this.chart.options.scales.y.title.font.size =
      this.getResponsiveFontSize(14);

    if (!this.chart.options.scales.y.ticks.font) {
      this.chart.options.scales.y.ticks.font = {};
    }
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
