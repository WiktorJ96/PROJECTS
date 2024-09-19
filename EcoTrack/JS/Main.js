import { App } from "./App.js";

document.addEventListener("DOMContentLoaded", () => {
  new App();

  const preferredLanguage = localStorage.getItem("preferredLanguage");

  function setLanguage(lang) {
    localStorage.setItem("preferredLanguage", lang);
  }

  document.getElementById("lang-pl").addEventListener("click", () => setLanguage("pl"));
  document.getElementById("lang-en").addEventListener("click", () => setLanguage("en"));

  setLanguage(preferredLanguage);
});
