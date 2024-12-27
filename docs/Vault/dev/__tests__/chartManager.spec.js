import { JSDOM } from "jsdom";
import ChartManager from "../src/scripts/ChartManager.js";

const { window } = new JSDOM(`
<!DOCTYPE html>
<html>
  <body>
    <canvas id="balanceChart"></canvas>
  </body>
</html>
`);

global.window = window;
global.document = window.document;
global.navigator = window.navigator;

global.localStorage = {
  getItem: jasmine.createSpy("getItem").and.returnValue("en"),
  setItem: jasmine.createSpy("setItem"),
  clear: jasmine.createSpy("clear"),
};

window.HTMLCanvasElement.prototype.getContext = () => {
  return {
    createLinearGradient: () => ({
      addColorStop: jasmine.createSpy("addColorStop"),
    }),
    fillRect: jasmine.createSpy("fillRect"),
    clearRect: jasmine.createSpy("clearRect"),
  };
};

/**
 * Mock class for Chart.js to simulate the Chart object during testing.
 *
 * @class MockChart
 */
class MockChart {
  /**
   * Creates a new MockChart instance.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @param {Object} config - The configuration object for the chart.
   */
  constructor(ctx, config) {
    this.ctx = ctx;
    this.config = config;

    this.data = {
      labels: [],
      datasets: [
        { data: [], backgroundColor: "" },
        { data: [], backgroundColor: "" },
        { data: [], backgroundColor: "" },
      ],
    };

    this.options = {
      plugins: {
        legend: {
          labels: {
            color: "",
            font: { size: 12 },
            titleFont: { size: 16 },
          },
        },
      },
      scales: {
        x: {
          title: {
            text: "",
            color: "",
            font: { size: 14, titleFont: { size: 16 } },
          },
          ticks: { color: "", font: {} },
          grid: { color: "" },
        },
        y: {
          title: {
            text: "",
            color: "",
            font: { size: 14, titleFont: { size: 16 } },
          },
          ticks: { color: "", font: {} },
          grid: { color: "" },
        },
      },
    };

    this.update = jasmine.createSpy("update");
  }
}

window.Chart = MockChart;
global.Chart = MockChart;

/**
 * Test suite for the ChartManager class.
 * Contains unit tests for chart initialization, updates, themes, and responsiveness.
 *
 * @module ChartManagerTest
 */
describe("ChartManager", () => {
  let chartManager;
  let mockTransactionManager;

  /**
   * Sets up the environment for each test case.
   * Initializes the mock TransactionManager and ChartManager instances.
   *
   * @method beforeEach
   * @memberof module:ChartManagerTest
   * @returns {void}
   */
  beforeEach(() => {
    mockTransactionManager = {
      transactions: [],
      currencyCode: "USD",
    };

    localStorage.getItem.calls.reset();

    chartManager = new ChartManager(mockTransactionManager);
  });

  /**
   * Tests the initialization of the chart in ChartManager.
   *
   * @method initializeChart
   * @memberof module:ChartManagerTest
   * @returns {void}
   */
  it("should initialize the chart", () => {
    expect(chartManager.chart).toBeDefined();
    expect(chartManager.chart instanceof MockChart).toBeTrue();
  });

  /**
   * Tests the update of the chart with transaction data.
   *
   * @method updateChart
   * @memberof module:ChartManagerTest
   * @returns {void}
   */
  it("should update the chart with transaction data", () => {
    mockTransactionManager.transactions = [
      { date: "2024-12-01", amount: 100 },
      { date: "2024-12-02", amount: 50 },
      { date: "2024-12-03", amount: -30 },
    ];

    chartManager.updateChart();

    const expectedLabels = ["2024-12-01", "2024-12-02", "2024-12-03"];
    const expectedBalanceData = [100, 150, 120];

    expect(chartManager.chart.data.labels).toEqual(expectedLabels);
    expect(chartManager.chart.data.datasets[0].data).toEqual(
      expectedBalanceData
    );
    expect(chartManager.chart.update).toHaveBeenCalled();
  });

  /**
   * Tests the application of the dark theme to the chart.
   *
   * @method setThemeDark
   * @memberof module:ChartManagerTest
   * @returns {void}
   */
  it("should update the chart theme to dark mode", () => {
    chartManager.setTheme(true);
    expect(chartManager.chart.options.plugins.legend.labels.color).toBe(
      "#ecf0f1"
    );
    expect(chartManager.chart.options.scales.x.title.color).toBe("#ecf0f1");
    expect(chartManager.chart.options.scales.x.grid.color).toBe(
      "rgba(236, 240, 241, 0.1)"
    );
    expect(chartManager.chart.update).toHaveBeenCalled();
  });

  /**
   * Tests the application of the light theme to the chart.
   *
   * @method setThemeLight
   * @memberof module:ChartManagerTest
   * @returns {void}
   */
  it("should update the chart theme to light mode", () => {
    chartManager.setTheme(false);
    expect(chartManager.chart.options.plugins.legend.labels.color).toBe(
      "#34495e"
    );
    expect(chartManager.chart.options.scales.x.title.color).toBe("#34495e");
    expect(chartManager.chart.options.scales.x.grid.color).toBe(
      "rgba(52, 73, 94, 0.1)"
    );
    expect(chartManager.chart.update).toHaveBeenCalled();
  });

  /**
   * Tests the language update of the chart to Polish.
   *
   * @method updateLanguagePolish
   * @memberof module:ChartManagerTest
   * @returns {void}
   */
  it("should update the language to Polish", () => {
    localStorage.getItem.and.returnValue("pl");
    chartManager.updateLanguage();

    expect(chartManager.chart.options.scales.x.title.text).toBe("Data");
    expect(chartManager.chart.data.datasets[0].label).toBe("Saldo");
    expect(chartManager.chart.update).toHaveBeenCalled();
  });

  /**
   * Tests the language update of the chart to English.
   *
   * @method updateLanguageEnglish
   * @memberof module:ChartManagerTest
   * @returns {void}
   */
  it("should update the language to English", () => {
    localStorage.getItem.and.returnValue("en");
    chartManager.updateLanguage();

    expect(chartManager.chart.options.scales.x.title.text).toBe("Date");
    expect(chartManager.chart.data.datasets[0].label).toBe("Balance");
    expect(chartManager.chart.update).toHaveBeenCalled();
  });

  /**
   * Tests the responsiveness settings of the chart.
   *
   * @method updateResponsiveSettings
   * @memberof module:ChartManagerTest
   * @returns {void}
   */
  it("should adjust settings for responsiveness manually", () => {
    spyOn(chartManager, "updateResponsiveSettings").and.callThrough();
    chartManager.updateResponsiveSettings();
    expect(chartManager.updateResponsiveSettings).toHaveBeenCalled();
    expect(
      chartManager.chart.options.plugins.legend.labels.font.size
    ).toBeGreaterThan(0);
  });
});
