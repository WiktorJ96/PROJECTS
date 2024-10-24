class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById("theme-toggle");
    this.body = document.body;
    this.currentTheme = localStorage.getItem("theme") || "light";
    this.initTheme();
    this.addEventListeners();
  }

  initTheme() {
    this.setTheme(this.currentTheme);
  }

  addEventListeners() {
    this.themeToggle.addEventListener("click", () => this.toggleTheme());
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
    this.setTheme(this.currentTheme);
  }

  setTheme(theme) {
    this.currentTheme = theme;
    this.body.classList.remove("light-theme", "dark-theme");
    this.body.classList.add(this.currentTheme + "-theme");
    localStorage.setItem("theme", this.currentTheme);
    this.updateToggleButton();
    
    const event = new CustomEvent("themeChange", {
      detail: { theme: this.currentTheme },
    });
    window.dispatchEvent(event);
  }

  updateToggleButton() {
    if (this.currentTheme === "dark") {
      this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      this.themeToggle.setAttribute("aria-label", "Switch to light mode");
    } else {
      this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      this.themeToggle.setAttribute("aria-label", "Switch to dark mode");
    }
  }
}

export default ThemeManager;
